import api from "./api";

/**
 * Get all candidate settings and preferences.
 * @returns {Promise<Object>} API response payload { success: true, settings: {...} }
 */
export const getSettings = async () => {
  const response = await api.get("/settings", { withCredentials: true });
  return response.data;
};

/**
 * Update Account information (firstName, lastName).
 * @param {Object} data - { firstName, lastName }
 * @returns {Promise<Object>} API response payload
 */
export const updateAccount = async (data) => {
  const response = await api.put("/settings/account", data, { withCredentials: true });
  return response.data;
};

/**
 * Update Job Preferences.
 * @param {Object} data - { desiredRoles, preferredLocations, jobTypes, workModes, minimumSalary, experienceLevel, remotePreference }
 * @returns {Promise<Object>} API response payload
 */
export const updateJobPreferences = async (data) => {
  const response = await api.put("/settings/preferences", data, { withCredentials: true });
  return response.data;
};

/**
 * Update Notification Preferences.
 * @param {Object} data - { newMatches, excellentMatches, applicationUpdates, interviewAlerts, offerAlerts, careerCopilot, emailNotifications }
 * @returns {Promise<Object>} API response payload
 */
export const updateNotificationPreferences = async (data) => {
  const response = await api.put("/settings/notifications", data, { withCredentials: true });
  return response.data;
};

/**
 * Update Privacy Preferences.
 * @param {Object} data - { profileVisibility, recruiterDiscovery, aiPersonalization }
 * @returns {Promise<Object>} API response payload
 */
export const updatePrivacyPreferences = async (data) => {
  const response = await api.put("/settings/privacy", data, { withCredentials: true });
  return response.data;
};

/**
 * Change Password with current password verification.
 * @param {Object} data - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise<Object>} API response payload
 */
export const changePassword = async (data) => {
  const response = await api.put("/settings/password", data, { withCredentials: true });
  return response.data;
};

/**
 * Log out of all active sessions.
 * @returns {Promise<Object>} API response payload
 */
export const logoutAllSessions = async () => {
  const response = await api.post("/settings/logout-all", {}, { withCredentials: true });
  return response.data;
};

/**
 * Permanently delete authenticated candidate account.
 * @param {Object} data - { password }
 * @returns {Promise<Object>} API response payload
 */
export const deleteAccount = async (data) => {
  const response = await api.delete("/settings/account", { data, withCredentials: true });
  return response.data;
};
