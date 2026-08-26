const mongoose = require('mongoose');

const EditableContentSchema = new mongoose.Schema(
  {
    original: { type: String, default: '' },
    edited: { type: String, default: null },
    approved: { type: String, default: null },
    version: { type: Number, default: 1 }
  },
  { _id: false }
);

const CareerAgentActionPackageSchema = new mongoose.Schema(
  {
    packageId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerAgentWorkflow',
      default: null
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null
    },
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    matchAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    resumeRecommendations: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    coverLetter: {
      type: EditableContentSchema,
      default: () => ({ original: '', edited: null, approved: null, version: 1 })
    },
    applicationAnswers: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    applicationStrategy: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    outreachMessage: {
      type: EditableContentSchema,
      default: () => ({ original: '', edited: null, approved: null, version: 1 })
    },
    readinessScore: {
      type: Number,
      default: 0
    },
    risks: [
      {
        type: String
      }
    ],
    approvalState: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'EDITED'],
      default: 'PENDING'
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

CareerAgentActionPackageSchema.index({ user: 1, approvalState: 1 });

module.exports = mongoose.model('CareerAgentActionPackage', CareerAgentActionPackageSchema);
