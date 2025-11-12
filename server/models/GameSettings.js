import mongoose from 'mongoose';

const gameSettingsSchema = new mongoose.Schema({
  gameTimeLimit: {
    type: Number, // in seconds
    default: 120, // 2 minutes
    min: 60, // minimum 1 minute
    max: 1800 // maximum 30 minutes
  },
  quizQuestionCount: {
    type: Number,
    default: 5,
    min: 3,
    max: 10
  },
  quizPassingScore: {
    type: Number,
    default: 3, // need at least 3 correct out of 5
    min: 1
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
gameSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('GameSettings', gameSettingsSchema);

