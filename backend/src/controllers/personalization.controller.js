const personalizationService = require('../services/personalization.service');

const getPersonalization = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await personalizationService.getPersonalization(userId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getAdaptiveDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await personalizationService.getAdaptiveDashboard(userId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getMomentumScore = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await personalizationService.getMomentum(userId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const refreshPersonalization = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await personalizationService.refreshPersonalization(userId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await personalizationService.updatePreferences(userId, req.body);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPersonalization,
  getAdaptiveDashboard,
  getMomentumScore,
  refreshPersonalization,
  updatePreferences
};
