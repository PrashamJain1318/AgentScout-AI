const mongoose = require('mongoose');

const OpportunityObservationSchema = new mongoose.Schema(
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
    firstSeenAt: {
      type: Date,
      default: Date.now
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    },
    firstMatchedAt: {
      type: Date,
      default: Date.now
    },
    highestMatchScore: {
      type: Number,
      default: 0
    },
    latestMatchScore: {
      type: Number,
      default: 0
    },
    alerted: {
      type: Boolean,
      default: false
    },
    alertType: {
      type: String,
      default: null
    },
    viewed: {
      type: Boolean,
      default: false
    },
    saved: {
      type: Boolean,
      default: false
    },
    applied: {
      type: Boolean,
      default: false
    },
    dismissed: {
      type: Boolean,
      default: false
    },
    lastActionAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

OpportunityObservationSchema.index({ user: 1, opportunity: 1 }, { unique: true });
OpportunityObservationSchema.index({ user: 1, dismissed: 1, highestMatchScore: -1 });

module.exports = mongoose.model('OpportunityObservation', OpportunityObservationSchema);
