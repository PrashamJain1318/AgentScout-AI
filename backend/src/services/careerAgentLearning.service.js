const mongoose = require('mongoose');
const CareerAgentMemory = require('../models/CareerAgentMemory.model');

/**
 * Record deterministic learning insight into candidate's CareerAgentMemory.
 */
const recordLearningInsight = async (userId, key, value, category = 'PREFERENCE', confidence = 0.85) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let memory = await CareerAgentMemory.findOne({ user: userObjectId, key });

  if (!memory) {
    memory = new CareerAgentMemory({
      user: userObjectId,
      category,
      key,
      value,
      confidence,
      source: 'OUTCOME_LEARNING',
      lastValidated: new Date()
    });
  } else {
    memory.value = value;
    memory.confidence = Math.min(1.0, memory.confidence + 0.05);
    memory.lastValidated = new Date();
  }

  await memory.save();
  return memory;
};

/**
 * Process workflow outcome / approval action for agent learning.
 */
const processLearningFromOutcome = async (userId, outcomeData) => {
  const insights = [];

  if (outcomeData.candidateFeedback?.editsMade) {
    const memory = await recordLearningInsight(
      userId,
      'candidate_edits_preferred',
      'Candidate prefers reviewing and editing AI generated cover letters and application answers before submission.',
      'BEHAVIOR'
    );
    insights.push(memory.value);
  }

  if (outcomeData.type === 'APPLY_OPPORTUNITY' && outcomeData.success) {
    const memory = await recordLearningInsight(
      userId,
      'active_application_momentum',
      'Candidate has active momentum in opportunity application submissions.',
      'GOAL'
    );
    insights.push(memory.value);
  }

  if (outcomeData.interviewScore && outcomeData.interviewScore >= 80) {
    const memory = await recordLearningInsight(
      userId,
      'high_interview_readiness',
      `Candidate demonstrated strong interview readiness (${outcomeData.interviewScore}% score).`,
      'STRENGTH'
    );
    insights.push(memory.value);
  }

  return insights;
};

/**
 * Process user rejections to adjust future prioritization.
 */
const processLearningFromRejection = async (userId, actionType, reason = '') => {
  const key = `rejected_action_${actionType.toLowerCase()}`;
  const value = `Candidate rejected ${actionType} action. Reason: ${reason || 'User preferred alternative action'}`;
  
  const memory = await recordLearningInsight(userId, key, value, 'PREFERENCE', 0.9);
  return memory;
};

module.exports = {
  recordLearningInsight,
  processLearningFromOutcome,
  processLearningFromRejection
};
