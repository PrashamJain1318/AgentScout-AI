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
      required: true,
      index: true
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
      enum: ['DRAFT', 'READY_FOR_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'],
      default: 'DRAFT'
    },
    generatedBy: {
      type: String,
      default: 'AI'
    },
    approvedByUser: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

ApplicationDraftSchema.index({ user: 1, opportunity: 1, type: 1 });

module.exports = mongoose.model('ApplicationDraft', ApplicationDraftSchema);
