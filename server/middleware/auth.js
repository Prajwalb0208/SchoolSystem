const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Check if user is student or teacher
    let user = await Student.findById(decoded.id);
    if (!user) {
      user = await Teacher.findById(decoded.id);
      if (user) {
        req.userType = 'teacher';
      }
    } else {
      req.userType = 'student';
    }

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const studentAuth = async (req, res, next) => {
  try {
    if (req.userType !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student only.' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access denied' });
  }
};

const teacherAuth = async (req, res, next) => {
  try {
    if (req.userType !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = { auth, studentAuth, teacherAuth };

