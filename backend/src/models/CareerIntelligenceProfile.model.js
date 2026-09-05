const mongoose = require('mongoose');

const CareerIntelligenceProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    targetRole: {
      type: String,
      default: 'Software Engineer'
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
    experienceLevel: {
      type: String,
      default: 'Mid-Level'
    },
    primarySkills: [String],
    secondarySkills: [String],
    skillStrengths: [String],
    skillGaps: [
      {
        skill: { type: String, required: true },
        importance: { type: String, enum: ['CRITICAL', 'HIGH', 'MODERATE', 'OPTIONAL'], default: 'HIGH' },
        impact: { type: String, default: 'High Impact' },
        demandFrequency: { type: Number, default: 0 },
        estimatedPriority: { type: Number, default: 1 },
        reason: { type: String, default: '' }
      }
    ],
    careerGoals: [String],
    targetIndustries: [String],
    targetLocations: [String],

    // 7-Dimension Scores
    readinessScore: { type: Number, default: 70, min: 0, max: 100 },
    marketAlignmentScore: { type: Number, default: 75, min: 0, max: 100 },
    careerMomentumScore: { type: Number, default: 65, min: 0, max: 100 },
    applicationEffectivenessScore: { type: Number, default: 60, min: 0, max: 100 },
    interviewReadinessScore: { type: Number, default: 55, min: 0, max: 100 },
    careerRiskScore: { type: Number, default: 25, min: 0, max: 100 },
    overallCareerHealthScore: { type: Number, default: 72, min: 0, max: 100 },

    healthCategory: {
      type: String,
      enum: ['EXCELLENT', 'STRONG', 'DEVELOPING', 'AT_RISK', 'CRITICAL'],
      default: 'STRONG'
    },

    primaryBottleneck: {
      bottleneck: { type: String, default: 'LOW_ATS_SCORE' },
      severity: { type: String, default: 'HIGH' },
      evidence: { type: String, default: '' },
      recommendedAction: { type: String, default: '' }
    },

    lastAnalyzedAt: {
      type: Date,
      default: Date.now
    },
    analysisVersion: {
      type: String,
      default: '1.0.0'
    }
  },
  {
    timestamps: true
  }
);

CareerIntelligenceProfileSchema.index({ user: 1 });

module.exports = mongoose.model('CareerIntelligenceProfile', CareerIntelligenceProfileSchema);
