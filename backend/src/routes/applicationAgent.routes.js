const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');
const applicationAgentController = require('../controllers/applicationAgent.controller');

// Protect all routes with authentication middleware
router.use(protect);

// State & Analysis Endpoints
router.get('/', applicationAgentController.getAgentState);
router.post('/analyze/:opportunityId?', apiLimiter, applicationAgentController.analyzeOpportunity);
router.get('/context/:opportunityId?', applicationAgentController.getContext);
router.get('/next-action/:opportunityId?', applicationAgentController.getNextAction);
router.post('/run/:opportunityId?', apiLimiter, applicationAgentController.runAgent);

// Agent Control Endpoints
router.post('/enable', applicationAgentController.enableAgent);
router.post('/disable', applicationAgentController.disableAgent);

// Task & Memory Endpoints
router.get('/tasks', applicationAgentController.getTasks);
router.get('/memory', applicationAgentController.getMemory);
router.delete('/memory/:memoryId', applicationAgentController.deleteMemory);
router.get('/drafts', applicationAgentController.getDrafts);

module.exports = router;
