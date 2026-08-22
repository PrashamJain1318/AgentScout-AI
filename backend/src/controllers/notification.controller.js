const notificationService = require('../services/notification.service');

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
 * Get paginated notifications for current authenticated user.
 * @route GET /api/notifications
 * @access Private
 */
const getNotifications = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);
    const userId = req.user.id || req.user._id;

    const result = await notificationService.getUserNotifications(userId, req.query);

    res.status(200).json({
      success: true,
      data: result.notifications,
      notifications: result.notifications,
      count: result.count,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count for current authenticated user.
 * @route GET /api/notifications/unread-count
 * @access Private
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read.
 * @route PATCH /api/notifications/:id/read
 * @access Private
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const updated = await notificationService.markAsRead(id, userId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updated,
      notification: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read for current authenticated user.
 * @route PATCH /api/notifications/read-all
 * @access Private
 */
const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a single notification.
 * @route DELETE /api/notifications/:id
 * @access Private
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const isDeleted = await notificationService.deleteNotification(id, userId);

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all notifications for current authenticated user.
 * @route DELETE /api/notifications
 * @access Private
 */
const clearAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const result = await notificationService.clearAllNotifications(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications
};
