const mongoose = require('mongoose');

const ApplicationAgentTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApplicationAgent',
      required: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null
    },
    taskType: {
      type: String,
      enum: [
        'ANALYZE_OPPORTUNITY',
        'CALCULATE_READINESS',
        'OPTIMIZE_RESUME',
        'GENERATE_COVER_LETTER',
        'GENERATE_ANSWERS',
        'VALIDATE_APPLICATION',
        'REQUEST_APPROVAL',
        'EXECUTE_APPLICATION',
        'VERIFY_SUBMISSION'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'],
      default: 'PENDING'
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    riskLevel: {
      type: String,
      enum: ['SAFE_INTERNAL_ACTION', 'HIGH_IMPACT', 'EXTERNAL_ACTION'],
      default: 'SAFE_INTERNAL_ACTION'
    },
    payload: {
      type: Object,
      default: {}
    },
    result: {
      type: Object,
      default: {}
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

ApplicationAgentTaskSchema.index({ user: 1, status: 1 });
ApplicationAgentTaskSchema.index({ user: 1, opportunity: 1 });

module.exports = mongoose.model('ApplicationAgentTask', ApplicationAgentTaskSchema);
