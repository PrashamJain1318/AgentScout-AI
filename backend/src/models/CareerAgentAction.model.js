const mongoose = require('mongoose');

const CareerAgentActionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerAgent',
      required: true
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        'COMPLETE_PROFILE',
        'IMPROVE_RESUME',
        'LEARN_SKILL',
        'APPLY_TO_OPPORTUNITY',
        'PREPARE_APPLICATION',
        'PRACTICE_INTERVIEW',
        'FOLLOW_UP_APPLICATION',
        'UPDATE_PORTFOLIO',
        'REVIEW_NEW_OPPORTUNITY',
        'BUILD_APPLICATION_PIPELINE',
        'REVIEW_CAREER_ANALYTICS',
        'REFRESH_INTELLIGENCE'
      ]
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['profile', 'resume', 'skills', 'application', 'interview', 'opportunities', 'pipeline', 'career'],
      default: 'career'
    },
    riskLevel: {
      type: String,
      enum: ['SAFE', 'LOW_RISK', 'HIGH_IMPACT', 'EXTERNAL_ACTION'],
      required: true,
      default: 'SAFE'
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXECUTING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    executedAt: {
      type: Date,
      default: null
    },
    reason: {
      type: String,
      default: ''
    },
    evidence: {
      type: [String],
      default: []
    },
    confidence: {
      type: Number,
      default: 0.85
    },
    impact: {
      type: String,
      default: 'high'
    },
    urgency: {
      type: String,
      default: 'high'
    },
    deepLink: {
      type: String,
      default: '/dashboard'
    },
    inputPayload: {
      type: Object,
      default: {}
    },
    resultPayload: {
      type: Object,
      default: {}
    },
    errorMessage: {
      type: String,
      default: ''
    },
    requiresApproval: {
      type: Boolean,
      default: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  },
  {
    timestamps: true
  }
);

CareerAgentActionSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CareerAgentAction', CareerAgentActionSchema);
