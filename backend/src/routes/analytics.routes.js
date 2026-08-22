const express = require('express');
const {
  getOverview,
  getApplicationAnalytics,
  getMatchAnalytics,
  getSkillAnalytics,
  getActivityAnalytics,
  getCareerInsights
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/applications', protect, getApplicationAnalytics);
router.get('/matches', protect, getMatchAnalytics);
router.get('/skills', protect, getSkillAnalytics);
router.get('/activity', protect, getActivityAnalytics);
router.get('/insights', protect, getCareerInsights);

// Backward compatible aliases
router.get('/dashboard', protect, getOverview);
router.get('/', protect, getOverview);

module.exports = router;
