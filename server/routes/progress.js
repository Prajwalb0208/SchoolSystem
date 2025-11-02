const express = require('express');
const Student = require('../models/Student');
const GameSession = require('../models/GameSession');
const { auth, teacherAuth } = require('../middleware/auth');
const router = express.Router();

// Get student progress by USN (Teacher only)
router.get('/student/:usn', auth, teacherAuth, async (req, res) => {
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

// Get all students progress (Teacher only)
router.get('/all', auth, teacherAuth, async (req, res) => {
  try {
    const students = await Student.find()
      .select('name usn email profilePicture streakLevel easyLevelCompleted intermediateLevelCompleted hardLevelCompleted totalBadges wins')
      .sort({ easyLevelCompleted: -1, intermediateLevelCompleted: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

