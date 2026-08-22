const express = require('express');
const {
  getSettings,
  updateAccount,
  updatePreferences,
  updateNotifications,
  updatePrivacy,
  changePassword,
  logoutAllSessions,
  deleteAccount
} = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/account', protect, updateAccount);
router.put('/preferences', protect, updatePreferences);
router.put('/notifications', protect, updateNotifications);
router.put('/privacy', protect, updatePrivacy);
router.put('/password', protect, changePassword);
router.post('/logout-all', protect, logoutAllSessions);
router.delete('/account', protect, deleteAccount);

module.exports = router;
