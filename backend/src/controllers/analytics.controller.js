const analyticsService = require('../services/analytics.service');

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
 * GET /api/analytics/overview
 */
const getOverview = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);
    const userId = req.user.id || req.user._id;

    const data = await analyticsService.getOverviewAnalytics(userId);

    res.status(200).json({
      success: true,
      data,
      overview: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/applications
 */
const getApplicationAnalytics = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);
    const userId = req.user.id || req.user._id;

    const data = await analyticsService.getApplicationAnalyticsFull(userId);

    res.status(200).json({
      success: true,
      data,
      applications: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/matches
 */
const getMatchAnalytics = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);
    const userId = req.user.id || req.user._id;

    const data = await analyticsService.getMatchAnalyticsFull(userId);

    res.status(200).json({
      success: true,
      data,
      matches: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/skills
 */
const getSkillAnalytics = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);
    const userId = req.user.id || req.user._id;

    const data = await analyticsService.getSkillAnalyticsFull(userId);

    res.status(200).json({
      success: true,
      data,
      skills: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/activity
 */
const getActivityAnalytics = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);
    const userId = req.user.id || req.user._id;

    const data = await analyticsService.getActivityAnalyticsFull(userId);

    res.status(200).json({
      success: true,
      data,
      activity: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/insights
 */
const getCareerInsights = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);
    const userId = req.user.id || req.user._id;

    const data = await analyticsService.getCareerInsightsFull(userId);

    res.status(200).json({
      success: true,
      data: data.insights,
      insights: data.insights
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getApplicationAnalytics,
  getMatchAnalytics,
  getSkillAnalytics,
  getActivityAnalytics,
  getCareerInsights
};
