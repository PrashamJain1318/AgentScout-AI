const mongoose = require('mongoose');

const CareerAgentSchema = new mongoose.Schema(
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
      enum: ['IDLE', 'ANALYZING', 'REASONING', 'ACTION_REQUIRED', 'EXECUTING', 'PAUSED', 'ERROR'],
      default: 'IDLE'
    },
    mode: {
      type: String,
      enum: ['MANUAL', 'ASSISTED', 'AUTONOMOUS', 'AUTONOMOUS_ADVISOR', 'SEMI_AUTONOMOUS'],
      default: 'AUTONOMOUS'
    },
    lastRunAt: {
      type: Date,
      default: null
    },
    nextRunAt: {
      type: Date,
      default: null
    },
    lastDecisionAt: {
      type: Date,
      default: null
    },
    lastActionAt: {
      type: Date,
      default: null
    },
    currentGoal: {
      type: String,
      default: 'Maximize hiring probability for target software engineering roles'
    },
    primaryGoal: {
      type: String,
      default: 'Land a high-impact Software Engineering position'
    },
    careerStage: {
      type: String,
      enum: [
        'PROFILE_BUILDING',
        'RESUME_OPTIMIZATION',
        'JOB_DISCOVERY',
        'APPLICATION_READY',
        'ACTIVE_APPLICATION',
        'INTERVIEW_PREPARATION',
        'OFFER_READY',
        'CAREER_ACCELERATION'
      ],
      default: 'PROFILE_BUILDING'
    },
    readiness: {
      overall: { type: Number, default: 0, min: 0, max: 100 },
      profile: { type: Number, default: 0, min: 0, max: 100 },
      resume: { type: Number, default: 0, min: 0, max: 100 },
      application: { type: Number, default: 0, min: 0, max: 100 },
      interview: { type: Number, default: 0, min: 0, max: 100 },
      skills: { type: Number, default: 0, min: 0, max: 100 }
    },
    agentState: {
      currentPriority: { type: String, default: 'Improve resume ATS score and profile readiness' },
      currentAction: { type: String, default: 'IMPROVE_RESUME' },
      currentReason: { type: String, default: 'Resume ATS score requires optimization before submitting applications' },
      confidence: { type: Number, default: 0.85, min: 0, max: 1 },
      urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
      impact: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' }
    },
    preferences: {
      autonomousRecommendations: { type: Boolean, default: true },
      autoExecuteSafeActions: { type: Boolean, default: true },
      approvalRequired: { type: Boolean, default: true },
      notificationLevel: { type: String, enum: ['ALL', 'IMPORTANT_ONLY', 'MUTED'], default: 'IMPORTANT_ONLY' }
    },
    statistics: {
      decisionsMade: { type: Number, default: 0 },
      recommendationsCreated: { type: Number, default: 0 },
      actionsExecuted: { type: Number, default: 0 },
      actionsApproved: { type: Number, default: 0 },
      actionsRejected: { type: Number, default: 0 },
      actionsFailed: { type: Number, default: 0 },
      actionsAutomated: { type: Number, default: 0 },
      notificationsSent: { type: Number, default: 0 },
      duplicatesPrevented: { type: Number, default: 0 }
    },
    lastContextSnapshot: {
      type: Object,
      default: {}
    },
    lastReasoningSummary: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CareerAgent', CareerAgentSchema);
