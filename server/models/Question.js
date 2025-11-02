const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  difficulty: {
    type: String,
    enum: ['easy', 'intermediate', 'hard'],
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  questionType: {
    type: String,
    enum: ['mcq', 'codeBlocks', 'codeWrite'],
    required: true
  },
  // For MCQ (Easy level)
  question: {
    type: String,
    required: function() { return this.questionType === 'mcq'; }
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: Number, // index of correct option for MCQ
    required: function() { return this.questionType === 'mcq'; }
  },
  explanation: String,
  
  // For Code Blocks (Intermediate level)
  codeBlocks: [{
    lines: [String],
    order: Number
  }],
  codeDescription: String,
  
  // For Code Write (Hard level)
  language: {
    type: String,
    enum: ['C', 'C++', 'Java', 'Python'],
    required: function() { return this.questionType === 'codeWrite'; }
  },
  problemStatement: {
    type: String,
    required: function() { return this.questionType === 'codeWrite'; }
  },
  testCases: [{
    input: String,
    output: String,
    description: String
  }],
  solutionCode: {
    type: String,
    required: function() { return this.questionType === 'codeWrite'; }
  },
  hints: [String],
  timeLimit: {
    type: Number, // in seconds
    default: 300
  }
}, {
  timestamps: true
});

// Index for efficient queries
questionSchema.index({ difficulty: 1, level: 1 });
questionSchema.index({ difficulty: 1, language: 1 });

module.exports = mongoose.model('Question', questionSchema);

