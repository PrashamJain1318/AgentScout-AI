const express = require('express');
const {
  getOverview,
  getHealth,
  getSkills,
  getBottlenecks,
  getMomentum,
  getForecast,
  getRisks,
  getInsights,
  getActions,
  runAnalysis
} = require('../controllers/careerIntelligence.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getOverview);
router.get('/health', protect, getHealth);
router.get('/skills', protect, getSkills);
router.get('/bottlenecks', protect, getBottlenecks);
router.get('/momentum', protect, getMomentum);
router.get('/forecast', protect, getForecast);
router.get('/risks', protect, getRisks);
router.get('/insights', protect, getInsights);
router.get('/actions', protect, getActions);
router.post('/analyze', protect, runAnalysis);

module.exports = router;
