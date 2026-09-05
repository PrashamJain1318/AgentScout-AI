const mongoose = require('mongoose');

const UserPersonalizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    currentStage: {
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
    primaryFocus: {
      type: String,
      enum: [
        'WEAK_RESUME',
        'HIGH_MATCH_AVAILABLE',
        'INTERVIEW_SOON',
        'INACTIVE_MOMENTUM',
        'OPTIMIZE_APPLICATIONS',
        'CAREER_GROWTH'
      ],
      default: 'WEAK_RESUME'
    },
    smartPriorities: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        category: { type: String, default: 'general' },
        priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'high' },
        deepLink: { type: String, default: '/dashboard' },
        actionLabel: { type: String, default: 'Take Action' },
        impact: { type: String, default: 'High Impact' },
        reason: { type: String, default: '' },
        icon: { type: String, default: 'target' }
      }
    ],
    momentum: {
      score: { type: Number, default: 50, min: 0, max: 100 },
      trend: { type: String, enum: ['UP', 'STABLE', 'DOWN'], default: 'STABLE' },
      changePercentage: { type: Number, default: 0 },
      lastActiveDays: { type: Number, default: 0 },
      weeklyActivityCount: { type: Number, default: 0 }
    },
    dailyInsight: {
      title: { type: String, default: 'Career Strategy Insight' },
      category: { type: String, default: 'Optimization' },
      tip: { type: String, default: 'Keep your resume keywords aligned with targeted Job Descriptions.' },
      deepLink: { type: String, default: '/resume-studio' },
      deepLinkLabel: { type: String, default: 'View Resume Studio' },
      rationale: { type: String, default: 'Based on your recent career activity.' }
    },
    journeyPhases: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        description: { type: String, default: '' },
        status: { type: String, enum: ['completed', 'active', 'upcoming', 'locked'], default: 'upcoming' },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        deepLink: { type: String, default: '/dashboard' }
      }
    ],
    widgetPriorityOrder: [
      { type: String }
    ],
    userPreferences: {
      adaptiveLayout: { type: Boolean, default: true },
      focusMode: { type: Boolean, default: false },
      customThemeAccent: { type: String, default: 'indigo' }
    },
    lastCalculatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

UserPersonalizationSchema.index({ user: 1 });

module.exports = mongoose.model('UserPersonalization', UserPersonalizationSchema);
