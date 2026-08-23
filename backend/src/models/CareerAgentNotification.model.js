const mongoose = require('mongoose');

const CareerAgentNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'HIGH_MATCH_DISCOVERED',
        'READINESS_IMPROVED',
        'ATS_SCORE_ALERT',
        'APPLICATION_WAITING',
        'INACTIVITY_WARNING',
        'MILESTONE_REACHED',
        'ACTION_REQUIRED',
        'ACTION_COMPLETED',
        'SYSTEM_UPDATE'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    source: {
      type: String,
      default: 'CAREER_AGENT_AUTOMATION'
    },
    relatedAction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerAgentAction',
      default: null
    },
    relatedOpportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null
    },
    read: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    deduplicationKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

CareerAgentNotificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CareerAgentNotification', CareerAgentNotificationSchema);
