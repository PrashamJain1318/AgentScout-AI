const mongoose = require('mongoose');

const CareerInsightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    insightHash: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['RECOMMENDATION', 'WARNING', 'MILESTONE', 'FORECAST', 'STRATEGY'],
      default: 'RECOMMENDATION'
    },
    category: {
      type: String,
      enum: [
        'SKILL',
        'RESUME',
        'APPLICATION',
        'INTERVIEW',
        'OPPORTUNITY',
        'CAREER_RISK',
        'CAREER_GROWTH',
        'CAREER_MOMENTUM',
        'MARKET_ALIGNMENT'
      ],
      default: 'CAREER_GROWTH'
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    evidence: {
      type: String,
      default: ''
    },
    confidence: {
      type: Number,
      default: 85,
      min: 0,
      max: 100
    },
    actionable: {
      type: Boolean,
      default: true
    },
    recommendedAction: {
      title: { type: String, default: 'Take Action' },
      deepLink: { type: String, default: '/dashboard' },
      actionLabel: { type: String, default: 'View Details' },
      impact: { type: String, default: 'High Impact' },
      effort: { type: String, default: 'LOW' },
      roi: { type: String, default: 'HIGH' }
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISMISSED', 'COMPLETED', 'EXPIRED'],
      default: 'ACTIVE'
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

CareerInsightSchema.index({ user: 1, insightHash: 1 }, { unique: true });
CareerInsightSchema.index({ user: 1, category: 1, status: 1 });

module.exports = mongoose.model('CareerInsight', CareerInsightSchema);
