const mongoose = require('mongoose');

const ApplicationDraftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
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
    type: {
      type: String,
      enum: ['RESUME', 'COVER_LETTER', 'APPLICATION_ANSWER'],
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    version: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'REJECTED'],
      default: 'DRAFT'
    },
    generatedBy: {
      type: String,
      enum: ['AI', 'USER'],
      default: 'AI'
    },
    approvedByUser: {
      type: Boolean,
      default: false
    },
    userNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

ApplicationDraftSchema.index({ user: 1, opportunity: 1, type: 1 });

module.exports = mongoose.model('ApplicationDraft', ApplicationDraftSchema);
