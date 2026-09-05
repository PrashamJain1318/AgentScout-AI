const applicationAgentService = require('../services/applicationAgent.service');
const { buildApplicationAgentContext } = require('../services/applicationAgentContext.service');
const { evaluateApplicationDecision } = require('../services/applicationAgentDecision.service');

// GET /api/application-agent
const getAgentState = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const agent = await applicationAgentService.getOrCreateAgent(userId);
    const context = await buildApplicationAgentContext(userId, agent.currentOpportunity);
    const decision = evaluateApplicationDecision(context, agent.preferences?.minimumMatchScore || 75);

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

// POST /api/application-agent/analyze/:opportunityId?
const analyzeOpportunity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const opportunityId = req.params.opportunityId || req.body.opportunityId;
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
    const opportunityId = req.params.opportunityId || req.query.opportunityId;
    const context = await buildApplicationAgentContext(userId, opportunityId);

    res.json({
      success: true,
      data: context
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/application-agent/next-action/:opportunityId?
const getNextAction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const opportunityId = req.params.opportunityId || req.query.opportunityId;
    const agent = await applicationAgentService.getOrCreateAgent(userId);
    const targetOppId = opportunityId || agent.currentOpportunity;
    const context = await buildApplicationAgentContext(userId, targetOppId);
    const decision = evaluateApplicationDecision(context, agent.preferences?.minimumMatchScore || 75);

    res.json({
      success: true,
      data: decision
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/application-agent/run/:opportunityId?
const runAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const opportunityId = req.params.opportunityId || req.body.opportunityId;
    const result = await applicationAgentService.runApplicationAgent(userId, opportunityId);

    res.json({
      success: true,
      message: 'Application Agent reasoning cycle executed',
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
    const { status, opportunityId } = req.query;
    const tasks = await applicationAgentService.getAgentTasks(userId, { status, opportunityId });

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
