import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import GameSession from '../models/GameSession.js';
import QuizSession from '../models/QuizSession.js';
import Leaderboard from '../models/Leaderboard.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Checkpoint from '../models/Checkpoint.js';
import { auth, studentAuth } from '../middleware/auth.js';
import { QUIZ_BANK } from '../data/staticQuizQuestions.js';

const router = express.Router();

const QUIZ_SETTINGS = {
  minQuestions: 3,
  defaultCount: 5,
  sessionTtlMs: 10 * 60 * 1000 // 10 minutes
};

const activeQuizSessions = new Map();

const cleanupExpiredSessions = () => {
  const now = Date.now();
  for (const [quizId, session] of activeQuizSessions.entries()) {
    if (session.expiresAt <= now) {
      activeQuizSessions.delete(quizId);
    }
  }
};

const getQuestionPoolForGame = (gameType = 'default') => {
  const normalized = (gameType || 'default').toLowerCase();
  return QUIZ_BANK[normalized] || QUIZ_BANK.default || [];
};

const pickQuestions = (pool, count) => {
  const copy = [...pool];
  copy.sort(() => Math.random() - 0.5);
  const targetCount = Math.max(QUIZ_SETTINGS.minQuestions, Math.min(count, copy.length));
  return copy.slice(0, targetCount);
};

const sanitizeQuestion = (question) => ({
  _id: question._id?.toString() || question._id,
  difficulty: question.difficulty || 'easy',
  questionType: question.questionType || 'mcq',
  question: question.question,
  options: question.options || [],
  explanation: question.explanation || '',
  correctAnswer: question.correctAnswer,
  timeLimit: question.timeLimit || 300
});

