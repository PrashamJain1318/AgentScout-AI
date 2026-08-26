const mongoose = require('mongoose');

const CareerAgentOutcomeSchema = new mongoose.Schema(
  {
    outcomeId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerAgentWorkflow',
      default: null
    },
    actionPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerAgentActionPackage',
      default: null
    },
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    success: {
      type: Boolean,
      default: true
    },
    durationMs: {
      type: Number,
      default: 0
    },
    actionResults: [
      {
        type: mongoose.Schema.Types.Mixed
      }
    ],
    candidateFeedback: {
      rating: { type: Number, default: 5 },
      comment: { type: String, default: '' },
      editsMade: { type: Boolean, default: false }
    },
    opportunityStatus: {
      type: String,
      default: 'APPLIED'
    },
    applicationStatus: {
      type: String,
      default: 'SUBMITTED'
    },
    interviewScore: {
      type: Number,
      default: null
    },
    learnedInsights: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

CareerAgentOutcomeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CareerAgentOutcome', CareerAgentOutcomeSchema);
