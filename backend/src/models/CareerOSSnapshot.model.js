const mongoose = require('mongoose');

const CareerOSSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    careerScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
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
      profile: { type: Number, default: 0 },
      resume: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
      interview: { type: Number, default: 0 },
      skills: { type: Number, default: 0 },
      portfolio: { type: Number, default: 0 }
    },
    opportunityState: {
      discovered: { type: Number, default: 0 },
      excellent: { type: Number, default: 0 },
      strong: { type: Number, default: 0 },
      readyToApply: { type: Number, default: 0 },
      watchlist: { type: Number, default: 0 }
    },
    applicationState: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      interviews: { type: Number, default: 0 },
      offers: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 },
      pipelineVelocity: { type: Number, default: 0 }
    },
    skillState: {
      strengths: [String],
      criticalGaps: [String],
      emergingGaps: [String],
      coverageScore: { type: Number, default: 0 }
    },
    interviewState: {
      readinessScore: { type: Number, default: 0 },
      latestScore: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 },
      weakCategories: [String]
    },
    resumeState: {
      atsScore: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      impact: { type: Number, default: 0 },
      skillsCoverage: { type: Number, default: 0 }
    },
    actionState: {
      completionRate: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      nextBestAction: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        category: { type: String, default: 'career' },
        priority: { type: String, default: 'high' },
        impact: { type: String, default: 'high' },
        deepLink: { type: String, default: '/dashboard' },
        reason: { type: String, default: '' }
      }
    },
    riskState: [
      {
        type: { type: String, required: true },
        severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
        title: { type: String, required: true },
        explanation: { type: String, default: '' },
        recommendation: { type: String, default: '' },
        deepLink: { type: String, default: '/dashboard' }
      }
    ],
    momentum: {
      score: { type: Number, default: 50 },
      trend: { type: String, enum: ['UP', 'STABLE', 'DOWN'], default: 'STABLE' },
      changePercentage: { type: Number, default: 0 }
    },
    milestones: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        target: { type: Number, default: 100 },
        current: { type: Number, default: 0 },
        unit: { type: String, default: '%' },
        percentage: { type: Number, default: 0 },
        completed: { type: Boolean, default: false }
      }
    ],
    recentChanges: [
      {
        type: { type: String, default: 'update' },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
        icon: { type: String, default: 'activity' }
      }
    ],
    recommendations: [
      {
        title: { type: String, required: true },
        reason: { type: String, default: '' },
        impact: { type: String, default: 'high' },
        priority: { type: String, default: 'high' },
        deepLink: { type: String, default: '/dashboard' },
        isNextBestAction: { type: Boolean, default: false }
      }
    ],
    aiSummary: {
      type: String,
      default: ''
    },
    aiReasoning: {
      type: String,
      default: ''
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

CareerOSSnapshotSchema.index({ user: 1, generatedAt: -1 });

module.exports = mongoose.model('CareerOSSnapshot', CareerOSSnapshotSchema);
