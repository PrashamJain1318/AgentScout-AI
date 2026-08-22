const express = require('express');

const {
  getCareerCopilotPlan
} = require('../controllers/careerCopilot.controller');

const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/career-copilot
 * Generate personalized AI career plan.
 */
router.get('/', protect, getCareerCopilotPlan);

module.exports = router;
