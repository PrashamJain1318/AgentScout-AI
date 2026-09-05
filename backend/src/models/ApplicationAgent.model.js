const mongoose = require('mongoose');

const ApplicationAgentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
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
    statistics: {
      applicationsAnalyzed: { type: Number, default: 0 },
      applicationsPrepared: { type: Number, default: 0 },
      applicationsCompleted: { type: Number, default: 0 },
      duplicatesPrevented: { type: Number, default: 0 }
    },
    preferences: {
      autoPrepareHighMatch: { type: Boolean, default: true },
      minMatchThreshold: { type: Number, default: 75 },
      conciseCoverLetter: { type: Boolean, default: true },
      notificationOnReviewReady: { type: Boolean, default: true }
    },
    lastAnalyzedAt: {
      type: Date,
      default: null
    },
    lastPreparedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ApplicationAgent', ApplicationAgentSchema);
