const opportunityMonitorService = require('../services/opportunityMonitor.service');
const { evaluateOpportunityFit } = require('../services/opportunityIntelligence.service');
const Opportunity = require('../models/Opportunity.model');

const checkNoMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) {
      const err = new Error(`Invalid request parameter: Mongo operators (${key}) are forbidden`);
      err.statusCode = 400;
      throw err;
    }
  }
};

/**
 * GET /api/opportunity-monitor
 */
const getMonitor = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const monitor = await opportunityMonitorService.getMonitor(userId);

    res.status(200).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/opportunity-monitor
 */
const updateMonitor = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;
    const monitor = await opportunityMonitorService.updateMonitor(userId, req.body || {});

    res.status(200).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/opportunity-monitor/start
 */
const startMonitor = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const monitor = await opportunityMonitorService.startMonitor(userId);

    res.status(200).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/opportunity-monitor/pause
 */
const pauseMonitor = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const monitor = await opportunityMonitorService.pauseMonitor(userId);

    res.status(200).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/opportunity-monitor/run
 */
const runMonitor = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await opportunityMonitorService.runMonitorForUser(userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/opportunity-monitor/status
 */
const getStatus = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const monitor = await opportunityMonitorService.getMonitor(userId);

    res.status(200).json({
      success: true,
      data: {
        enabled: monitor.enabled,
        frequency: monitor.frequency,
        lastRunAt: monitor.lastRunAt,
        nextRunAt: monitor.nextRunAt,
        opportunitiesFound: monitor.opportunitiesFound,
        opportunitiesAlerted: monitor.opportunitiesAlerted
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/opportunity-monitor/recommendations
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const recommendations = await opportunityMonitorService.getRecommendations(userId);

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/opportunity-monitor/new
 */
const getNewOpportunities = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const newOpportunities = await opportunityMonitorService.getNewOpportunities(userId);

    res.status(200).json({
      success: true,
      data: newOpportunities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/opportunity-monitor/digest
 */
const getDigest = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const digest = await opportunityMonitorService.getDigest(userId);

    res.status(200).json({
      success: true,
      data: digest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/opportunity-monitor/:opportunityId/watch
 */
const watchOpportunity = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const result = await opportunityMonitorService.watchOpportunity(userId, opportunityId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/opportunity-monitor/:opportunityId/watch
 */
const unwatchOpportunity = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const result = await opportunityMonitorService.unwatchOpportunity(userId, opportunityId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/opportunity-monitor/:opportunityId/dismiss
 */
const dismissOpportunity = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const result = await opportunityMonitorService.dismissOpportunity(userId, opportunityId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/opportunity-monitor/:opportunityId/view
 */
const markOpportunityViewed = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const result = await opportunityMonitorService.markOpportunityViewed(userId, opportunityId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/opportunity-monitor/:opportunityId/explain
 */
const explainOpportunity = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const opp = await Opportunity.findById(opportunityId);
    if (!opp) {
      const err = new Error('Opportunity not found');
      err.statusCode = 404;
      throw err;
    }

    const fit = await evaluateOpportunityFit(userId, opp);

    res.status(200).json({
      success: true,
      data: fit
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonitor,
  updateMonitor,
  startMonitor,
  pauseMonitor,
  runMonitor,
  getStatus,
  getRecommendations,
  getNewOpportunities,
  getDigest,
  watchOpportunity,
  unwatchOpportunity,
  dismissOpportunity,
  markOpportunityViewed,
  explainOpportunity
};
