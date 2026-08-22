const mongoose = require('mongoose');
const Notification = require('../models/Notification.model');

/**
 * Helper to safely validate Mongoose ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Create a new notification for a specific user.
 * Performs optional duplicate prevention checks.
 * @param {Object} payload - { user, type, title, message, link, metadata }
 */
const createNotification = async (payload = {}) => {
  if (!payload.user || !isValidObjectId(payload.user)) {
    return null;
  }

  // Prevent duplicate notification if identical type & link created in last 10 minutes
  if (payload.link) {
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existing = await Notification.findOne({
      user: payload.user,
      type: payload.type,
      link: payload.link,
      createdAt: { $gte: tenMinsAgo }
    });
    if (existing) {
      return existing;
    }
  }

  const notification = new Notification({
    user: payload.user,
    type: payload.type || 'system',
    title: String(payload.title || '').trim(),
    message: String(payload.message || '').trim(),
    link: payload.link ? String(payload.link).trim() : '',
    metadata: payload.metadata || {}
  });

  return await notification.save();
};

/**
 * Get paginated notifications for an authenticated user.
 * @param {string} userId
 * @param {Object} options - { page, limit, read, type }
 */
const getUserNotifications = async (userId, options = {}) => {
  if (!isValidObjectId(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Math.min(parseInt(options.limit, 10) || 20, 100));
  const skip = (page - 1) * limit;

  const query = { user: userId };
  if (options.read !== undefined && options.read !== null && options.read !== '') {
    query.read = options.read === 'true' || options.read === true;
  }
  if (options.type) {
    query.type = options.type;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query)
  ]);

  const pages = Math.ceil(total / limit) || 0;

  return {
    notifications,
    count: notifications.length,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
};

/**
 * Get count of unread notifications for a user.
 * @param {string} userId
 */
const getUnreadCount = async (userId) => {
  if (!isValidObjectId(userId)) {
    return 0;
  }
  return await Notification.countDocuments({ user: userId, read: false });
};

/**
 * Mark a single notification as read (strictly scoped to user).
 * @param {string} notificationId
 * @param {string} userId
 */
const markAsRead = async (notificationId, userId) => {
  if (!isValidObjectId(notificationId) || !isValidObjectId(userId)) {
    return null;
  }

  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } },
    { new: true }
  );
};

/**
 * Mark all notifications for a user as read.
 * @param {string} userId
 */
const markAllAsRead = async (userId) => {
  if (!isValidObjectId(userId)) {
    return { modifiedCount: 0 };
  }

  const result = await Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );

  return { modifiedCount: result.modifiedCount };
};

/**
 * Delete a single notification (strictly scoped to user).
 * @param {string} notificationId
 * @param {string} userId
 */
const deleteNotification = async (notificationId, userId) => {
  if (!isValidObjectId(notificationId) || !isValidObjectId(userId)) {
    return false;
  }

  const result = await Notification.deleteOne({ _id: notificationId, user: userId });
  return result.deletedCount > 0;
};

/**
 * Delete all notifications for a user.
 * @param {string} userId
 */
const clearAllNotifications = async (userId) => {
  if (!isValidObjectId(userId)) {
    return { deletedCount: 0 };
  }

  const result = await Notification.deleteMany({ user: userId });
  return { deletedCount: result.deletedCount };
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
