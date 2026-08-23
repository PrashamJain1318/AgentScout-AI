const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');
const {
  getAgentState,
  getContext,
  getNextAction,
  runAgent,
  refreshAgent,
  getActivity,
  getMemory,
  deleteMemory,
  approveAction,
  rejectAction,
  executeActionHandler,
  enableAgent,
  disableAgent,
  getStatistics
} = require('../controllers/careerAgent.controller');

const router = express.Router();

// Apply protect middleware to ALL agent routes
router.use(protect);

// GET /api/career-agent — Get agent state
router.get('/', getAgentState);

// GET /api/career-agent/context — Get normalized career context
router.get('/context', getContext);

// GET /api/career-agent/next-action — Get next best action
router.get('/next-action', getNextAction);

// POST /api/career-agent/run — Run reasoning cycle (rate limited)
router.post('/run', apiLimiter, runAgent);

// POST /api/career-agent/refresh — Refresh context and decision
router.post('/refresh', apiLimiter, refreshAgent);

// GET /api/career-agent/activity — Activity audit log
router.get('/activity', getActivity);

// GET /api/career-agent/memory — Candidate agent memory
router.get('/memory', getMemory);

// DELETE /api/career-agent/memory/:memoryId — Delete specific memory
router.delete('/memory/:memoryId', deleteMemory);

// POST /api/career-agent/actions/:actionId/approve — Approve pending action
router.post('/actions/:actionId/approve', approveAction);

// POST /api/career-agent/actions/:actionId/reject — Reject pending action
router.post('/actions/:actionId/reject', rejectAction);

// POST /api/career-agent/actions/:actionId/execute — Execute approved action
router.post('/actions/:actionId/execute', executeActionHandler);

// POST /api/career-agent/enable — Enable agent
router.post('/enable', enableAgent);

// POST /api/career-agent/disable — Disable agent
router.post('/disable', disableAgent);

// GET /api/career-agent/statistics — Agent performance statistics
router.get('/statistics', getStatistics);

module.exports = router;
