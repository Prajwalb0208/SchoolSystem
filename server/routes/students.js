const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const { auth, studentAuth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get student profile
router.get('/profile', auth, studentAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.userId).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update student profile
router.put('/profile', auth, studentAuth, upload.single('profilePicture'), async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { name, email, phone, batches, profilePicture } = req.body;

    if (name) student.name = name;
    if (email) student.email = email;
    if (phone) student.phone = phone;
    if (batches) student.batches = Array.isArray(batches) ? batches : [batches];

    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture if exists
      if (student.profilePicture && student.profilePicture.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', student.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      student.profilePicture = `/uploads/profiles/${req.file.filename}`;
    } else if (profilePicture) {
      // If profilePicture is provided in body (avatar selection)
      student.profilePicture = profilePicture;
    }

    await student.save();

    const studentData = student.toObject();
    delete studentData.password;

    res.json({
      message: 'Profile updated successfully',
      student: studentData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update streak (called when student plays)
router.post('/update-streak', auth, studentAuth, async (req, res) => {
  try {
    const { playTime } = req.body; // in minutes
    const student = await Student.findById(req.userId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastPlayed = student.lastPlayedDate ? new Date(student.lastPlayedDate) : null;
    const lastPlayedDate = lastPlayed ? new Date(lastPlayed.setHours(0, 0, 0, 0)) : null;

    // Check if it's a new day
    const isNewDay = !lastPlayedDate || lastPlayedDate.getTime() !== today.getTime();
    const isConsecutiveDay = lastPlayedDate && 
      (today.getTime() - lastPlayedDate.getTime()) === 86400000; // 1 day in milliseconds

    if (isNewDay) {
      if (isConsecutiveDay) {
        // Consecutive day, continue streak
        student.dailyPlayTime = playTime || 0;
      } else if (lastPlayedDate && !isConsecutiveDay) {
        // Streak broken
        student.streakLevel = 0;
        student.currentStreakStart = null;
        student.dailyPlayTime = playTime || 0;
      } else {
        // First time playing
        student.dailyPlayTime = playTime || 0;
      }
      
      if (!student.currentStreakStart) {
        student.currentStreakStart = today;
      }
      
      student.lastPlayedDate = today;
    } else {
      // Same day, add to play time
      student.dailyPlayTime = (student.dailyPlayTime || 0) + (playTime || 0);
    }

    // Check if 30 minutes reached
    if (student.dailyPlayTime >= 30) {
      const streakDays = Math.floor((today - student.currentStreakStart) / (1000 * 60 * 60 * 24)) + 1;
      student.streakLevel = streakDays;
    }

    await student.save();

    res.json({
      message: 'Streak updated',
      streakLevel: student.streakLevel,
      dailyPlayTime: student.dailyPlayTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

