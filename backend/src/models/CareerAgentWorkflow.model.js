const mongoose = require('mongoose');

const WorkflowStepSchema = new mongoose.Schema(
  {
    stepId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'ANALYZE',
        'GENERATE',
        'UPDATE',
        'REVIEW',
        'PREPARE',
        'NOTIFY',
        'INTERNAL_ACTION',
        'EXTERNAL_ACTION',
        'WAIT'
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
    riskLevel: {
      type: String,
      enum: ['SAFE', 'LOW_IMPACT', 'HIGH_IMPACT', 'EXTERNAL_ACTION'],
      default: 'SAFE'
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    dependencies: [
      {
        type: String
      }
    ],
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    executionResult: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    retryCount: {
      type: Number,
      default: 0
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
  { _id: false }
);

const CareerAgentWorkflowSchema = new mongoose.Schema(
  {
    workflowId: {
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
    type: {
      type: String,
      enum: [
        'PREPARE_APPLICATION',
        'APPLY_OPPORTUNITY',
        'PREPARE_INTERVIEW',
        'IMPROVE_RESUME',
        'CLOSE_SKILL_GAP',
        'FOLLOW_UP_APPLICATION',
        'NETWORKING_OUTREACH'
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
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: [
        'PLANNED',
        'PREPARING',
        'WAITING_APPROVAL',
        'EXECUTING',
        'PAUSED',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
      ],
      default: 'PLANNED'
    },
    steps: [WorkflowStepSchema],
    currentStep: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      default: 0
    },
    estimatedDuration: {
      type: String,
      default: '5 mins'
    },
    actionPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerAgentActionPackage',
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

CareerAgentWorkflowSchema.index({ user: 1, status: 1 });
CareerAgentWorkflowSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('CareerAgentWorkflow', CareerAgentWorkflowSchema);
