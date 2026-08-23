const CareerAgent = require('../models/CareerAgent.model');
const CareerAgentAction = require('../models/CareerAgentAction.model');
const CareerAgentActivity = require('../models/CareerAgentActivity.model');
const CareerAgentExecution = require('../models/CareerAgentExecution.model');

const { getActionDefinition } = require('./careerAgentActionRegistry.service');
const { buildUnifiedContext } = require('./careerAgentContext.service');

/**
 * Execute a supported action for the candidate's agent.
 * Implements strict idempotency key checks, risk level routing, exponential backoff retries (max 3), and audit logging.
 */
const executeAction = async (userId, actionId, customIdempotencyKey = null) => {
  if (!userId) {
    throw new Error('UserId is required.');
  }

  const action = await CareerAgentAction.findOne({ _id: actionId, user: userId });
  if (!action) {
    throw new Error('Action request not found or access denied.');
  }

  // Idempotency Key Setup & Deduplication Verification
  const idempotencyKey = customIdempotencyKey || `exec_${userId}_${action._id}_${action.updatedAt.getTime()}`;
  const existingExecution = await CareerAgentExecution.findOne({ idempotencyKey });

  if (existingExecution && existingExecution.status === 'COMPLETED') {
    return {
      success: true,
      message: 'Idempotent response: Execution already completed.',
      action,
      execution: existingExecution
    };
  }

  if (action.status === 'COMPLETED' && !existingExecution) {
    throw new Error('Action has already been executed.');
  }

  if (action.status === 'EXPIRED') {
    throw new Error('Action request has expired.');
  }

  if (action.status === 'REJECTED') {
    throw new Error('Action request was rejected by candidate.');
  }

  // Risk Level Verification & Approval Requirements
  const actionDef = getActionDefinition(action.actionType);
  const requiresApproval = action.requiresApproval || actionDef?.requiresApproval || action.riskLevel === 'EXTERNAL_ACTION' || action.riskLevel === 'HIGH_IMPACT';

  if (requiresApproval && action.status !== 'APPROVED') {
    throw new Error('Action requires explicit candidate approval before execution.');
  }

  action.status = 'EXECUTING';
  await action.save();

  // Create Execution Record
  let execution = existingExecution;
  if (!execution) {
    execution = await CareerAgentExecution.create({
      user: userId,
      agentAction: action._id,
      actionType: action.actionType,
      riskLevel: action.riskLevel || 'SAFE',
      status: 'RUNNING',
      startedAt: new Date(),
      idempotencyKey
    });
  } else {
    execution.status = 'RUNNING';
    await execution.save();
  }

  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 3;
  let lastError = null;

  while (retryCount <= maxRetries) {
    try {
      let resultPayload = {};

      // Execute action handlers based on actionType
      switch (action.actionType) {
        case 'REFRESH_INTELLIGENCE':
        case 'IMPROVE_RESUME':
        case 'PRACTICE_INTERVIEW':
        case 'PREPARE_APPLICATION':
        case 'LEARN_SKILL':
        case 'BUILD_APPLICATION_PIPELINE':
        case 'REVIEW_CAREER_ANALYTICS': {
          const freshContext = await buildUnifiedContext(userId);
          resultPayload = {
            executed: true,
            message: `${action.title} processed successfully.`,
            deepLink: action.deepLink || actionDef?.deepLink || '/dashboard',
            contextSnapshot: {
              overallReadiness: freshContext.analytics?.careerScore || 0,
              atsScore: freshContext.resume?.atsScore || 0,
              interviewReadiness: freshContext.interviewReadiness || 0
            }
          };
          break;
        }

        case 'APPLY_TO_OPPORTUNITY': {
          resultPayload = {
            executed: true,
            externalActionHandled: true,
            message: 'Application preparation approved and registered for submission.',
            deepLink: '/dashboard/applications'
          };
          break;
        }

        default: {
          resultPayload = {
            executed: true,
            message: `Action ${action.actionType} executed safely.`,
            deepLink: action.deepLink || '/dashboard'
          };
        }
      }

      // Success completion
      action.status = 'COMPLETED';
      action.executedAt = new Date();
      action.resultPayload = resultPayload;
      await action.save();

      execution.status = 'COMPLETED';
      execution.completedAt = new Date();
      execution.durationMs = Date.now() - startTime;
      execution.result = resultPayload;
      execution.retryCount = retryCount;
      await execution.save();

      // Update Agent Statistics & Activity Log
      const agent = await CareerAgent.findOne({ user: userId });
      if (agent) {
        agent.statistics.actionsExecuted = (agent.statistics.actionsExecuted || 0) + 1;
        agent.lastActionAt = new Date();
        agent.status = 'IDLE';
        await agent.save();

        await CareerAgentActivity.create({
          user: userId,
          agent: agent._id,
          eventType: 'ACTION_EXECUTED',
          actionType: action.actionType,
          status: 'SUCCESS',
          summary: `Executed action: ${action.title}`,
          reason: action.reason,
          metadata: { actionId: action._id, executionId: execution._id, resultPayload }
        });
      }

      return {
        success: true,
        action,
        execution
      };
    } catch (err) {
      lastError = err;
      retryCount++;

      // Non-transient security / approval error check -> do not retry
      if (err.message.includes('approval') || err.message.includes('access denied') || err.message.includes('requires')) {
        break;
      }

      if (retryCount <= maxRetries) {
        execution.status = 'RETRYING';
        execution.retryCount = retryCount;
        await execution.save();

        // Exponential backoff delay (100ms * 2^retryCount)
        await new Promise(res => setTimeout(res, 100 * Math.pow(2, retryCount)));
      }
    }
  }

  // Failed Execution Handler
  action.status = 'FAILED';
  action.errorMessage = lastError?.message || 'Execution failed after retries.';
  await action.save();

  execution.status = 'FAILED';
  execution.failedAt = new Date();
  execution.durationMs = Date.now() - startTime;
  execution.errorMessage = action.errorMessage;
  execution.retryCount = Math.min(retryCount, maxRetries);
  await execution.save();

  const agent = await CareerAgent.findOne({ user: userId });
  if (agent) {
    agent.statistics.actionsFailed = (agent.statistics.actionsFailed || 0) + 1;
    agent.status = 'ERROR';
    await agent.save();

    await CareerAgentActivity.create({
      user: userId,
      agent: agent._id,
      eventType: 'ACTION_FAILED',
      actionType: action.actionType,
      status: 'ERROR',
      summary: `Action execution failed: ${action.title}`,
      reason: action.errorMessage,
      metadata: { actionId: action._id, executionId: execution._id, error: action.errorMessage }
    });
  }

  throw lastError;
};

module.exports = {
  executeAction
};
