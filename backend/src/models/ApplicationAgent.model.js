const mongoose = require('mongoose');

const ApplicationAgentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: [
        'IDLE',
        'ANALYZING',
        'PREPARING',
        'WAITING_FOR_APPROVAL',
        'EXECUTING',
        'VERIFYING',
        'COMPLETED',
        'FAILED',
        'PAUSED'
      ],
      default: 'IDLE'
    },
    mode: {
      type: String,
      enum: ['MANUAL', 'ASSISTED', 'AUTONOMOUS'],
      default: 'ASSISTED'
    },
    currentOpportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null
    },
    currentApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null
    },
    readinessMetrics: {
      overall: { type: Number, default: 0, min: 0, max: 100 },
      resume: { type: Number, default: 0, min: 0, max: 100 },
      skills: { type: Number, default: 0, min: 0, max: 100 },
      experience: { type: Number, default: 0, min: 0, max: 100 },
      projects: { type: Number, default: 0, min: 0, max: 100 },
      ats: { type: Number, default: 0, min: 0, max: 100 },
      interview: { type: Number, default: 0, min: 0, max: 100 }
    },
    preferences: {
      minimumMatchScore: { type: Number, default: 75, min: 0, max: 100 },
      autoPrepareSafeActions: { type: Boolean, default: true },
      preferredTone: { type: String, default: 'PROFESSIONAL' },
      preferredResumeStyle: { type: String, default: 'MODERN_ATS' }
    },
    statistics: {
      applicationsAnalyzed: { type: Number, default: 0 },
      applicationsPrepared: { type: Number, default: 0 },
      applicationsCompleted: { type: Number, default: 0 },
      duplicatesPrevented: { type: Number, default: 0 }
    },
    lastRunAt: {
      type: Date,
      default: null
    },
    lastActionAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

ApplicationAgentSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('ApplicationAgent', ApplicationAgentSchema);
