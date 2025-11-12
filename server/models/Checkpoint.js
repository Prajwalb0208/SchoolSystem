import mongoose from 'mongoose';

const checkpointSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  gameType: {
    type: String,
    enum: ['blockrush', 'snake', 'memory', 'typing', 'puzzle', 'arrows', 'pieces', 'shooter', 'brick', 'minesweeper', '2048', 'sudoku', 'flappy'],
    required: true
  },
  gameState: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
checkpointSchema.index({ studentId: 1, gameType: 1, isActive: 1 });

export default mongoose.model('Checkpoint', checkpointSchema);

