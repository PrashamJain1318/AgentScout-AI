const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an opportunity title'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true
    },
    type: {
      type: String,
      enum: ['job', 'internship', 'research'],
      default: 'job'
    },
    remote: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    requirements: {
      type: [String],
      default: []
    },
    salary: {
      type: String,
      default: 'Not disclosed'
    },
    applicationUrl: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      default: 'Bright Data'
    },
    sourceUrl: {
      type: String,
      default: ''
    },
    brightDataJobId: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    postedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for search queries
OpportunitySchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  requirements: 'text'
});

module.exports = mongoose.model('Opportunity', OpportunitySchema);