// Optional auth middleware for quiz
const optionalAuthQuiz = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        let user = await Student.findById(decoded.id);
        if (!user) {
          user = await Teacher.findById(decoded.id);
        }
        if (user) {
          req.userId = decoded.id;
        }
      } catch (error) {
        // Token invalid, continue without auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Get quiz (local bank, random order)
router.get('/quiz/:gameType', optionalAuthQuiz, async (req, res) => {
  try {
    const { gameType } = req.params;
    const pool = getQuestionPoolForGame(gameType);

    if (!pool.length) {
      return res.status(500).json({ message: 'Quiz bank is empty. Please add questions.' });
    }

    cleanupExpiredSessions();

    const selectedQuestions = pickQuestions(pool, QUIZ_SETTINGS.defaultCount);
    if (selectedQuestions.length < QUIZ_SETTINGS.minQuestions) {
      return res.status(500).json({ message: 'Quiz bank does not have enough unique questions.' });
    }

    const quizId = randomUUID();
    activeQuizSessions.set(quizId, {
      questions: selectedQuestions,
      createdAt: Date.now(),
      expiresAt: Date.now() + QUIZ_SETTINGS.sessionTtlMs,
      gameType
    });

    const sanitizedQuestions = selectedQuestions.map(sanitizeQuestion);
    const totalQuestions = sanitizedQuestions.length;
    const passingScore = Math.max(2, Math.ceil(totalQuestions * 0.6));

    res.json({
      quizId,
      questions: sanitizedQuestions,
      gameType,
      totalQuestions,
      passingScore,
      source: 'local'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz (all 5 answers at once) - track game progress
router.post('/submit-quiz', optionalAuthQuiz, async (req, res) => {
  try {
    const { gameType, answers, totalTimeTaken, gameScore, level, usn, quizId } = req.body;
    
    if (!quizId) {
      return res.status(400).json({ message: 'quizId is required' });
    }

    if (!answers || !Array.isArray(answers) || answers.length < QUIZ_SETTINGS.minQuestions) {
      return res.status(400).json({ message: `Please provide at least ${QUIZ_SETTINGS.minQuestions} answers` });
    }

    const session = activeQuizSessions.get(quizId);
    if (!session) {
      return res.status(410).json({ message: 'Quiz expired or not found. Please start a new quiz.' });
    }

    let student = await Student.findById(req.userId);
    
    if (!student && usn) {
      student = await Student.findOne({ usn: usn.toUpperCase() });
      if (!student) {
        student = await Student.findOneAndUpdate(
          { usn: usn.toUpperCase() },
          { 
            usn: usn.toUpperCase(),
            username: usn.toUpperCase(),
            email: `${usn.toLowerCase()}@student.com`,
            password: 'temp123456',
            name: usn.toUpperCase(),
            phone: '0000000000',
            dob: new Date('2000-01-01')
          },
          { upsert: true, new: true }
        );
      }
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found. Please provide USN.' });
    }

    const questions = session.questions;
    const questionMap = new Map(questions.map(q => [q._id?.toString() || q._id, q]));
    const questionIds = questions.map(q => q._id?.toString() || q._id);

    const quizAnswers = [];
    let correctCount = 0;
    let totalScore = 0;

    for (let i = 0; i < answers.length; i++) {
      const answerData = answers[i];
      const question = questionMap.get(answerData.questionId?.toString());
      if (!question) continue;

      let isCorrect = false;
      let score = 0;

      if (question.questionType === 'mcq') {
        isCorrect = answerData.answer === question.correctAnswer;
      } else if (question.questionType === 'codeBlocks') {
        const correctOrder = question.codeBlocks
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(b => b.order.toString())
          .join(',');
        isCorrect = answerData.answer === correctOrder;
      } else if (question.questionType === 'codeWrite') {
        isCorrect = answerData.answer && answerData.answer.length > 50;
      }

      if (isCorrect) {
        correctCount++;
        const maxTime = question.timeLimit || 300;
        const timeBonus = Math.max(0, (maxTime - (answerData.timeTaken || 0)) / maxTime * 100);
        score = 100 + timeBonus;
        totalScore += score;
      }

      quizAnswers.push({
        questionId: question._id?.toString() || question._id,
        question: question.question,
        options: question.options,
        answer: answerData.answer,
        isCorrect,
        correctAnswer: question.correctAnswer,
        timeTaken: answerData.timeTaken || 0,
        explanation: question.explanation || ''
      });

      if (student._id) {
        const gameSession = new GameSession({
          studentId: student._id,
          difficulty: question.difficulty || 'easy',
          level: level || 1,
          questionId: question._id,
          answer: answerData.answer,
          isCorrect,
          timeTaken: answerData.timeTaken || 0,
          score,
          endTime: new Date()
        });
        await gameSession.save();
      }
    }

    const totalQuestions = questions.length;
    const passingScore = Math.max(2, Math.ceil(totalQuestions * 0.6));
    const passed = correctCount >= passingScore;

    if (student._id) {
      const quizSession = new QuizSession({
        studentId: student._id,
        difficulty: 'easy',
        level: level || 1,
        questionIds,
        answers: quizAnswers,
        endTime: new Date(),
        totalTimeTaken,
        correctAnswers: correctCount,
        totalQuestions,
        passed,
        score: totalScore
      });
      await quizSession.save();
    }

    if (gameType) {
      let gameProgress = student.gameProgress || [];
      let gameIndex = gameProgress.findIndex(g => g.gameType === gameType);
      
      if (gameIndex === -1) {
        gameProgress.push({
          gameType,
          totalScore: gameScore || 0,
          gamesPlayed: 1,
          quizzesPassed: passed ? 1 : 0,
          lastPlayed: new Date(),
          levelProgress: {}
        });
        gameIndex = gameProgress.length - 1;
      } else {
        gameProgress[gameIndex].totalScore += (gameScore || 0);
        gameProgress[gameIndex].gamesPlayed += 1;
        if (passed) {
          gameProgress[gameIndex].quizzesPassed += 1;
        }
        gameProgress[gameIndex].lastPlayed = new Date();
      }
      
      const currentLevel = level || 1;
      if (!gameProgress[gameIndex].levelProgress) {
        gameProgress[gameIndex].levelProgress = {};
      }
      const levelProgress = gameProgress[gameIndex].levelProgress || {};
      const levelKey = currentLevel.toString();
      const currentLevelData = levelProgress[levelKey] || { score: 0, quizzesPassed: 0 };
      currentLevelData.score += (gameScore || 0);
      if (passed) {
        currentLevelData.quizzesPassed += 1;
      }
      levelProgress[levelKey] = currentLevelData;
      gameProgress[gameIndex].levelProgress = levelProgress;
      
      student.gameProgress = gameProgress;
    }

    if (passed) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastPlayed = student.lastPlayedDate ? new Date(student.lastPlayedDate) : null;
      const lastPlayedDate = lastPlayed ? new Date(lastPlayed.setHours(0, 0, 0, 0)) : null;

      if (!lastPlayedDate || lastPlayedDate.getTime() !== today.getTime()) {
        if (lastPlayedDate && (today - lastPlayedDate) === 86400000) {
          student.streakLevel += 1;
        } else {
          student.streakLevel = 1;
          student.currentStreakStart = today;
        }
        student.lastPlayedDate = today;
      }
    }
    
    await student.save();
    activeQuizSessions.delete(quizId);

    res.json({
      passed,
      correctAnswers: correctCount,
      totalQuestions,
      score: totalScore,
      answers: quizAnswers.map(a => ({
        questionId: a.questionId,
        question: a.question,
        options: a.options,
        userAnswer: a.answer,
        isCorrect: a.isCorrect,
        correctAnswer: a.correctAnswer,
        explanation: a.explanation
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard for a level
router.get('/leaderboard/:difficulty/:level', auth, async (req, res) => {
  try {
    const { difficulty, level } = req.params;

    let leaderboard = await Leaderboard.findOne({ difficulty, level });
    
    if (!leaderboard) {
      leaderboard = new Leaderboard({
        difficulty,
        level,
        entries: []
      });
      await leaderboard.save();
    }

    // Sort entries by score (descending) and time (ascending)
    leaderboard.entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });

    // Populate student details
    const populatedEntries = await Promise.all(
      leaderboard.entries.slice(0, 100).map(async (entry) => {
        const student = await Student.findById(entry.studentId).select('name usn profilePicture');
        return {
          ...entry.toObject(),
          studentName: student?.name || 'Unknown',
          studentUSN: student?.usn || 'N/A',
          studentProfilePic: student?.profilePicture || ''
        };
      })
    );

    res.json({
      difficulty,
      level,
      entries: populatedEntries
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add entry to leaderboard (for hard level - first 5 only)
router.post('/leaderboard/add', auth, studentAuth, async (req, res) => {
  try {
    const { difficulty, level, score, timeTaken } = req.body;

    let leaderboard = await Leaderboard.findOne({ difficulty, level });
    
    if (!leaderboard) {
      leaderboard = new Leaderboard({
        difficulty,
        level,
        entries: []
      });
    }

    // Check if student already has an entry
    const existingIndex = leaderboard.entries.findIndex(
      e => e.studentId.toString() === req.userId.toString()
    );

    const student = await Student.findById(req.userId);
    
    const entry = {
      studentId: req.userId,
      studentName: student.name,
      studentUSN: student.usn,
      studentProfilePic: student.profilePicture,
      score,
      timeTaken,
      completedAt: new Date()
    };

    if (existingIndex >= 0) {
      leaderboard.entries[existingIndex] = entry;
    } else {
      leaderboard.entries.push(entry);
    }

    // Sort by score and time
    leaderboard.entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });

    // For hard level, keep only top 5
    if (difficulty === 'hard') {
      leaderboard.entries = leaderboard.entries.slice(0, 5);
    }

    await leaderboard.save();

    // Check if student made it to top 5 (hard level)
    const position = leaderboard.entries.findIndex(
      e => e.studentId.toString() === req.userId.toString()
    );

    res.json({
      message: 'Leaderboard updated',
      position: position >= 0 ? position + 1 : null,
      passed: difficulty === 'hard' ? position >= 0 && position < 5 : true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check badge eligibility (5 questions in 45 sec each)
router.post('/check-badge', auth, studentAuth, async (req, res) => {
  try {
    const { difficulty } = req.body;
    
    if (difficulty !== 'intermediate') {
      return res.json({ eligible: false });
    }

    // Get last 5 game sessions for intermediate level
    const recentSessions = await GameSession.find({
      studentId: req.userId,
      difficulty: 'intermediate',
      isCorrect: true
    })
    .sort({ completedAt: -1 })
    .limit(5);

    if (recentSessions.length < 5) {
      return res.json({ eligible: false });
    }

    // Check if all 5 were completed in 45 seconds or less
    const allWithinTime = recentSessions.every(session => session.timeTaken <= 45);
    const isConsecutive = recentSessions.length === 5;

    if (allWithinTime && isConsecutive) {
      const student = await Student.findById(req.userId);
      
      // Check if already has gold badge
      const hasGoldBadge = student.badges.some(b => b.type === 'gold');
      
      if (!hasGoldBadge) {
        student.badges.push({
          type: 'gold',
          description: 'Completed 5 intermediate questions in 45 seconds each',
          earnedAt: new Date()
        });
        student.totalBadges += 1;
        await student.save();
        
        return res.json({ eligible: true, badgeEarned: true });
      }
    }

    res.json({ eligible: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save checkpoint
router.post('/checkpoint/save', auth, async (req, res) => {
  try {
    const { gameType, gameState, score, level } = req.body;

    // Deactivate old checkpoint for this game
    await Checkpoint.updateMany(
      { studentId: req.userId, gameType, isActive: true },
      { isActive: false }
    );

    // Create new checkpoint
    const checkpoint = new Checkpoint({
      studentId: req.userId,
      gameType,
      gameState,
      score: score || 0,
      level: level || 1
    });
    await checkpoint.save();

    res.json({ 
      success: true, 
      checkpointId: checkpoint._id,
      message: 'Checkpoint saved successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Load checkpoint
router.get('/checkpoint/:gameType', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    
    const checkpoint = await Checkpoint.findOne({
      studentId: req.userId,
      gameType,
      isActive: true
    }).sort({ timestamp: -1 });

    if (!checkpoint) {
      return res.status(404).json({ message: 'No checkpoint found' });
    }

    res.json({
      checkpointId: checkpoint._id,
      gameState: checkpoint.gameState,
      score: checkpoint.score,
      level: checkpoint.level,
      timestamp: checkpoint.timestamp
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete checkpoint
router.delete('/checkpoint/:gameType', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    
    await Checkpoint.updateMany(
      { studentId: req.userId, gameType, isActive: true },
      { isActive: false }
    );

    res.json({ success: true, message: 'Checkpoint deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
