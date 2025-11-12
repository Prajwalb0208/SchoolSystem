import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
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
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  answer: mongoose.Schema.Types.Mixed,
  isCorrect: {
    type: Boolean,
    default: false
  },
  timeTaken: {
    type: Number // in seconds
  },
  score: {
    type: Number,
    default: 0
  },
  visualTheme: {
    type: Number,
    default: 1 // 1-5 for different visuals
  }
}, {
  timestamps: true
});

export default mongoose.model('GameSession', gameSessionSchema);

