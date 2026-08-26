const mongoose = require('mongoose');
const crypto = require('crypto');
const CareerAgentOutcome = require('../models/CareerAgentOutcome.model');
const CareerAgentWorkflow = require('../models/CareerAgentWorkflow.model');
const CareerAgentActivity = require('../models/CareerAgentActivity.model');
const { processLearningFromOutcome } = require('./careerAgentLearning.service');

/**
 * Record a workflow or action execution outcome.
 */
const recordOutcome = async (userId, data = {}) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const outcomeId = `out_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const outcome = new CareerAgentOutcome({
    outcomeId,
    user: userObjectId,
    workflow: data.workflowId ? new mongoose.Types.ObjectId(data.workflowId) : null,
    actionPackage: data.actionPackageId ? new mongoose.Types.ObjectId(data.actionPackageId) : null,
    type: data.type || 'WORKFLOW_OUTCOME',
    title: data.title || 'Career Workflow Outcome',
    success: data.success !== false,
    durationMs: data.durationMs || 1200,
    actionResults: data.actionResults || [],
    candidateFeedback: {
      rating: data.rating || 5,
      comment: data.comment || '',
      editsMade: Boolean(data.editsMade)
    },
    opportunityStatus: data.opportunityStatus || 'APPLIED',
    applicationStatus: data.applicationStatus || 'SUBMITTED',
    interviewScore: data.interviewScore || null,
    learnedInsights: []
  });

  // Learn from outcome
  const insights = await processLearningFromOutcome(userId, {
    type: outcome.type,
    success: outcome.success,
    candidateFeedback: outcome.candidateFeedback,
    interviewScore: outcome.interviewScore
  }).catch(() => []);

  outcome.learnedInsights = insights;
  await outcome.save();

  // Audit activity
  await CareerAgentActivity.create({
    user: userObjectId,
    activityType: 'WORKFLOW_COMPLETED',
    title: `Completed Outcome: ${outcome.title}`,
    description: `Workflow outcome recorded. Status: ${outcome.success ? 'SUCCESS' : 'FAILED'}.`,
    metadata: { outcomeId: outcome._id, success: outcome.success, insightsCount: insights.length }
  }).catch(() => {});

  // Update workflow status to COMPLETED if linked
  if (data.workflowId) {
    await CareerAgentWorkflow.findOneAndUpdate(
      { user: userObjectId, _id: data.workflowId },
      { status: 'COMPLETED', completedAt: new Date(), progress: 100 }
    ).catch(() => {});
  }

  return outcome;
};

/**
 * Get user outcomes.
 */
const getOutcomes = async (userId, limit = 20) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  return CareerAgentOutcome.find({ user: userObjectId })
    .populate('workflow')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = {
  recordOutcome,
  getOutcomes
};
