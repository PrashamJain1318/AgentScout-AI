const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const applicationAgentController = require('../controllers/applicationAgent.controller');

// All routes are strictly protected by authentication middleware
router.use(protect);

router.get('/', applicationAgentController.getAgentState);
router.post('/analyze', applicationAgentController.analyzeOpportunity);
router.get('/context/:opportunityId?', applicationAgentController.getContext);
router.get('/next-action', applicationAgentController.getNextAction);
router.post('/run', applicationAgentController.runAgent);
router.post('/enable', applicationAgentController.enableAgent);
router.post('/disable', applicationAgentController.disableAgent);
router.get('/tasks', applicationAgentController.getTasks);
router.get('/memory', applicationAgentController.getMemory);
router.delete('/memory/:memoryId', applicationAgentController.deleteMemory);
router.get('/drafts', applicationAgentController.getDrafts);

module.exports = router;
