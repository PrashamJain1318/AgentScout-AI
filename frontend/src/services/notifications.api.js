import api from "./api";

/**
 * Fetch paginated notifications for authenticated candidate.
 * @param {Object} params - { page, limit, read, type }
 * @returns {Promise<Object>} API response payload { data, count, pagination }
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get("/notifications", { params, withCredentials: true });
  return response.data;
};

/**
 * Fetch count of unread notifications for authenticated candidate.
 * @returns {Promise<Object>} API response payload { count }
 */
export const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count", { withCredentials: true });
  return response.data;
};

/**
 * Mark a single notification as read by ID.
 * @param {string} id - Notification ObjectId
 * @returns {Promise<Object>} API response payload { data }
 */
export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Mark all notifications as read for current user.
 * @returns {Promise<Object>} API response payload { modifiedCount }
 */
export const markAllNotificationsRead = async () => {
  const response = await api.patch("/notifications/read-all", {}, { withCredentials: true });
  return response.data;
};

/**
 * Delete a single notification by ID.
 * @param {string} id - Notification ObjectId
 * @returns {Promise<Object>} API response payload
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`, { withCredentials: true });
  return response.data;
};

/**
 * Clear all notifications for current user.
 * @returns {Promise<Object>} API response payload { deletedCount }
 */
export const clearAllNotifications = async () => {
  const response = await api.delete("/notifications", { withCredentials: true });
  return response.data;
};
