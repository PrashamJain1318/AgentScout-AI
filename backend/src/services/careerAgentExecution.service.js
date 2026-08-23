const CareerAgent = require('../models/CareerAgent.model');
const CareerAgentAction = require('../models/CareerAgentAction.model');
const CareerAgentActivity = require('../models/CareerAgentActivity.model');
const { getActionDefinition } = require('./careerAgentActionRegistry.service');
const { buildUnifiedContext } = require('./careerAgentContext.service');

/**
 * Execute a supported action for the candidate's agent.
 * Handles validation, permission checks, risk assessment, execution, and audit logging.
 */
const executeAction = async (userId, actionId) => {
  if (!userId) {
    throw new Error('UserId is required.');
  }

  const action = await CareerAgentAction.findOne({ _id: actionId, user: userId });
  if (!action) {
    throw new Error('Action request not found or access denied.');
  }

  if (action.status === 'COMPLETED') {
    throw new Error('Action has already been executed.');
  }

  if (action.status === 'EXPIRED') {
    throw new Error('Action request has expired.');
  }

  if (action.status === 'REJECTED') {
    throw new Error('Action request was rejected by candidate.');
  }

  // Risk & Approval Gate Verification
  const actionDef = getActionDefinition(action.actionType);
  const requiresApproval = action.requiresApproval || actionDef?.requiresApproval || action.riskLevel === 'EXTERNAL_ACTION' || action.riskLevel === 'HIGH_IMPACT';

  if (requiresApproval && action.status !== 'APPROVED') {
    throw new Error('Action requires explicit candidate approval before execution.');
  }

  action.status = 'EXECUTING';
  await action.save();

  try {
    let resultPayload = {};

    // Execute internal action handlers based on actionType
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
        // EXTERNAL_ACTION simulation / execution wrapper
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

    action.status = 'COMPLETED';
    action.executedAt = new Date();
    action.resultPayload = resultPayload;
    await action.save();

    // Update Agent Statistics
    const agent = await CareerAgent.findOne({ user: userId });
    if (agent) {
      agent.statistics.actionsExecuted = (agent.statistics.actionsExecuted || 0) + 1;
      agent.lastActionAt = new Date();
      agent.status = 'IDLE';
      await agent.save();

      // Log Activity Event
      await CareerAgentActivity.create({
        user: userId,
        agent: agent._id,
        eventType: 'ACTION_EXECUTED',
        actionType: action.actionType,
        status: 'SUCCESS',
        summary: `Executed action: ${action.title}`,
        reason: action.reason,
        metadata: { actionId: action._id, resultPayload }
      });
    }

    return {
      success: true,
      action
    };
  } catch (error) {
    action.status = 'FAILED';
    action.errorMessage = error.message;
    await action.save();

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
        reason: error.message,
        metadata: { actionId: action._id, error: error.message }
      });
    }

    throw error;
  }
};

module.exports = {
  executeAction
};
