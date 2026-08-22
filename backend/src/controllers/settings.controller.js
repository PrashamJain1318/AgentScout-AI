const settingsService = require('../services/settings.service');

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

const sendTokenCookieResponse = (res, statusCode, payload) => {
  const options = {
    expires: new Date(Date.now() + 10 * 1000), // 10s expiration to clear cookie
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.status(statusCode).cookie('token', 'none', options).json(payload);
};

/**
 * GET /api/settings
 */
const getSettings = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);
    const userId = req.user.id || req.user._id;

    const settings = await settingsService.getSettings(userId);

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/settings/account
 */
const updateAccount = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const settings = await settingsService.updateAccount(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Account settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/settings/preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const settings = await settingsService.updateJobPreferences(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Job preferences saved successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/settings/notifications
 */
const updateNotifications = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const settings = await settingsService.updateNotificationPreferences(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/settings/privacy
 */
const updatePrivacy = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const settings = await settingsService.updatePrivacyPreferences(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Privacy settings saved successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/settings/password
 */
const changePassword = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const result = await settingsService.changePassword(userId, req.body || {});

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/settings/logout-all
 */
const logoutAllSessions = async (req, res, next) => {
  try {
    sendTokenCookieResponse(res, 200, {
      success: true,
      message: 'Logged out of all sessions successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/settings/account
 */
const deleteAccount = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const result = await settingsService.deleteAccount(userId, req.body || {});

    sendTokenCookieResponse(res, 200, {
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateAccount,
  updatePreferences,
  updateNotifications,
  updatePrivacy,
  changePassword,
  logoutAllSessions,
  deleteAccount
};
