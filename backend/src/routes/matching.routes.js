const express = require('express');

const {
  getUserMatches,
  getMatch,
  deleteMatch,
  generateUserMatches,
  createMatch,
  explainMatch,
  getMatchAnalytics
} = require('../controllers/matching.controller');

const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Static/action routes first
router.get('/', protect, getUserMatches);

router.get('/analytics', protect, getMatchAnalytics);

router.post('/generate', protect, generateUserMatches);

router.post('/', protect, createMatch);

// Specific parameterized action route BEFORE /:id
router.post('/:id/explain', protect, explainMatch);

// Generic /:id routes AFTER /:id/explain
router.get('/:id', protect, getMatch);

router.delete('/:id', protect, deleteMatch);

module.exports = router;
