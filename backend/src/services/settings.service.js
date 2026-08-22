const User = require('../models/User.model');
const Application = require('../models/Application.model');
const Match = require('../models/Match.model');
const Notification = require('../models/Notification.model');

/**
 * Get formatted settings for authenticated user.
 */
const getSettings = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const p = user.profile || {};
  const pref = p.preferences || {};
  const notif = p.notificationPreferences || {};
  const priv = p.privacyPreferences || {};

  return {
    account: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    },
    jobPreferences: {
      desiredRoles: Array.isArray(pref.desiredRoles) ? pref.desiredRoles : [],
      preferredLocations: Array.isArray(pref.preferredLocations) ? pref.preferredLocations : [],
      jobTypes: Array.isArray(pref.jobTypes) ? pref.jobTypes : ['Full-time'],
      workModes: Array.isArray(pref.workModes) ? pref.workModes : ['Remote', 'Hybrid'],
      minimumSalary: typeof pref.minimumSalary === 'number' ? pref.minimumSalary : 0,
      experienceLevel: pref.experienceLevel || 'Mid Level',
      remotePreference: typeof pref.remotePreference === 'boolean' ? pref.remotePreference : true
    },
    notificationPreferences: {
      newMatches: typeof notif.newMatches === 'boolean' ? notif.newMatches : true,
      excellentMatches: typeof notif.excellentMatches === 'boolean' ? notif.excellentMatches : true,
      applicationUpdates: typeof notif.applicationUpdates === 'boolean' ? notif.applicationUpdates : true,
      interviewAlerts: typeof notif.interviewAlerts === 'boolean' ? notif.interviewAlerts : true,
      offerAlerts: typeof notif.offerAlerts === 'boolean' ? notif.offerAlerts : true,
      careerCopilot: typeof notif.careerCopilot === 'boolean' ? notif.careerCopilot : true,
      emailNotifications: typeof notif.emailNotifications === 'boolean' ? notif.emailNotifications : false
    },
    privacyPreferences: {
      profileVisibility: priv.profileVisibility || 'recruiters',
      recruiterDiscovery: typeof priv.recruiterDiscovery === 'boolean' ? priv.recruiterDiscovery : true,
      aiPersonalization: typeof priv.aiPersonalization === 'boolean' ? priv.aiPersonalization : true
    }
  };
};

/**
 * Update Account settings (firstName, lastName)
 */
const updateAccount = async (userId, data = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.firstName !== undefined) {
    if (typeof data.firstName !== 'string' || !data.firstName.trim()) {
      const err = new Error('First name is required');
      err.statusCode = 400;
      throw err;
    }
    user.firstName = data.firstName.trim();
  }

  if (data.lastName !== undefined) {
    if (typeof data.lastName !== 'string' || !data.lastName.trim()) {
      const err = new Error('Last name is required');
      err.statusCode = 400;
      throw err;
    }
    user.lastName = data.lastName.trim();
  }

  await user.save();
  return getSettings(userId);
};

/**
 * Update Job Preferences
 */
const updateJobPreferences = async (userId, data = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (!user.profile) user.profile = {};
  if (!user.profile.preferences) user.profile.preferences = {};

  const pref = user.profile.preferences;

  if (Array.isArray(data.desiredRoles)) {
    pref.desiredRoles = data.desiredRoles.filter(r => typeof r === 'string').map(r => r.trim());
  }

  if (Array.isArray(data.preferredLocations)) {
    pref.preferredLocations = data.preferredLocations.filter(l => typeof l === 'string').map(l => l.trim());
  }

  if (Array.isArray(data.jobTypes)) {
    pref.jobTypes = data.jobTypes.filter(t => typeof t === 'string');
  }

  if (Array.isArray(data.workModes)) {
    pref.workModes = data.workModes.filter(w => typeof w === 'string');
  }

  if (typeof data.minimumSalary === 'number' || (typeof data.minimumSalary === 'string' && !isNaN(Number(data.minimumSalary)))) {
    pref.minimumSalary = Math.max(0, Number(data.minimumSalary));
  }

  if (typeof data.experienceLevel === 'string' && data.experienceLevel.trim()) {
    pref.experienceLevel = data.experienceLevel.trim();
  }

  if (typeof data.remotePreference === 'boolean') {
    pref.remotePreference = data.remotePreference;
  }

  user.markModified('profile');
  await user.save();

  return getSettings(userId);
};

/**
 * Update Notification Preferences
 */
const updateNotificationPreferences = async (userId, data = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (!user.profile) user.profile = {};
  if (!user.profile.notificationPreferences) user.profile.notificationPreferences = {};

  const notif = user.profile.notificationPreferences;
  const boolFields = [
    'newMatches',
    'excellentMatches',
    'applicationUpdates',
    'interviewAlerts',
    'offerAlerts',
    'careerCopilot',
    'emailNotifications'
  ];

  boolFields.forEach(field => {
    if (typeof data[field] === 'boolean') {
      notif[field] = data[field];
    }
  });

  user.markModified('profile');
  await user.save();

  return getSettings(userId);
};

/**
 * Update Privacy Preferences
 */
const updatePrivacyPreferences = async (userId, data = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (!user.profile) user.profile = {};
  if (!user.profile.privacyPreferences) user.profile.privacyPreferences = {};

  const priv = user.profile.privacyPreferences;

  if (data.profileVisibility && ['public', 'recruiters', 'private'].includes(data.profileVisibility)) {
    priv.profileVisibility = data.profileVisibility;
  }

  if (typeof data.recruiterDiscovery === 'boolean') {
    priv.recruiterDiscovery = data.recruiterDiscovery;
  }

  if (typeof data.aiPersonalization === 'boolean') {
    priv.aiPersonalization = data.aiPersonalization;
  }

  user.markModified('profile');
  await user.save();

  return getSettings(userId);
};

/**
 * Change Password with current password verification
 */
const changePassword = async (userId, { currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword) {
    const err = new Error('Current password is required');
    err.statusCode = 400;
    throw err;
  }

  if (!newPassword || newPassword.length < 8) {
    const err = new Error('New password must be at least 8 characters long');
    err.statusCode = 400;
    throw err;
  }

  if (newPassword !== confirmPassword) {
    const err = new Error('New passwords do not match');
    err.statusCode = 400;
    throw err;
  }

  if (currentPassword === newPassword) {
    const err = new Error('New password must be different from current password');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  await user.save();

  return { success: true, message: 'Password updated successfully' };
};

/**
 * Delete Account with password verification & complete data deletion
 */
const deleteAccount = async (userId, { password }) => {
  if (!password) {
    const err = new Error('Password confirmation is required to delete account');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const err = new Error('Password confirmation is incorrect');
    err.statusCode = 400;
    throw err;
  }

  // Delete all associated candidate documents safely
  await Promise.all([
    Application.deleteMany({ user: userId }),
    Match.deleteMany({ user: userId }),
    Notification.deleteMany({ user: userId }),
    User.findByIdAndDelete(userId)
  ]);

  return { success: true, message: 'Account deleted successfully' };
};

module.exports = {
  getSettings,
  updateAccount,
  updateJobPreferences,
  updateNotificationPreferences,
  updatePrivacyPreferences,
  changePassword,
  deleteAccount
};
