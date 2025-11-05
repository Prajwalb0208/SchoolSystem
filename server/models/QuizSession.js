const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'intermediate', 'hard'],
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  questionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    timeTaken: Number
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  totalTimeTaken: Number,
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 5
  },
  passed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
quizSessionSchema.index({ studentId: 1, difficulty: 1, level: 1 });

module.exports = mongoose.model('QuizSession', quizSessionSchema);

