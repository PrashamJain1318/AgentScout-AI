const express = require('express');
const {
  getTodayPlan,
  getWeeklyPlan,
  getPlannerOverview,
  generatePlan,
  updateAction,
  completeAction,
  skipAction,
  getMilestones,
  refreshPlan
} = require('../controllers/careerPlanner.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/today', protect, getTodayPlan);
router.get('/week', protect, getWeeklyPlan);
router.get('/overview', protect, getPlannerOverview);
router.get('/milestones', protect, getMilestones);

router.post('/generate', protect, generatePlan);
router.post('/refresh', protect, refreshPlan);

router.patch('/actions/:actionId', protect, updateAction);
router.post('/actions/:actionId/complete', protect, completeAction);
router.post('/actions/:actionId/skip', protect, skipAction);

module.exports = router;
