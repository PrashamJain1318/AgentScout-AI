const CareerAgent = require('../models/CareerAgent.model');
const { evaluateEventTrigger } = require('./careerAgentTrigger.service');

/**
 * Career Agent Scheduler Service
 * Evaluates active candidate agents periodically while preventing duplicate actions and scheduler loops.
 */
const runScheduledEvaluations = async (frequency = 'HOURLY') => {
  console.log(`[CareerAgentScheduler] Starting ${frequency} scheduled evaluation cycle...`);

  const activeAgents = await CareerAgent.find({ enabled: true, status: { $ne: 'PAUSED' } }).lean();
  let processedCount = 0;
  let skippedCount = 0;

  for (const agent of activeAgents) {
    try {
      // Inactivity or Scheduled Review Trigger Evaluation
      await evaluateEventTrigger(agent.user, 'SCHEDULED_REVIEW', { frequency });
      processedCount++;
    } catch (err) {
      console.error(`[CareerAgentScheduler] Error evaluating agent for user ${agent.user}:`, err.message);
      skippedCount++;
    }
  }

  console.log(`[CareerAgentScheduler] ${frequency} cycle complete. Evaluated: ${processedCount}, Skipped/Failed: ${skippedCount}`);

  return {
    frequency,
    processedCount,
    skippedCount,
    timestamp: new Date()
  };
};

module.exports = {
  runScheduledEvaluations
};
