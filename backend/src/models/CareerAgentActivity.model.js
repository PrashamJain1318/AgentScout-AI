const mongoose = require('mongoose');

const CareerAgentActivitySchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      enum: [
        'AGENT_STARTED',
        'CONTEXT_BUILT',
        'DECISION_MADE',
        'RECOMMENDATION_CREATED',
        'ACTION_REQUESTED',
        'ACTION_APPROVED',
        'ACTION_REJECTED',
        'ACTION_EXECUTED',
        'ACTION_FAILED',
        'MEMORY_UPDATED'
      ],
      required: true
    },
    actionType: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'WARNING', 'ERROR', 'INFO'],
      default: 'INFO'
    },
    summary: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    metadata: {
      type: Object,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

CareerAgentActivitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CareerAgentActivity', CareerAgentActivitySchema);
