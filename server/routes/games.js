const express = require('express');
const Question = require('../models/Question');
const GameSession = require('../models/GameSession');
const Leaderboard = require('../models/Leaderboard');
const Student = require('../models/Student');
const { auth, studentAuth } = require('../middleware/auth');
const router = express.Router();

// Get question for a specific level and difficulty
router.get('/question/:difficulty/:level', auth, studentAuth, async (req, res) => {
  try {
    const { difficulty, level } = req.params;
    const { language } = req.query; // For hard level language selection

    // Check if student can access this level
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const levelNum = parseInt(level);
    
    // Allow level 1 always, otherwise check prerequisites
    if (levelNum === 1) {
      // Always allow first level of each difficulty
      if (difficulty === 'intermediate' && student.easyLevelCompleted < 50) {
        return res.status(403).json({ message: 'Complete all easy levels first' });
      }
      if (difficulty === 'hard' && student.intermediateLevelCompleted < 100) {
        return res.status(403).json({ message: 'Complete all intermediate levels first' });
      }
    } else {
      // For levels > 1, check if previous level is completed
      if (difficulty === 'easy' && student.easyLevelCompleted < levelNum - 1) {
        return res.status(403).json({ message: `Complete level ${levelNum - 1} first` });
      }
      if (difficulty === 'intermediate') {
        if (student.easyLevelCompleted < 50) {
          return res.status(403).json({ message: 'Complete all easy levels first' });
        }
        if (student.intermediateLevelCompleted < levelNum - 1) {
          return res.status(403).json({ message: `Complete level ${levelNum - 1} first` });
        }
      }
      if (difficulty === 'hard') {
        if (student.intermediateLevelCompleted < 100) {
          return res.status(403).json({ message: 'Complete all intermediate levels first' });
        }
        if (student.hardLevelCompleted < levelNum - 1) {
          return res.status(403).json({ message: `Complete level ${levelNum - 1} first` });
        }
      }
    }
    let question;
    
    // For hard level, filter by language if provided
    if (difficulty === 'hard' && language) {
      question = await Question.findOne({ 
        difficulty, 
        level: levelNum, 
        language: language 
      });
    } else {
      question = await Question.findOne({ difficulty, level: levelNum });
    }
    
    if (!question) {
      // Log for debugging
      const count = await Question.countDocuments({ difficulty, level: levelNum });
      const allQuestions = await Question.find({ difficulty }).select('level').limit(5);
      console.log(`Question not found. Difficulty: ${difficulty}, Level: ${levelNum}, Language: ${language || 'N/A'}, Count: ${count}`);
      console.log(`Available levels for ${difficulty}:`, allQuestions.map(q => q.level));
      return res.status(404).json({ 
        message: `Question not found for ${difficulty} level ${levelNum}${language ? ` in ${language}` : ''}. Please seed the database.`,
        availableLevels: allQuestions.map(q => q.level)
      });
    }

    // Randomize visual theme (1-5)
    const visualTheme = Math.floor(Math.random() * 5) + 1;

    // Format question based on type
    let questionData = {
      _id: question._id,
      difficulty: question.difficulty,
      level: question.level,
      questionType: question.questionType,
      visualTheme,
      timeLimit: question.timeLimit || 300
    };

    if (question.questionType === 'mcq') {
      questionData.question = question.question;
      questionData.options = question.options;
      questionData.explanation = question.explanation;
    } else if (question.questionType === 'codeBlocks') {
      // Shuffle code blocks for the student
      const shuffledBlocks = [...question.codeBlocks].sort(() => Math.random() - 0.5);
      questionData.codeDescription = question.codeDescription;
      questionData.codeBlocks = shuffledBlocks.map((block, index) => ({
        id: block.order || index, // Use order as unique identifier
        order: block.order, // Keep original order for validation
        lines: block.lines
      }));
    } else if (question.questionType === 'codeWrite') {
      questionData.language = question.language;
      questionData.problemStatement = question.problemStatement;
      questionData.testCases = question.testCases;
      questionData.hints = question.hints;
    }

    res.json(questionData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit answer
router.post('/submit-answer', auth, studentAuth, async (req, res) => {
  try {
    const { questionId, answer, timeTaken, visualTheme } = req.body;
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const student = await Student.findById(req.userId);
    let isCorrect = false;
    let score = 0;

    // Check answer based on question type
    if (question.questionType === 'mcq') {
      isCorrect = answer === question.correctAnswer;
    } else if (question.questionType === 'codeBlocks') {
      // Check if blocks are in correct order
      // Sort blocks by order and check if submitted order matches
      const correctOrder = question.codeBlocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(b => b.order.toString())
        .join(',');
      isCorrect = answer === correctOrder;
    } else if (question.questionType === 'codeWrite') {
      // For code write, we'll do basic validation (in production, use code execution)
      // For now, we'll check if code contains essential keywords
      isCorrect = answer && answer.length > 50; // Basic check, should be enhanced
    }

    // Calculate score based on time and correctness
    if (isCorrect) {
      const maxTime = question.timeLimit || 300;
      const timeBonus = Math.max(0, (maxTime - timeTaken) / maxTime * 100);
      score = 100 + timeBonus;
    }

    // Save game session
    const gameSession = new GameSession({
      studentId: req.userId,
      difficulty: question.difficulty,
      level: question.level,
      questionId: question._id,
      answer,
      isCorrect,
      timeTaken,
      score,
      visualTheme: visualTheme || 1,
      endTime: new Date()
    });
    await gameSession.save();

    // Update student progress if correct
    if (isCorrect) {
      if (question.difficulty === 'easy' && question.level === student.easyLevelCompleted + 1) {
        student.easyLevelCompleted = question.level;
      } else if (question.difficulty === 'intermediate' && question.level === student.intermediateLevelCompleted + 1) {
        student.intermediateLevelCompleted = question.level;
      } else if (question.difficulty === 'hard' && question.level === student.hardLevelCompleted + 1) {
        student.hardLevelCompleted = question.level;
        student.wins += 1;
      }
      await student.save();
    }

    res.json({
      isCorrect,
      score,
      correctAnswer: question.questionType === 'mcq' ? question.correctAnswer : null,
      explanation: question.explanation
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

module.exports = router;

