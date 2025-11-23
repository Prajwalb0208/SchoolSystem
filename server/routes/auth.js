import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Student Signup
router.post('/student/signup', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('usn').trim().notEmpty().withMessage('USN is required'),
  body('dob').notEmpty().withMessage('Date of birth is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, name, phone, usn, dob, batches, profilePicture } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ username }, { email }, { usn }] 
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this username, email, or USN already exists' 
      });
    }

    // Create new student
    const student = new Student({
      username,
      email,
      password,
      name,
      phone,
      usn: usn.toUpperCase(),
      dob,
      batches: batches || [],
      profilePicture: profilePicture || ''
    });

    await student.save();

    const token = generateToken(student._id);

    res.status(201).json({
      message: 'Student account created successfully',
      token,
      user: {
        id: student._id,
        username: student.username,
        email: student.email,
        name: student.name,
        usn: student.usn,
        userType: 'student'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Teacher Signup
router.post('/teacher/signup', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, phone } = req.body;

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingTeacher) {
      return res.status(400).json({ 
        message: 'Teacher with this username or email already exists' 
      });
    }

    // Create new teacher
    const teacher = new Teacher({
      username,
      email,
      password,
      phone
    });

    await teacher.save();

    const token = generateToken(teacher._id);

    res.status(201).json({
      message: 'Teacher account created successfully',
      token,
      user: {
        id: teacher._id,
        username: teacher.username,
        email: teacher.email,
        userType: 'teacher'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Login
router.post('/student/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const student = await Student.findOne({ username });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(student._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        username: student.username,
        email: student.email,
        name: student.name,
        usn: student.usn,
        userType: 'student'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student USN Login (for quick access without password)
router.post('/student/usn-login', [
  body('usn').trim().notEmpty().withMessage('USN is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { usn } = req.body;
    const usnUpper = usn.toUpperCase();

    // Find or create student by USN
    let student = await Student.findOne({ usn: usnUpper });
    
    if (!student) {
      // Create new student record with USN
      student = new Student({
        username: usnUpper,
        email: `${usnUpper.toLowerCase()}@student.com`,
        password: 'temp123456', // Temporary password
        name: usnUpper,
        phone: '0000000000',
        usn: usnUpper,
        dob: new Date('2000-01-01'),
        batches: []
      });
      await student.save();
    }

    // Update last login time
    student.lastPlayedDate = new Date();
    await student.save();

    const token = generateToken(student._id);

    res.json({
      message: 'USN login successful',
      token,
      user: {
        id: student._id,
        username: student.username,
        email: student.email,
        name: student.name,
        usn: student.usn,
        userType: 'student'
      }
    });
  } catch (error) {
    console.error('USN login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Teacher Login
router.post('/teacher/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const teacher = await Teacher.findOne({ username });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(teacher._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: teacher._id,
        username: teacher.username,
        email: teacher.email,
        userType: 'teacher'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
