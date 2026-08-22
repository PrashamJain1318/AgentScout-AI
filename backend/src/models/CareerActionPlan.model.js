const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: [
        'job_search',
        'application',
        'skill',
        'resume',
        'portfolio',
        'interview',
        'networking',
        'profile',
        'career'
      ],
      default: 'career'
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    impact: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    estimatedMinutes: { type: Number, default: 15 },
    dueDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending'
    },
    completedAt: { type: Date, default: null },
    source: { type: String, default: 'action_engine' },
    deepLink: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const MilestoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    unit: { type: String, default: '%' },
    percentage: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { _id: false }
);

const CareerActionPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    planDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    weekStart: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active'
    },

    dailyActions: [ActionSchema],
    weeklyGoals: [ActionSchema],
    priorityActions: [ActionSchema],

    jobSearchActions: [ActionSchema],
    applicationActions: [ActionSchema],
    skillActions: [ActionSchema],
    resumeActions: [ActionSchema],
    interviewActions: [ActionSchema],
    networkingActions: [ActionSchema],

    careerMilestones: [MilestoneSchema],

    completionPercentage: {
      type: Number,
      default: 0
    },

    aiSummary: { type: String, default: '' },
    aiReasoning: { type: String, default: '' },
    nextBestAction: { type: ActionSchema, default: null },

    lastGeneratedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

CareerActionPlanSchema.index({ user: 1, planDate: -1 });
CareerActionPlanSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('CareerActionPlan', CareerActionPlanSchema);
