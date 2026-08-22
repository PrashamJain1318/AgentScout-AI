const mongoose = require('mongoose');

const OpportunityMonitorSchema = new mongoose.Schema(
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
    frequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly'],
      default: 'daily'
    },
    preferredRoles: {
      type: [String],
      default: []
    },
    preferredLocations: {
      type: [String],
      default: []
    },
    jobTypes: {
      type: [String],
      default: ['Full-time']
    },
    workModes: {
      type: [String],
      default: ['Remote', 'Hybrid', 'On-site']
    },
    minimumSalary: {
      type: Number,
      default: 0
    },
    experienceLevel: {
      type: String,
      default: 'Mid Level'
    },
    minimumMatchScore: {
      type: Number,
      default: 60
    },
    alertPreferences: {
      excellentMatches: { type: Boolean, default: true },
      strongMatches: { type: Boolean, default: true },
      newOpportunities: { type: Boolean, default: true },
      closingSoon: { type: Boolean, default: true },
      applicationReady: { type: Boolean, default: true }
    },
    digestPreferences: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
      preferredTime: { type: String, default: '09:00' }
    },
    lastRunAt: {
      type: Date,
      default: null
    },
    nextRunAt: {
      type: Date,
      default: null
    },
    opportunitiesFound: {
      type: Number,
      default: 0
    },
    opportunitiesAlerted: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

OpportunityMonitorSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('OpportunityMonitor', OpportunityMonitorSchema);
