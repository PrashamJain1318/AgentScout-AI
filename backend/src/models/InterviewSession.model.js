const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, default: 'Technical' },
    difficulty: { type: String, default: 'Intermediate' },
    expectedTopics: { type: [String], default: [] },
    userAnswer: { type: String, default: '' },
    aiEvaluation: { type: String, default: '' },
    score: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    idealAnswer: { type: String, default: '' },
    improvementTips: { type: [String], default: [] },
    answeredAt: { type: Date, default: null }
  },
  { _id: true }
);

const InterviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null
    },
    interviewType: {
      type: String,
      enum: [
        'Technical',
        'Behavioral',
        'HR',
        'System Design',
        'Coding',
        'Project Discussion',
        'Resume Deep Dive',
        'Mixed Mock Interview'
      ],
      default: 'Mixed Mock Interview'
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress'
    },
    readinessScore: {
      type: Number,
      default: 0
    },
    overallScore: {
      type: Number,
      default: 0
    },
    categoryScores: {
      technical: { type: Number, default: 0 },
      behavioral: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      roleKnowledge: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      resumeKnowledge: { type: Number, default: 0 }
    },
    questions: [QuestionSchema],
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    recommendations: {
      type: [String],
      default: []
    },
    duration: {
      type: Number,
      default: 0 // In seconds
    },
    questionsAsked: {
      type: Number,
      default: 5
    },
    questionsAnswered: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

InterviewSessionSchema.index({ user: 1, opportunity: 1 });
InterviewSessionSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema);
