const { getPredictiveIntelligence } = require('../services/predictiveCareerIntelligence.service');
const CareerInsight = require('../models/CareerInsight.model');

const getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, false);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getHealth = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, false);
    res.status(200).json({
      success: true,
      data: data.careerHealth
    });
  } catch (error) {
    next(error);
  }
};

const getSkills = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, false);
    res.status(200).json({
      success: true,
      data: data.skillGaps
    });
  } catch (error) {
    next(error);
  }
};

const getBottlenecks = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, false);
    res.status(200).json({
      success: true,
      data: data.bottlenecks
    });
  } catch (error) {
    next(error);
  }
};

const getMomentum = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, false);
    res.status(200).json({
      success: true,
      data: {
        score: data.careerHealth.breakdown.careerMomentum,
        category: data.careerHealth.breakdown.careerMomentum >= 75 ? 'ACCELERATING 🚀' : 'PROGRESSING 📈'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getForecast = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, false);
    res.status(200).json({
      success: true,
      data: data.forecasts
    });
  } catch (error) {
    next(error);
  }
};

const getRisks = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, false);
    res.status(200).json({
      success: true,
      data: data.risks
    });
  } catch (error) {
    next(error);
  }
};

const getInsights = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const insights = await CareerInsight.find({ user: userId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};

const getActions = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, false);
    res.status(200).json({
      success: true,
      data: data.roiActions
    });
  } catch (error) {
    next(error);
  }
};

const runAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getPredictiveIntelligence(userId, true);
    res.status(200).json({
      success: true,
      message: 'Predictive career intelligence analysis recalculated successfully.',
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getHealth,
  getSkills,
  getBottlenecks,
  getMomentum,
  getForecast,
  getRisks,
  getInsights,
  getActions,
  runAnalysis
};
