const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');
const {
  getOverview,
  getHealth,
  getFeed,
  getEvents,
  markRead,
  markArchive,
  refreshIntelligence
} = require('../controllers/careerIntelligence.controller');

const router = express.Router();

// Enforce authentication on all Career Intelligence routes
router.use(protect);

// Primary Phase 20.0 Endpoints
router.get('/overview', getOverview);
router.get('/', getOverview);
router.get('/health', getHealth);
router.get('/feed', getFeed);
router.get('/events', getEvents);
router.patch('/events/:eventId/read', markRead);
router.patch('/events/:eventId/archive', markArchive);

// Rate-limited manual refresh endpoint
router.post('/refresh', apiLimiter, refreshIntelligence);

module.exports = router;
