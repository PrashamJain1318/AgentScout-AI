const express = require('express');
const {
  getPersonalization,
  getAdaptiveDashboard,
  getMomentumScore,
  refreshPersonalization,
  updatePreferences
} = require('../controllers/personalization.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getPersonalization);
router.get('/dashboard', protect, getAdaptiveDashboard);
router.get('/momentum', protect, getMomentumScore);
router.post('/refresh', protect, refreshPersonalization);
router.patch('/preferences', protect, updatePreferences);

module.exports = router;
