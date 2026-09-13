const express = require('express');
const { testAIProvider, getAIStatus } = require('../controllers/ai.controller');

const router = express.Router();

// POST /api/ai/test - Public health test for AI provider
router.post('/test', testAIProvider);

// GET /api/ai/status - Public status info for AI provider
router.get('/status', getAIStatus);

module.exports = router;
