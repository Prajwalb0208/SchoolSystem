const express = require('express');
const Question = require('../models/Question');
const GameSession = require('../models/GameSession');
const QuizSession = require('../models/QuizSession');
const Leaderboard = require('../models/Leaderboard');
const Student = require('../models/Student');
const Checkpoint = require('../models/Checkpoint');
const { auth, studentAuth } = require('../middleware/auth');
const router = express.Router();

// Get quiz (5 questions) - coding questions only, no repeats, random order
router.get('/quiz/:gameType', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { usn } = req.query;
    const studentId = req.userId;

    // Get student to check answered questions
    let student = await Student.findById(studentId);
    
    // If no student found but USN provided, try to find by USN
    if (!student && usn) {
      student = await Student.findOne({ usn: usn.toUpperCase() });
      if (!student) {
        // Create or update student record with USN
        student = await Student.findOneAndUpdate(
          { usn: usn.toUpperCase() },
          { 
            usn: usn.toUpperCase(),
            username: usn.toUpperCase(),
            email: `${usn.toLowerCase()}@student.com`,
            password: 'temp', // Will be updated later
            name: usn.toUpperCase(),
            phone: '0000000000',
            dob: new Date()
          },
          { upsert: true, new: true }
        );
      }
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found. Please provide USN.' });
    }

    // Fetch easy coding questions (MCQ type)
    let allQuestions = await Question.find({ 
      difficulty: 'easy',
      questionType: 'mcq'
    });

    // Filter out already answered questions
    const answeredQuestionIds = student.answeredQuestions || [];
    const availableQuestions = allQuestions.filter(
      q => !answeredQuestionIds.some(id => id.toString() === q._id.toString())
    );

    // If not enough new questions, use all questions but shuffle
    const questionsToUse = availableQuestions.length >= 5 
      ? availableQuestions 
      : allQuestions;

    // Shuffle and take 5
    const shuffled = questionsToUse.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 5);

    if (selectedQuestions.length < 5) {
      return res.status(404).json({ 
        message: `Not enough questions available. Found ${selectedQuestions.length} questions.`,
        found: selectedQuestions.length
      });
    }

    // Format questions
    const quizData = selectedQuestions.map(question => ({
      _id: question._id,
      difficulty: question.difficulty,
      questionType: question.questionType,
      question: question.question,
      options: question.options,
      explanation: question.explanation,
      timeLimit: question.timeLimit || 300
    }));

    res.json({
      questions: quizData,
      gameType,
      totalQuestions: 5,
      passingScore: 3
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz (all 5 answers at once) - track game progress
router.post('/submit-quiz', auth, async (req, res) => {
  try {
    const { gameType, answers, totalTimeTaken, gameScore, usn } = req.body;
    
    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({ message: 'Please provide answers for all 5 questions' });
    }

    let student = await Student.findById(req.userId);
    
    // If no student found but USN provided, find or create by USN
    if (!student && usn) {
      student = await Student.findOne({ usn: usn.toUpperCase() });
      if (!student) {
        student = await Student.findOneAndUpdate(
          { usn: usn.toUpperCase() },
          { 
            usn: usn.toUpperCase(),
            username: usn.toUpperCase(),
            email: `${usn.toLowerCase()}@student.com`,
            password: 'temp',
            name: usn.toUpperCase(),
            phone: '0000000000',
            dob: new Date()
          },
          { upsert: true, new: true }
        );
      }
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    if (questions.length !== 5) {
      return res.status(404).json({ message: 'Some questions not found' });
    }

    // Check each answer
    const quizAnswers = [];
    let correctCount = 0;
    let totalScore = 0;

    for (let i = 0; i < answers.length; i++) {
      const answerData = answers[i];
      const question = questions.find(q => q._id.toString() === answerData.questionId);
      
      if (!question) continue;

      let isCorrect = false;
      let score = 0;

      // Check answer based on question type
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
        const timeBonus = Math.max(0, (maxTime - answerData.timeTaken) / maxTime * 100);
        score = 100 + timeBonus;
        totalScore += score;
      }

      quizAnswers.push({
        questionId: question._id,
        answer: answerData.answer,
        isCorrect,
        timeTaken: answerData.timeTaken
      });

      // Save individual game session for tracking
      const gameSession = new GameSession({
        studentId: req.userId,
        difficulty: question.difficulty || 'easy',
        level: question.level || 1,
        questionId: question._id,
        answer: answerData.answer,
        isCorrect,
        timeTaken: answerData.timeTaken,
        score,
        endTime: new Date()
      });
      await gameSession.save();
    }

    // Check if passed (at least 3 correct out of 5)
    const passed = correctCount >= 3;

    // Save quiz session
    const quizSession = new QuizSession({
      studentId: req.userId,
      difficulty: 'easy',
      level: 1,
      questionIds,
      answers: quizAnswers,
      endTime: new Date(),
      totalTimeTaken,
      correctAnswers: correctCount,
      totalQuestions: 5,
      passed,
      score: totalScore
    });
    await quizSession.save();

    // Track answered questions (prevent repeats)
    const newAnsweredQuestions = [...new Set([
      ...(student.answeredQuestions || []).map(id => id.toString()),
      ...questionIds.map(id => id.toString())
    ])];
    student.answeredQuestions = newAnsweredQuestions;

    // Update game-specific progress
    if (gameType) {
      let gameProgress = student.gameProgress || [];
      let gameIndex = gameProgress.findIndex(g => g.gameType === gameType);
      
      if (gameIndex === -1) {
        gameProgress.push({
          gameType,
          totalScore: gameScore || 0,
          gamesPlayed: 1,
          quizzesPassed: passed ? 1 : 0,
          lastPlayed: new Date()
        });
      } else {
        gameProgress[gameIndex].totalScore += (gameScore || 0);
        gameProgress[gameIndex].gamesPlayed += 1;
        if (passed) {
          gameProgress[gameIndex].quizzesPassed += 1;
        }
        gameProgress[gameIndex].lastPlayed = new Date();
      }
      student.gameProgress = gameProgress;
    }

    // Update student progress if passed
    if (passed) {
      // Update streak
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

    res.json({
      passed,
      correctAnswers: correctCount,
      totalQuestions: 5,
      score: totalScore,
      answers: quizAnswers.map((a, idx) => ({
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        correctAnswer: questions.find(q => q._id.toString() === a.questionId)?.questionType === 'mcq' 
          ? questions.find(q => q._id.toString() === a.questionId)?.correctAnswer 
          : null,
        explanation: questions.find(q => q._id.toString() === a.questionId)?.explanation
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

module.exports = router;

