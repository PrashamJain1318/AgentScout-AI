const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Match document requires a valid user reference']
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: [true, 'Match document requires a valid opportunity reference']
    },
    score: {
      type: Number,
      required: [true, 'Match document requires a score (0-100)'],
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100']
    },
    matchLevel: {
      type: String,
      enum: {
        values: ['low', 'moderate', 'strong', 'excellent', 'poor', 'fair', 'good'],
        message: 'matchLevel must be one of: low, moderate, strong, excellent'
      },
      required: [true, 'Match document requires a matchLevel']
    },
    matchedSkills: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    reasons: {
      type: [String],
      default: []
    },
    recommendation: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['generated', 'viewed', 'saved', 'dismissed'],
        message: 'status must be one of: generated, viewed, saved, dismissed'
      },
      default: 'generated'
    },
    breakdown: {
      skills: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      jobType: { type: Number, default: 0 },
      workMode: { type: Number, default: 0 },
      profileCompleteness: { type: Number, default: 0 }
    },
    explanation: {
      summary: {
        type: String,
        default: ''
      },
      whyYouMatch: {
        type: [String],
        default: []
      },
      skillGaps: {
        type: [String],
        default: []
      },
      recommendation: {
        type: String,
        default: ''
      },
      interviewTips: {
        type: [String],
        default: []
      }
    },
    explanationGeneratedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring only one match record exists per user & opportunity combination
MatchSchema.index({ user: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);
