const express = require('express');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const { auth, teacherAuth, studentAuth } = require('../middleware/auth');
const router = express.Router();

// Get all assignments (Students can read, Teachers can read/write)
router.get('/', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single assignment
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'username email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create assignment (Teacher only)
router.post('/', auth, teacherAuth, async (req, res) => {
  try {
    const { title, description, questions, dueDate } = req.body;

    const assignment = new Assignment({
      title,
      description,
      questions: questions || [],
      createdBy: req.userId,
      dueDate: dueDate ? new Date(dueDate) : null
    });

    await assignment.save();

    // Populate createdBy
    await assignment.populate('createdBy', 'username email');

    // Notify all students (this would trigger socket.io notification in real app)
    
    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update assignment (Teacher only)
router.put('/:id', auth, teacherAuth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher created this assignment
    if (assignment.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const { title, description, questions, dueDate } = req.body;

    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (questions) assignment.questions = questions;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    
    assignment.updatedAt = new Date();

    await assignment.save();
    await assignment.populate('createdBy', 'username email');

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete assignment (Teacher only)
router.delete('/:id', auth, teacherAuth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher created this assignment
    if (assignment.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

