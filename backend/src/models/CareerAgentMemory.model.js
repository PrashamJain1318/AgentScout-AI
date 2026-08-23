const mongoose = require('mongoose');

const CareerAgentMemorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    memoryType: {
      type: String,
      enum: ['PREFERENCE', 'SKILL', 'GOAL', 'BEHAVIOR', 'OUTCOME', 'FEEDBACK', 'STRATEGY'],
      required: true
    },
    key: {
      type: String,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    confidence: {
      type: Number,
      default: 0.9,
      min: 0,
      max: 1
    },
    source: {
      type: String,
      default: 'AGENT_INFERENCE'
    },
    tags: [String],
    lastVerifiedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

CareerAgentMemorySchema.index({ user: 1, memoryType: 1 });
CareerAgentMemorySchema.index({ user: 1, key: 1 });

module.exports = mongoose.model('CareerAgentMemory', CareerAgentMemorySchema);
