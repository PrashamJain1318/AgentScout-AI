const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    originalName: {
      type: String,
      required: true
    },
    storageKey: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    fileBuffer: {
      type: Buffer,
      select: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    analyzedAt: {
      type: Date,
      default: null
    },
    extractedText: {
      type: String,
      default: ''
    },
    extractedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      headline: { type: String, default: '' },
      summary: { type: String, default: '' },
      skills: { type: [String], default: [] },
      experience: [
        {
          company: { type: String, default: '' },
          role: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' },
          description: { type: String, default: '' },
          achievements: { type: [String], default: [] }
        }
      ],
      education: [
        {
          institution: { type: String, default: '' },
          degree: { type: String, default: '' },
          field: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' }
        }
      ],
      projects: [
        {
          name: { type: String, default: '' },
          description: { type: String, default: '' },
          technologies: { type: [String], default: [] },
          url: { type: String, default: '' }
        }
      ],
      certifications: { type: [String], default: [] },
      languages: { type: [String], default: [] }
    },
    portfolio: {
      portfolioUrl: { type: String, default: '' },
      githubUrl: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' },
      projectUrls: { type: [String], default: [] },
      analyzedAt: { type: Date, default: null }
    },
    scores: {
      overall: { type: Number, default: 0 },
      ats: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      impact: { type: Number, default: 0 },
      skillsCoverage: { type: Number, default: 0 }
    },
    gaps: { type: [String], default: [] },
    suggestions: [
      {
        category: { type: String, default: 'General' },
        title: { type: String, required: true },
        explanation: { type: String, required: true },
        impactLevel: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resume', ResumeSchema);
