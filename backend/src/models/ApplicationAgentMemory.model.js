const mongoose = require('mongoose');

const ApplicationAgentMemorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: [
        'PREFERENCE',
        'BEHAVIOR',
        'OUTCOME',
        'FEEDBACK',
        'STRATEGY',
        'APPLICATION_PATTERN'
      ],
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
      default: 0.8,
      min: 0,
      max: 1
    },
    source: {
      type: String,
      default: 'SYSTEM_OBSERVATION'
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

ApplicationAgentMemorySchema.index({ user: 1 });
ApplicationAgentMemorySchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('ApplicationAgentMemory', ApplicationAgentMemorySchema);
