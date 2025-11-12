import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    language: {
      type: String,
      enum: ['C', 'C++', 'Java', 'Python', 'General']
    },
    points: {
      type: Number,
      default: 10
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  dueDate: {
    type: Date
  },
  submissions: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    answers: [{
      questionIndex: Number,
      answer: String,
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['submitted', 'graded'],
      default: 'submitted'
    },
    score: Number,
    feedback: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Assignment', assignmentSchema);

