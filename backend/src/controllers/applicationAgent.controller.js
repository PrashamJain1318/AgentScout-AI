const applicationAgentService = require('../services/applicationAgent.service');
const { buildApplicationAgentContext } = require('../services/applicationAgentContext.service');
const { evaluateApplicationDecision } = require('../services/applicationAgentDecision.service');

/**
 * Controller for Application Agent Endpoints
 * All handlers strictly extract userId from req.user.id.
 */

// GET /api/application-agent
const getAgentState = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const agent = await applicationAgentService.getOrCreateAgent(userId);
    const context = await buildApplicationAgentContext(userId, agent.currentOpportunity);
    const decision = evaluateApplicationDecision(context);

    res.json({
      success: true,
      data: {
        agent,
        context,
        decision
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/application-agent/analyze
const analyzeOpportunity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { opportunityId } = req.body;
    const result = await applicationAgentService.analyzeOpportunity(userId, opportunityId);

    res.json({
      success: true,
      message: 'Opportunity analyzed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/application-agent/context/:opportunityId?
const getContext = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { opportunityId } = req.params;
    const context = await buildApplicationAgentContext(userId, opportunityId);

    res.json({
      success: true,
      data: context
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/application-agent/next-action
const getNextAction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const agent = await applicationAgentService.getOrCreateAgent(userId);
    const context = await buildApplicationAgentContext(userId, agent.currentOpportunity);
    const decision = evaluateApplicationDecision(context);

    res.json({
      success: true,
      data: decision
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/application-agent/run
const runAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { opportunityId } = req.body;
    const result = await applicationAgentService.runApplicationAgent(userId, opportunityId);

    res.json({
      success: true,
      message: 'Application Agent executed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/application-agent/enable
const enableAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mode } = req.body;
    const agent = await applicationAgentService.updateAgentMode(userId, mode || 'ASSISTED');

    res.json({
      success: true,
      message: 'Application Agent enabled',
      data: agent
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/application-agent/disable
const disableAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const agent = await applicationAgentService.setAgentStatus(userId, 'PAUSED');

    res.json({
      success: true,
      message: 'Application Agent paused',
      data: agent
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/application-agent/tasks
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await applicationAgentService.getAgentTasks(userId);

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/application-agent/memory
const getMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const memories = await applicationAgentService.getAgentMemories(userId);

    res.json({
      success: true,
      data: memories
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/application-agent/memory/:memoryId
const deleteMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { memoryId } = req.params;
    const result = await applicationAgentService.deleteAgentMemory(userId, memoryId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/application-agent/drafts
const getDrafts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { opportunityId } = req.query;
    const drafts = await applicationAgentService.getAgentDrafts(userId, opportunityId);

    res.json({
      success: true,
      data: drafts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgentState,
  analyzeOpportunity,
  getContext,
  getNextAction,
  runAgent,
  enableAgent,
  disableAgent,
  getTasks,
  getMemory,
  deleteMemory,
  getDrafts
};
