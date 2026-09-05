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
      required: true,
      index: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null,
      index: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null
    },
    type: {
      type: String,
      enum: [
        'ANALYZE_OPPORTUNITY',
        'CALCULATE_READINESS',
        'OPTIMIZE_RESUME',
        'GENERATE_COVER_LETTER',
        'GENERATE_APPLICATION_ANSWERS',
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
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'],
      default: 'PENDING'
    },
    riskLevel: {
      type: String,
      enum: ['SAFE', 'HIGH_IMPACT', 'EXTERNAL_ACTION'],
      default: 'SAFE'
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Object,
      default: {}
    },
    startedAt: {
      type: Date,
      default: null
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
ApplicationAgentTaskSchema.index({ agent: 1, status: 1 });

module.exports = mongoose.model('ApplicationAgentTask', ApplicationAgentTaskSchema);
