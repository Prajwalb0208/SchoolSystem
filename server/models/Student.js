const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  usn: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  dob: {
    type: Date,
    required: true
  },
  batches: [{
    type: String
  }],
  profilePicture: {
    type: String,
    default: ''
  },
  streakLevel: {
    type: Number,
    default: 0
  },
  currentStreakStart: {
    type: Date,
    default: null
  },
  lastPlayedDate: {
    type: Date,
    default: null
  },
  dailyPlayTime: {
    type: Number,
    default: 0 // in minutes
  },
  badges: [{
    type: {
      type: String, // 'gold', 'silver', 'bronze', etc.
      enum: ['gold', 'silver', 'bronze', 'speed', 'accuracy']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  totalBadges: {
    type: Number,
    default: 0
  },
  easyLevelCompleted: {
    type: Number,
    default: 0
  },
  intermediateLevelCompleted: {
    type: Number,
    default: 0
  },
  hardLevelCompleted: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  leaderboardPositions: [{
    level: Number,
    difficulty: String,
    position: Number,
    score: Number,
    completedAt: Date
  }],
  gameProgress: [{
    gameType: {
      type: String,
      enum: ['blockrush', 'snake', 'memory', 'typing', 'puzzle', 'arrows', 'pieces', 'shooter', 'brick', 'minesweeper', '2048', 'sudoku', 'flappy']
    },
    totalScore: {
      type: Number,
      default: 0
    },
    gamesPlayed: {
      type: Number,
      default: 0
    },
    quizzesPassed: {
      type: Number,
      default: 0
    },
    lastPlayed: Date
  }],
  answeredQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, {
  timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);

