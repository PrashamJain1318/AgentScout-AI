const careerOSService = require('../services/careerOS.service');

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
 * GET /api/career-os
 */
const getSnapshot = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const snapshot = await careerOSService.getSnapshot(userId);

    res.status(200).json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/score
 */
const getScore = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const scoreData = await careerOSService.getScore(userId);

    res.status(200).json({
      success: true,
      data: scoreData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/readiness
 */
const getReadiness = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const readiness = await careerOSService.getReadiness(userId);

    res.status(200).json({
      success: true,
      data: readiness
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/next-action
 */
const getNextAction = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const nextAction = await careerOSService.getNextAction(userId);

    res.status(200).json({
      success: true,
      data: nextAction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/risks
 */
const getRisks = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const risks = await careerOSService.getRisks(userId);

    res.status(200).json({
      success: true,
      data: risks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/momentum
 */
const getMomentum = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const momentum = await careerOSService.getMomentum(userId);

    res.status(200).json({
      success: true,
      data: momentum
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/changes
 */
const getChanges = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const changes = await careerOSService.getChanges(userId);

    res.status(200).json({
      success: true,
      data: changes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/opportunities
 */
const getOpportunities = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const opportunities = await careerOSService.getOpportunities(userId);

    res.status(200).json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/briefing
 */
const getBriefing = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const briefing = await careerOSService.getBriefing(userId);

    res.status(200).json({
      success: true,
      data: briefing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-os/milestones
 */
const getMilestones = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const milestones = await careerOSService.getMilestones(userId);

    res.status(200).json({
      success: true,
      data: milestones
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/career-os/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const snapshot = await careerOSService.rebuildSnapshot(userId);

    res.status(200).json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSnapshot,
  getScore,
  getReadiness,
  getNextAction,
  getRisks,
  getMomentum,
  getChanges,
  getOpportunities,
  getBriefing,
  getMilestones,
  refresh
};
