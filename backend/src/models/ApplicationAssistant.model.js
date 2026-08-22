const mongoose = require('mongoose');

const ApplicationAssistantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null
    },
    readinessScore: {
      type: Number,
      default: 0
    },
    scoreBreakdown: {
      resumeAlignment: { type: Number, default: 0 },
      skillCoverage: { type: Number, default: 0 },
      experienceAlignment: { type: Number, default: 0 },
      portfolioStrength: { type: Number, default: 0 },
      profileAlignment: { type: Number, default: 0 }
    },
    resumeAnalysis: {
      matchedSkills: { type: [String], default: [] },
      missingSkills: { type: [String], default: [] },
      partialSkills: { type: [String], default: [] },
      recommended: { type: [String], default: [] }
    },
    strengths: {
      type: [String],
      default: []
    },
    gaps: {
      type: [String],
      default: []
    },
    resumeRecommendations: [
      {
        type: { type: String, default: 'General' },
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        reason: { type: String, required: true },
        suggestedAction: { type: String, required: true }
      }
    ],
    coverLetter: {
      content: { type: String, default: '' },
      tone: { type: String, default: 'Professional' },
      length: { type: String, default: 'Medium' },
      generatedAt: { type: Date, default: null }
    },
    applicationAnswers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        generatedAt: { type: Date, default: Date.now }
      }
    ],
    applicationStrategy: {
      recommendation: { type: String, default: 'Apply now' },
      priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
      keyActionSteps: { type: [String], default: [] },
      generatedAt: { type: Date, default: null }
    },
    checklist: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: true
  }
);

ApplicationAssistantSchema.index({ user: 1, opportunity: 1 }, { unique: true });
ApplicationAssistantSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('ApplicationAssistant', ApplicationAssistantSchema);
