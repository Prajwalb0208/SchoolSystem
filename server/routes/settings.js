import express from 'express';
import GameSettings from '../models/GameSettings.js';
import { auth } from '../middleware/auth.js';
import Teacher from '../models/Teacher.js';

const router = express.Router();

// Get game settings (public - anyone can read)
router.get('/', async (req, res) => {
  try {
    const settings = await GameSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update game settings (teacher only)
router.put('/', auth, async (req, res) => {
  try {
    // Check if user is teacher
    const teacher = await Teacher.findById(req.userId);
    
    if (!teacher) {
      return res.status(403).json({ message: 'Only teachers can update settings' });
    }

    const { gameTimeLimit, quizQuestionCount, quizPassingScore } = req.body;

    // Validate inputs
    if (gameTimeLimit !== undefined) {
      if (gameTimeLimit < 60 || gameTimeLimit > 1800) {
        return res.status(400).json({ message: 'Game time limit must be between 60 and 1800 seconds' });
      }
    }

    if (quizQuestionCount !== undefined) {
      if (quizQuestionCount < 3 || quizQuestionCount > 10) {
        return res.status(400).json({ message: 'Quiz question count must be between 3 and 10' });
      }
    }

    if (quizPassingScore !== undefined) {
      if (quizPassingScore < 1) {
        return res.status(400).json({ message: 'Quiz passing score must be at least 1' });
      }
    }

    // Get or create settings
    let settings = await GameSettings.findOne();
    if (!settings) {
      settings = new GameSettings({});
    }

    // Update fields
    if (gameTimeLimit !== undefined) settings.gameTimeLimit = gameTimeLimit;
    if (quizQuestionCount !== undefined) settings.quizQuestionCount = quizQuestionCount;
    if (quizPassingScore !== undefined) settings.quizPassingScore = quizPassingScore;
    
    settings.updatedBy = req.userId;
    settings.updatedAt = new Date();

    await settings.save();

    res.json({
      message: 'Settings updated successfully',
      settings: {
        gameTimeLimit: settings.gameTimeLimit,
        quizQuestionCount: settings.quizQuestionCount,
        quizPassingScore: settings.quizPassingScore,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
