const mongoose = require('mongoose');

const CareerHealthSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    previousScore: {
      type: Number,
      default: 0
    },
    change: {
      type: Number,
      default: 0
    },
    trend: {
      type: String,
      enum: ['IMPROVING', 'STABLE', 'DECLINING', 'NEW'],
      default: 'NEW'
    },
    breakdown: {
      profile: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 10 }
      },
      resume: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 20 }
      },
      applications: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 20 }
      },
      skills: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 15 }
      },
      interview: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 15 }
      },
      activity: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 10 }
      },
      opportunities: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 10 }
      }
    },
    strengths: [String],
    concerns: [String],
    recommendations: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, default: 'CAREER' },
        priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
        deepLink: { type: String, default: '/dashboard' },
        actionLabel: { type: String, default: 'Take Action' }
      }
    ],
    snapshotDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

CareerHealthSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CareerHealth', CareerHealthSchema);
