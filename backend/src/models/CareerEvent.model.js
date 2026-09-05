const mongoose = require('mongoose');

const CareerEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'PROFILE_UPDATED',
        'PROFILE_COMPLETED',
        'RESUME_UPLOADED',
        'RESUME_ANALYZED',
        'RESUME_SCORE_IMPROVED',
        'RESUME_SCORE_DECREASED',
        'OPPORTUNITY_DISCOVERED',
        'HIGH_MATCH_FOUND',
        'EXCELLENT_MATCH_FOUND',
        'APPLICATION_STARTED',
        'APPLICATION_SUBMITTED',
        'APPLICATION_STATUS_CHANGED',
        'INTERVIEW_STARTED',
        'INTERVIEW_COMPLETED',
        'INTERVIEW_SCORE_IMPROVED',
        'SKILL_GAP_DETECTED',
        'SKILL_PROGRESS_DETECTED',
        'CAREER_ACTION_COMPLETED',
        'CAREER_MILESTONE_REACHED',
        'AGENT_ACTION_COMPLETED',
        'INACTIVITY_DETECTED',
        'CAREER_HEALTH_IMPROVED',
        'CAREER_HEALTH_DECLINED'
      ]
    },
    category: {
      type: String,
      enum: [
        'PROFILE',
        'RESUME',
        'OPPORTUNITY',
        'APPLICATION',
        'INTERVIEW',
        'SKILL',
        'CAREER_ACTION',
        'AGENT',
        'SYSTEM',
        'HEALTH'
      ],
      default: 'CAREER_ACTION'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    impact: {
      type: String,
      enum: ['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    metadata: {
      type: Object,
      default: {}
    },
    sourceModule: {
      type: String,
      default: 'SYSTEM'
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    relatedEntityType: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    eventHash: {
      type: String,
      required: true
    },
    occurredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

CareerEventSchema.index({ user: 1, occurredAt: -1 });
CareerEventSchema.index({ user: 1, eventType: 1 });
CareerEventSchema.index({ user: 1, isRead: 1 });
CareerEventSchema.index({ user: 1, eventHash: 1 }, { unique: true });

module.exports = mongoose.model('CareerEvent', CareerEventSchema);
