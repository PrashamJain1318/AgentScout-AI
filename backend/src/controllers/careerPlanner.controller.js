const careerActionPlannerService = require('../services/careerActionPlanner.service');

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
 * GET /api/career-planner/today
 */
const getTodayPlan = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await careerActionPlannerService.getTodayPlan(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-planner/week
 */
const getWeeklyPlan = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await careerActionPlannerService.getWeeklyPlan(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-planner/overview
 */
const getPlannerOverview = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await careerActionPlannerService.getPlannerOverview(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/career-planner/generate
 */
const generatePlan = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await careerActionPlannerService.generatePlan(userId, true);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/career-planner/actions/:actionId
 */
const updateAction = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;
    const { actionId } = req.params;
    const { status } = req.body || {};

    const data = await careerActionPlannerService.updateActionState(userId, actionId, status || 'completed');

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/career-planner/actions/:actionId/complete
 */
const completeAction = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { actionId } = req.params;

    const data = await careerActionPlannerService.updateActionState(userId, actionId, 'completed');

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/career-planner/actions/:actionId/skip
 */
const skipAction = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { actionId } = req.params;

    const data = await careerActionPlannerService.updateActionState(userId, actionId, 'skipped');

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-planner/milestones
 */
const getMilestones = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const plan = await careerActionPlannerService.getTodayPlan(userId);

    res.status(200).json({
      success: true,
      milestones: plan.careerMilestones || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/career-planner/refresh
 */
const refreshPlan = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await careerActionPlannerService.generatePlan(userId, true);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayPlan,
  getWeeklyPlan,
  getPlannerOverview,
  generatePlan,
  updateAction,
  completeAction,
  skipAction,
  getMilestones,
  refreshPlan
};
