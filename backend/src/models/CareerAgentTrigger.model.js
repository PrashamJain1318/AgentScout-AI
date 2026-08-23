const mongoose = require('mongoose');

const CareerAgentTriggerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'PROFILE_CHANGED',
        'RESUME_UPDATED',
        'NEW_HIGH_MATCH',
        'APPLICATION_STATUS_CHANGED',
        'INTERVIEW_COMPLETED',
        'SKILL_GAP_DETECTED',
        'READINESS_CHANGED',
        'CAREER_PLAN_CHANGED',
        'OPPORTUNITY_MONITOR_UPDATE',
        'MILESTONE_REACHED',
        'INACTIVITY_DETECTED',
        'SCHEDULED_REVIEW'
      ]
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['EVENT_DRIVEN', 'HOURLY', 'DAILY', 'WEEKLY'],
      default: 'EVENT_DRIVEN'
    },
    conditions: {
      type: Object,
      default: {}
    },
    lastEvaluatedAt: {
      type: Date,
      default: null
    },
    lastTriggeredAt: {
      type: Date,
      default: null
    },
    nextEvaluationAt: {
      type: Date,
      default: null
    },
    triggerCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

CareerAgentTriggerSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('CareerAgentTrigger', CareerAgentTriggerSchema);
