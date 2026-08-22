const mongoose = require('mongoose');

const TimelineItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application document requires a valid user reference'],
      index: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: false,
      default: null
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true
    },
    company: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true
    },
    jobType: {
      type: String,
      enum: ['job', 'full-time', 'part-time', 'internship', 'contract', 'research'],
      default: 'job'
    },
    workMode: {
      type: String,
      default: 'remote'
    },
    jobUrl: {
      type: String,
      default: '',
      trim: true
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: {
        values: ['saved', 'applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn'],
        message: 'status must be one of: saved, applied, screening, interview, offer, accepted, rejected, withdrawn'
      },
      default: 'saved'
    },
    appliedAt: {
      type: Date,
      default: null
    },
    applicationUrl: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: '',
      maxlength: [5000, 'Notes cannot exceed 5000 characters']
    },
    timeline: {
      type: [TimelineItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound index ensuring unique application per user and opportunity (when opportunity is provided)
ApplicationSchema.index({ user: 1, opportunity: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Application', ApplicationSchema);
