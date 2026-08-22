const express = require('express');
const {
  getMonitor,
  updateMonitor,
  startMonitor,
  pauseMonitor,
  runMonitor,
  getStatus,
  getRecommendations,
  getNewOpportunities,
  getDigest,
  watchOpportunity,
  unwatchOpportunity,
  dismissOpportunity,
  markOpportunityViewed,
  explainOpportunity
} = require('../controllers/opportunityMonitor.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getMonitor);
router.put('/', protect, updateMonitor);

router.post('/start', protect, startMonitor);
router.post('/pause', protect, pauseMonitor);
router.post('/run', protect, runMonitor);

router.get('/status', protect, getStatus);
router.get('/recommendations', protect, getRecommendations);
router.get('/new', protect, getNewOpportunities);
router.get('/digest', protect, getDigest);

router.post('/:opportunityId/watch', protect, watchOpportunity);
router.delete('/:opportunityId/watch', protect, unwatchOpportunity);
router.post('/:opportunityId/dismiss', protect, dismissOpportunity);
router.post('/:opportunityId/view', protect, markOpportunityViewed);
router.get('/:opportunityId/explain', protect, explainOpportunity);

module.exports = router;
