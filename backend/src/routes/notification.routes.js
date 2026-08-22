const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/notifications - List paginated user notifications
router.get('/', protect, getNotifications);

// GET /api/notifications/unread-count - Get count of unread notifications
router.get('/unread-count', protect, getUnreadCount);

// PATCH /api/notifications/read-all - Mark all user notifications as read
router.patch('/read-all', protect, markAllNotificationsRead);

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', protect, markNotificationRead);

// DELETE /api/notifications - Clear all user notifications
router.delete('/', protect, clearAllNotifications);

// DELETE /api/notifications/:id - Delete single notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;
