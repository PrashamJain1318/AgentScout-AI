const mongoose = require('mongoose');

const CareerAgentExecutionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    agentAction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerAgentAction',
      default: null
    },
    actionType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'CANCELLED'],
      default: 'QUEUED',
      index: true
    },
    riskLevel: {
      type: String,
      enum: ['SAFE', 'LOW_RISK', 'HIGH_IMPACT', 'EXTERNAL_ACTION'],
      default: 'SAFE'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    },
    failedAt: {
      type: Date,
      default: null
    },
    durationMs: {
      type: Number,
      default: 0
    },
    result: {
      type: Object,
      default: {}
    },
    errorCode: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    retryCount: {
      type: Number,
      default: 0
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

CareerAgentExecutionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CareerAgentExecution', CareerAgentExecutionSchema);
