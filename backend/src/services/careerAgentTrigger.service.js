const CareerAgent = require('../models/CareerAgent.model');
const CareerAgentTrigger = require('../models/CareerAgentTrigger.model');
const CareerAgentNotification = require('../models/CareerAgentNotification.model');
const CareerAgentActivity = require('../models/CareerAgentActivity.model');
const CareerAgentMemory = require('../models/CareerAgentMemory.model');
const CareerAgentAction = require('../models/CareerAgentAction.model');

const { buildUnifiedContext } = require('./careerAgentContext.service');
const { selectNextBestAction } = require('./careerAgentDecision.service');
const { getActionDefinition } = require('./careerAgentActionRegistry.service');
const { executeAction } = require('./careerAgentExecution.service');

/**
 * Event Detection Engine & Event -> Reasoning -> Action Execution Pipeline
 */
const evaluateEventTrigger = async (userId, eventType, eventData = {}) => {
  if (!userId) {
    throw new Error('UserId is required for event trigger evaluation.');
  }

  let agent = await CareerAgent.findOne({ user: userId });
  if (!agent) {
    agent = await CareerAgent.create({
      user: userId,
      enabled: true,
      mode: 'AUTONOMOUS',
      status: 'IDLE'
    });
  }

  if (!agent.enabled) {
    agent.enabled = true;
    agent.status = 'IDLE';
    await agent.save();
  }

  // Record Trigger Registration/Update
  let triggerRecord = await CareerAgentTrigger.findOne({ user: userId, type: eventType });
  if (!triggerRecord) {
    triggerRecord = await CareerAgentTrigger.create({
      user: userId,
      type: eventType,
      name: `Trigger: ${eventType}`,
      description: `Automated event detection for ${eventType}`,
      enabled: true,
      frequency: 'EVENT_DRIVEN'
    });
  }

  triggerRecord.lastEvaluatedAt = new Date();
  triggerRecord.lastTriggeredAt = new Date();
  triggerRecord.triggerCount = (triggerRecord.triggerCount || 0) + 1;
  await triggerRecord.save();

  // 1. Build fresh unified context
  const context = await buildUnifiedContext(userId);

  // 2. Fetch long-term memory
  const memories = await CareerAgentMemory.find({ user: userId }).lean();

  // 3. Run Decision Engine
  const nextAction = selectNextBestAction(context, memories);
  const actionDef = getActionDefinition(nextAction.action);

  // 4. Classify Risk & Required Approval Level
  const isSafeAction = nextAction.riskLevel === 'SAFE' && actionDef?.riskLevel === 'SAFE';
  const isExternalAction = nextAction.riskLevel === 'EXTERNAL_ACTION' || actionDef?.riskLevel === 'EXTERNAL_ACTION';
  
  // Risk Routing Rules based on Agent Mode:
  // MANUAL: All actions require approval
  // ASSISTED: SAFE internal actions recommendations generated; HIGH_IMPACT / EXTERNAL require approval
  // AUTONOMOUS: SAFE actions auto-execute; HIGH_IMPACT & EXTERNAL require approval
  const shouldAutoExecute = agent.mode === 'AUTONOMOUS' && isSafeAction && !isExternalAction;

  // 5. Create or Find Action Record with Idempotency Key
  let actionRecord = await CareerAgentAction.findOne({ user: userId, actionType: nextAction.action, status: 'PENDING' });

  if (!actionRecord) {
    actionRecord = await CareerAgentAction.create({
      user: userId,
      agent: agent._id,
      actionType: nextAction.action,
      title: nextAction.title,
      category: nextAction.category || 'career',
      riskLevel: nextAction.riskLevel || 'SAFE',
      status: shouldAutoExecute ? 'APPROVED' : 'PENDING',
      reason: nextAction.reason,
      evidence: nextAction.evidence,
      confidence: nextAction.confidence,
      impact: nextAction.impact,
      urgency: nextAction.urgency,
      deepLink: nextAction.deepLink,
      requiresApproval: !shouldAutoExecute
    });
  }

  // 6. Send Deduplicated Intelligent Notification
  const dedupKey = `notif_${userId}_${eventType}_${nextAction.action}_${new Date().toISOString().split('T')[0]}`;
  let notification = await CareerAgentNotification.findOne({ deduplicationKey: dedupKey });

  if (!notification) {
    try {
      notification = await CareerAgentNotification.create({
        user: userId,
        type: eventType === 'NEW_HIGH_MATCH' ? 'HIGH_MATCH_DISCOVERED' : eventType === 'READINESS_CHANGED' ? 'READINESS_IMPROVED' : 'ACTION_REQUIRED',
        title: `AI Agent Priority: ${nextAction.title}`,
        message: nextAction.reason,
        priority: nextAction.urgency === 'critical' ? 'CRITICAL' : nextAction.urgency === 'high' ? 'HIGH' : 'MEDIUM',
        relatedAction: actionRecord._id,
        deduplicationKey: dedupKey
      });
      agent.statistics.notificationsSent = (agent.statistics.notificationsSent || 0) + 1;
    } catch (err) {
      // Duplicate key ignored
      agent.statistics.duplicatesPrevented = (agent.statistics.duplicatesPrevented || 0) + 1;
    }
  } else {
    agent.statistics.duplicatesPrevented = (agent.statistics.duplicatesPrevented || 0) + 1;
  }

  // 7. Execute SAFE actions automatically if in AUTONOMOUS mode
  let executionResult = null;
  if (shouldAutoExecute) {
    try {
      executionResult = await executeAction(userId, actionRecord._id);
      agent.statistics.actionsAutomated = (agent.statistics.actionsAutomated || 0) + 1;
    } catch (err) {
      console.warn(`Autonomous execution warning for action ${actionRecord._id}:`, err.message);
    }
  }

  await agent.save();

  // 8. Log Audit Event
  await CareerAgentActivity.create({
    user: userId,
    agent: agent._id,
    eventType: shouldAutoExecute ? 'ACTION_EXECUTED' : 'ACTION_REQUESTED',
    actionType: nextAction.action,
    status: 'SUCCESS',
    summary: `Trigger [${eventType}] processed: ${nextAction.title}`,
    reason: nextAction.reason,
    metadata: { eventType, shouldAutoExecute, actionRecordId: actionRecord._id }
  });

  return {
    evaluated: true,
    eventType,
    mode: agent.mode,
    nextAction,
    actionRecord,
    autoExecuted: shouldAutoExecute,
    executionResult
  };
};

module.exports = {
  evaluateEventTrigger
};
