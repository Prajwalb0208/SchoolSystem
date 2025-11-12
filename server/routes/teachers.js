import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Teacher from '../models/Teacher.js';
import { auth, teacherAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    cb(null, 'teacher-' + uniqueSuffix + path.extname(file.originalname));
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

// Get teacher profile
router.get('/profile', auth, teacherAuth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.userId).select('-password');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update teacher profile
router.put('/profile', auth, teacherAuth, upload.single('profilePicture'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.userId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { email, phone } = req.body;

    if (email) teacher.email = email;
    if (phone) teacher.phone = phone;

    // Handle profile picture upload (only from gallery)
    if (req.file) {
      // Delete old profile picture if exists
      if (teacher.profilePicture && teacher.profilePicture.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', teacher.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      teacher.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    await teacher.save();

    const teacherData = teacher.toObject();
    delete teacherData.password;

    res.json({
      message: 'Profile updated successfully',
      teacher: teacherData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
