import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  difficulty: {
    type: String,
    enum: ['easy', 'intermediate', 'hard'],
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  entries: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    studentName: String,
    studentUSN: String,
    studentProfilePic: String,
    score: {
      type: Number,
      required: true
    },
    timeTaken: {
      type: Number, // in seconds
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
leaderboardSchema.index({ difficulty: 1, level: 1 });
leaderboardSchema.index({ 'entries.completedAt': -1 });

export default mongoose.model('Leaderboard', leaderboardSchema);

