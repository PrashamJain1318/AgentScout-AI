const CareerAgent = require('../models/CareerAgent.model');
const CareerAgentAction = require('../models/CareerAgentAction.model');
const CareerAgentMemory = require('../models/CareerAgentMemory.model');
const CareerAgentActivity = require('../models/CareerAgentActivity.model');
const { buildUnifiedContext } = require('../services/careerAgentContext.service');
const { selectNextBestAction } = require('../services/careerAgentDecision.service');
const { executeAction } = require('../services/careerAgentExecution.service');
const { getActionDefinition } = require('../services/careerAgentActionRegistry.service');

/**
 * Get or initialize Career Agent state for candidate.
 */
const getAgentState = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let agent = await CareerAgent.findOne({ user: userId });

    if (!agent) {
      agent = await CareerAgent.create({
        user: userId,
        enabled: true,
        status: 'IDLE'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Unified Career Context for candidate.
 */
const getContext = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const context = await buildUnifiedContext(userId);

    res.status(200).json({
      success: true,
      data: context
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Next-Best-Action for candidate.
 */
const getNextAction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const context = await buildUnifiedContext(userId);
    const memories = await CareerAgentMemory.find({ user: userId }).lean();
    const nextAction = selectNextBestAction(context, memories);

    res.status(200).json({
      success: true,
      data: nextAction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Run one complete Career Agent reasoning and decision cycle.
 */
const runAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let agent = await CareerAgent.findOne({ user: userId });

    if (!agent) {
      agent = await CareerAgent.create({ user: userId });
    }

    if (!agent.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Career Agent is currently disabled. Enable agent to run reasoning cycle.'
      });
    }

    agent.status = 'ANALYZING';
    agent.lastRunAt = new Date();
    await agent.save();

    // 1. Build unified context
    const context = await buildUnifiedContext(userId);

    // 2. Fetch memory
    const memories = await CareerAgentMemory.find({ user: userId }).lean();

    // 3. Generate Next Best Action Decision
    agent.status = 'REASONING';
    await agent.save();
    const nextAction = selectNextBestAction(context, memories);

    // 4. Update Agent State
    agent.careerStage = context.analytics?.careerScore >= 80 ? 'JOB_DISCOVERY' : 'RESUME_OPTIMIZATION';
    agent.readiness = {
      overall: context.analytics?.careerScore || 0,
      profile: context.profile?.completion || 0,
      resume: context.resume?.atsScore || 0,
      application: context.applicationReadiness || 0,
      interview: context.interviewReadiness || 0,
      skills: context.skills?.coverageScore || 0
    };

    agent.agentState = {
      currentPriority: nextAction.reason,
      currentAction: nextAction.action,
      currentReason: nextAction.reason,
      confidence: nextAction.confidence,
      urgency: nextAction.urgency,
      impact: nextAction.impact
    };

    agent.lastDecisionAt = new Date();
    agent.lastContextSnapshot = {
      careerScore: context.analytics?.careerScore,
      totalApplications: context.applications?.total,
      highQualityMatches: context.opportunities?.highQualityCount
    };
    agent.lastReasoningSummary = {
      decision: nextAction.action,
      reason: nextAction.reason,
      evidence: nextAction.evidence,
      confidence: nextAction.confidence
    };
    agent.statistics.decisionsMade = (agent.statistics.decisionsMade || 0) + 1;
    agent.statistics.recommendationsCreated = (agent.statistics.recommendationsCreated || 0) + 1;
    agent.status = nextAction.requiresApproval ? 'ACTION_REQUIRED' : 'IDLE';
    await agent.save();

    // 5. Create or Update Pending Action Request if approval is needed
    let actionRecord = null;
    const actionDef = getActionDefinition(nextAction.action);
    const requiresApproval = nextAction.requiresApproval || actionDef?.requiresApproval || nextAction.riskLevel === 'EXTERNAL_ACTION' || nextAction.riskLevel === 'HIGH_IMPACT';

    if (requiresApproval) {
      actionRecord = await CareerAgentAction.create({
        user: userId,
        agent: agent._id,
        actionType: nextAction.action,
        title: nextAction.title,
        category: nextAction.category || 'career',
        riskLevel: nextAction.riskLevel || 'SAFE',
        status: 'PENDING',
        reason: nextAction.reason,
        evidence: nextAction.evidence,
        confidence: nextAction.confidence,
        impact: nextAction.impact,
        urgency: nextAction.urgency,
        deepLink: nextAction.deepLink,
        requiresApproval: true
      });
    }

    // 6. Log Activity Event
    await CareerAgentActivity.create({
      user: userId,
      agent: agent._id,
      eventType: 'DECISION_MADE',
      actionType: nextAction.action,
      status: 'SUCCESS',
      summary: `Generated next best action: ${nextAction.title}`,
      reason: nextAction.reason,
      metadata: { nextAction, actionRecordId: actionRecord?._id }
    });

    res.status(200).json({
      success: true,
      data: {
        agent,
        nextAction,
        actionRecord,
        requiresApproval
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Career Context and run reasoning cycle.
 */
const refreshAgent = async (req, res, next) => {
  return runAgent(req, res, next);
};

/**
 * Get Agent Activity history.
 */
const getActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activities = await CareerAgentActivity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Agent Memory list.
 */
const getMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const memories = await CareerAgentMemory.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: memories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a specific memory item.
 */
const deleteMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { memoryId } = req.params;

    const memory = await CareerAgentMemory.findOneAndDelete({ _id: memoryId, user: userId });
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Memory item removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve pending action request.
 */
const approveAction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { actionId } = req.params;

    const action = await CareerAgentAction.findOne({ _id: actionId, user: userId });
    if (!action) {
      return res.status(404).json({ success: false, message: 'Action request not found.' });
    }

    if (action.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Action cannot be approved from status: ${action.status}` });
    }

    action.status = 'APPROVED';
    action.approvedAt = new Date();
    action.approvedBy = userId;
    await action.save();

    const agent = await CareerAgent.findOne({ user: userId });
    if (agent) {
      agent.statistics.actionsApproved = (agent.statistics.actionsApproved || 0) + 1;
      await agent.save();

      await CareerAgentActivity.create({
        user: userId,
        agent: agent._id,
        eventType: 'ACTION_APPROVED',
        actionType: action.actionType,
        status: 'SUCCESS',
        summary: `Candidate approved action: ${action.title}`,
        reason: action.reason
      });
    }

    res.status(200).json({
      success: true,
      data: action
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject pending action request.
 */
const rejectAction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { actionId } = req.params;

    const action = await CareerAgentAction.findOne({ _id: actionId, user: userId });
    if (!action) {
      return res.status(404).json({ success: false, message: 'Action request not found.' });
    }

    action.status = 'REJECTED';
    action.rejectedAt = new Date();
    await action.save();

    const agent = await CareerAgent.findOne({ user: userId });
    if (agent) {
      agent.statistics.actionsRejected = (agent.statistics.actionsRejected || 0) + 1;
      agent.status = 'IDLE';
      await agent.save();

      await CareerAgentActivity.create({
        user: userId,
        agent: agent._id,
        eventType: 'ACTION_REJECTED',
        actionType: action.actionType,
        status: 'WARNING',
        summary: `Candidate rejected action: ${action.title}`,
        reason: action.reason
      });
    }

    res.status(200).json({
      success: true,
      data: action
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute approved action.
 */
const executeActionHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { actionId } = req.params;

    const result = await executeAction(userId, actionId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Enable Agent.
 */
const enableAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let agent = await CareerAgent.findOne({ user: userId });
    if (!agent) {
      agent = await CareerAgent.create({ user: userId });
    }

    agent.enabled = true;
    agent.status = 'IDLE';
    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Career Agent enabled successfully.',
      data: agent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable Agent.
 */
const disableAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let agent = await CareerAgent.findOne({ user: userId });
    if (!agent) {
      agent = await CareerAgent.create({ user: userId });
    }

    agent.enabled = false;
    agent.status = 'PAUSED';
    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Career Agent paused.',
      data: agent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Agent statistics.
 */
const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let agent = await CareerAgent.findOne({ user: userId });
    if (!agent) {
      agent = await CareerAgent.create({ user: userId });
    }

    res.status(200).json({
      success: true,
      data: agent.statistics || {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgentState,
  getContext,
  getNextAction,
  runAgent,
  refreshAgent,
  getActivity,
  getMemory,
  deleteMemory,
  approveAction,
  rejectAction,
  executeActionHandler,
  enableAgent,
  disableAgent,
  getStatistics
};
