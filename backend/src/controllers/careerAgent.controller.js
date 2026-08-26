const CareerAgent = require('../models/CareerAgent.model');
const CareerAgentAction = require('../models/CareerAgentAction.model');
const CareerAgentMemory = require('../models/CareerAgentMemory.model');
const CareerAgentActivity = require('../models/CareerAgentActivity.model');
const CareerAgentTrigger = require('../models/CareerAgentTrigger.model');
const CareerAgentExecution = require('../models/CareerAgentExecution.model');
const CareerAgentNotification = require('../models/CareerAgentNotification.model');

const { buildUnifiedContext } = require('../services/careerAgentContext.service');
const { selectNextBestAction } = require('../services/careerAgentDecision.service');
const { executeAction } = require('../services/careerAgentExecution.service');
const { getActionDefinition } = require('../services/careerAgentActionRegistry.service');
const { evaluateEventTrigger } = require('../services/careerAgentTrigger.service');
const { runScheduledEvaluations } = require('../services/careerAgentScheduler.service');

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
        status: 'IDLE',
        mode: 'AUTONOMOUS'
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

    // Check risk and execution requirements
    const actionDef = getActionDefinition(nextAction.action);
    const isSafe = nextAction.riskLevel === 'SAFE' && actionDef?.riskLevel === 'SAFE';
    const isExternal = nextAction.riskLevel === 'EXTERNAL_ACTION' || actionDef?.riskLevel === 'EXTERNAL_ACTION';
    const shouldAutoExec = agent.mode === 'AUTONOMOUS' && isSafe && !isExternal;

    let actionRecord = await CareerAgentAction.create({
      user: userId,
      agent: agent._id,
      actionType: nextAction.action,
      title: nextAction.title,
      category: nextAction.category || 'career',
      riskLevel: nextAction.riskLevel || 'SAFE',
      status: shouldAutoExec ? 'APPROVED' : 'PENDING',
      reason: nextAction.reason,
      evidence: nextAction.evidence,
      confidence: nextAction.confidence,
      impact: nextAction.impact,
      urgency: nextAction.urgency,
      deepLink: nextAction.deepLink,
      requiresApproval: !shouldAutoExec
    });

    if (shouldAutoExec) {
      try {
        await executeAction(userId, actionRecord._id);
        agent.statistics.actionsAutomated = (agent.statistics.actionsAutomated || 0) + 1;
        agent.status = 'IDLE';
      } catch (err) {
        agent.status = 'ERROR';
      }
    } else {
      agent.status = 'ACTION_REQUIRED';
    }

    await agent.save();

    await CareerAgentActivity.create({
      user: userId,
      agent: agent._id,
      eventType: shouldAutoExec ? 'ACTION_EXECUTED' : 'DECISION_MADE',
      actionType: nextAction.action,
      status: 'SUCCESS',
      summary: `Generated next best action: ${nextAction.title}`,
      reason: nextAction.reason,
      metadata: { nextAction, actionRecordId: actionRecord._id, autoExecuted: shouldAutoExec }
    });

    res.status(200).json({
      success: true,
      data: {
        agent,
        nextAction,
        actionRecord,
        requiresApproval: !shouldAutoExec
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

// ==========================================
// PHASE 17.1 AUTOMATION & TRIGGER CONTROLLERS
// ==========================================

const getTriggers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const triggers = await CareerAgentTrigger.find({ user: userId }).sort({ updatedAt: -1 }).lean();
    res.status(200).json({ success: true, data: triggers });
  } catch (error) {
    next(error);
  }
};

const createTrigger = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, name, description, frequency, conditions } = req.body;

    const trigger = await CareerAgentTrigger.create({
      user: userId,
      type,
      name: name || `Trigger: ${type}`,
      description: description || '',
      frequency: frequency || 'EVENT_DRIVEN',
      conditions: conditions || {}
    });

    res.status(201).json({ success: true, data: trigger });
  } catch (error) {
    next(error);
  }
};

const updateTrigger = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { triggerId } = req.params;
    const { enabled, frequency, conditions } = req.body;

    const trigger = await CareerAgentTrigger.findOneAndUpdate(
      { _id: triggerId, user: userId },
      { $set: { enabled, frequency, conditions } },
      { new: true }
    );

    if (!trigger) {
      return res.status(404).json({ success: false, message: 'Trigger not found.' });
    }

    res.status(200).json({ success: true, data: trigger });
  } catch (error) {
    next(error);
  }
};

const deleteTrigger = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { triggerId } = req.params;

    const trigger = await CareerAgentTrigger.findOneAndDelete({ _id: triggerId, user: userId });
    if (!trigger) {
      return res.status(404).json({ success: false, message: 'Trigger not found.' });
    }

    res.status(200).json({ success: true, message: 'Trigger deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await CareerAgentNotification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

const getExecutions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const executions = await CareerAgentExecution.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.status(200).json({ success: true, data: executions });
  } catch (error) {
    next(error);
  }
};

const getPendingActions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pendingActions = await CareerAgentAction.find({ user: userId, status: 'PENDING' })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: pendingActions });
  } catch (error) {
    next(error);
  }
};

const evaluateAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { eventType, eventData } = req.body;

    const result = await evaluateEventTrigger(userId, eventType || 'SCHEDULED_REVIEW', eventData || {});
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const runScheduler = async (req, res, next) => {
  try {
    const { frequency } = req.body;
    const result = await runScheduledEvaluations(frequency || 'HOURLY');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAutomationStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let agent = await CareerAgent.findOne({ user: userId });
    if (!agent) {
      agent = await CareerAgent.create({ user: userId });
    }

    const [triggerCount, pendingCount, executionCount, notificationCount] = await Promise.all([
      CareerAgentTrigger.countDocuments({ user: userId, enabled: true }),
      CareerAgentAction.countDocuments({ user: userId, status: 'PENDING' }),
      CareerAgentExecution.countDocuments({ user: userId }),
      CareerAgentNotification.countDocuments({ user: userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        enabled: agent.enabled,
        status: agent.status,
        mode: agent.mode || 'AUTONOMOUS',
        triggerCount,
        pendingCount,
        executionCount,
        notificationCount,
        statistics: agent.statistics || {}
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateMode = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mode } = req.body;

    const validModes = ['MANUAL', 'ASSISTED', 'AUTONOMOUS'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ success: false, message: 'Invalid automation mode specified.' });
    }

    let agent = await CareerAgent.findOne({ user: userId });
    if (!agent) {
      agent = await CareerAgent.create({ user: userId });
    }

    agent.mode = mode;
    await agent.save();

    await CareerAgentActivity.create({
      user: userId,
      agent: agent._id,
      eventType: 'MEMORY_UPDATED',
      status: 'INFO',
      summary: `Switched agent mode to ${mode}`,
      reason: `Candidate updated automation mode.`
    });

    res.status(200).json({
      success: true,
      message: `Automation mode updated to ${mode}.`,
      data: agent
    });
  } catch (error) {
    next(error);
  }
};

const workflowService = require('../services/careerAgentWorkflow.service');
const actionPackageService = require('../services/careerAgentActionPackage.service');
const approvalService = require('../services/careerAgentApproval.service');
const outcomeService = require('../services/careerAgentOutcome.service');

// ==========================================
// PHASE 17.2 WORKFLOW & APPROVAL CONTROLLERS
// ==========================================

const createWorkflowHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workflow = await workflowService.createWorkflow(userId, req.body || {});
    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const getWorkflowsHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workflows = await workflowService.getWorkflows(userId);
    res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    next(error);
  }
};

const getWorkflowByIdHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;
    const workflow = await workflowService.getWorkflowById(userId, workflowId);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const startWorkflowHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;
    const workflow = await workflowService.startWorkflow(userId, workflowId);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const pauseWorkflowHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;
    const workflow = await workflowService.pauseWorkflow(userId, workflowId);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const cancelWorkflowHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;
    const workflow = await workflowService.cancelWorkflow(userId, workflowId);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const approveWorkflowHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;
    const result = await workflowService.approveWorkflow(userId, workflowId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const rejectWorkflowHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;
    const { reason } = req.body || {};
    const workflow = await workflowService.rejectWorkflow(userId, workflowId, reason);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const getWorkflowPackageHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;
    const workflow = await workflowService.getWorkflowById(userId, workflowId);
    const pkg = await actionPackageService.getActionPackage(userId, workflow.actionPackage?._id || workflow.actionPackage || workflowId);
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

const getApprovalCenterHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await approvalService.getApprovalCenterData(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getActionPreviewHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { actionId } = req.params;
    const preview = await approvalService.generateActionPreview(userId, actionId);
    res.status(200).json({ success: true, data: preview });
  } catch (error) {
    next(error);
  }
};

const editActionPackageContentHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { actionId } = req.params;
    const { field, content } = req.body || {};
    const pkg = await actionPackageService.updatePackageContent(userId, actionId, field, content);
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

const approveActionPackageHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { actionId } = req.params;
    const pkg = await actionPackageService.approvePackage(userId, actionId);
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

const recordOutcomeHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const outcome = await outcomeService.recordOutcome(userId, req.body || {});
    res.status(201).json({ success: true, data: outcome });
  } catch (error) {
    next(error);
  }
};

const getOutcomesHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const outcomes = await outcomeService.getOutcomes(userId);
    res.status(200).json({ success: true, data: outcomes });
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
  getStatistics,
  getTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
  getNotifications,
  getExecutions,
  getPendingActions,
  evaluateAgent,
  runScheduler,
  getAutomationStatus,
  updateMode,
  createWorkflowHandler,
  getWorkflowsHandler,
  getWorkflowByIdHandler,
  startWorkflowHandler,
  pauseWorkflowHandler,
  cancelWorkflowHandler,
  approveWorkflowHandler,
  rejectWorkflowHandler,
  getWorkflowPackageHandler,
  getApprovalCenterHandler,
  getActionPreviewHandler,
  editActionPackageContentHandler,
  approveActionPackageHandler,
  recordOutcomeHandler,
  getOutcomesHandler
};
