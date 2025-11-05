const express = require('express');
const Student = require('../models/Student');
const GameSession = require('../models/GameSession');
const { auth, teacherAuth } = require('../middleware/auth');
const router = express.Router();

// Optional auth middleware - allows requests with or without token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // Check if user is student or teacher
        let user = await Student.findById(decoded.id);
        if (!user) {
          const Teacher = require('../models/Teacher');
          user = await Teacher.findById(decoded.id);
          if (user) {
            req.userType = 'teacher';
          }
        } else {
          req.userType = 'student';
        }

        if (user) {
          req.user = user;
          req.userId = decoded.id;
        }
      } catch (error) {
        // Token invalid, but continue without auth
        console.log('Optional auth: Invalid token, continuing without auth');
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Get student progress by USN (Teacher only, but allow without auth for now)
router.get('/student/:usn', optionalAuth, async (req, res) => {
  try {
    const { usn } = req.params;
    
    const student = await Student.findOne({ usn: usn.toUpperCase() })
      .select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get game statistics
    const totalSessions = await GameSession.countDocuments({ studentId: student._id });
    const correctSessions = await GameSession.countDocuments({ 
      studentId: student._id, 
      isCorrect: true 
    });
    
    const accuracy = totalSessions > 0 ? (correctSessions / totalSessions * 100).toFixed(2) : 0;

    const progressReport = {
      studentId: student._id,
      name: student.name,
      usn: student.usn,
      email: student.email,
      phone: student.phone,
      profilePicture: student.profilePicture,
      streakLevel: student.streakLevel,
      totalBadges: student.totalBadges,
      badges: student.badges,
      wins: student.wins,
      easyLevelCompleted: student.easyLevelCompleted,
      intermediateLevelCompleted: student.intermediateLevelCompleted,
      hardLevelCompleted: student.hardLevelCompleted,
      gameProgress: student.gameProgress || [],
      totalSessions,
      correctSessions,
      accuracy: `${accuracy}%`,
      lastPlayedDate: student.lastPlayedDate,
      dailyPlayTime: student.dailyPlayTime
    };

    res.json(progressReport);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all students progress (Teacher only, but allow without auth for now)
router.get('/all', optionalAuth, async (req, res) => {
  try {
    const students = await Student.find()
      .select('name usn email profilePicture streakLevel easyLevelCompleted intermediateLevelCompleted hardLevelCompleted totalBadges wins gameProgress')
      .sort({ easyLevelCompleted: -1, intermediateLevelCompleted: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

