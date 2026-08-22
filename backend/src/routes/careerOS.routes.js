const express = require('express');
const {
  getSnapshot,
  getScore,
  getReadiness,
  getNextAction,
  getRisks,
  getMomentum,
  getChanges,
  getOpportunities,
  getBriefing,
  getMilestones,
  refresh
} = require('../controllers/careerOS.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getSnapshot);
router.get('/score', protect, getScore);
router.get('/readiness', protect, getReadiness);
router.get('/next-action', protect, getNextAction);
router.get('/risks', protect, getRisks);
router.get('/momentum', protect, getMomentum);
router.get('/changes', protect, getChanges);
router.get('/opportunities', protect, getOpportunities);
router.get('/briefing', protect, getBriefing);
router.get('/milestones', protect, getMilestones);
router.post('/refresh', protect, refresh);

module.exports = router;
