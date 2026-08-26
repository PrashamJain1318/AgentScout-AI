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
  getStatistics,
  getTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
  getNotifications,
  getExecutions,
  getPendingActions,
  evaluateAgent,
  runScheduler,
  getAutomationStatus,
  updateMode,
  createWorkflowHandler,
  getWorkflowsHandler,
  getWorkflowByIdHandler,
  startWorkflowHandler,
  pauseWorkflowHandler,
  cancelWorkflowHandler,
  approveWorkflowHandler,
  rejectWorkflowHandler,
  getWorkflowPackageHandler,
  getApprovalCenterHandler,
  getActionPreviewHandler,
  editActionPackageContentHandler,
  approveActionPackageHandler,
  recordOutcomeHandler,
  getOutcomesHandler
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

// ==========================================
// PHASE 17.1 AUTOMATION & TRIGGER ROUTES
// ==========================================

// Triggers
router.get('/triggers', getTriggers);
router.post('/triggers', createTrigger);
router.patch('/triggers/:triggerId', updateTrigger);
router.delete('/triggers/:triggerId', deleteTrigger);

// Notifications & Executions & Pending
router.get('/notifications', getNotifications);
router.get('/executions', getExecutions);
router.get('/pending-actions', getPendingActions);

// Evaluation & Scheduler & Status & Mode
router.post('/evaluate', apiLimiter, evaluateAgent);
router.post('/scheduler/run', apiLimiter, runScheduler);
router.get('/automation-status', getAutomationStatus);
router.patch('/mode', updateMode);

// ==========================================
// PHASE 17.2 WORKFLOW & APPROVAL CENTER ROUTES
// ==========================================

// Workflows
router.post('/workflows', apiLimiter, createWorkflowHandler);
router.get('/workflows', getWorkflowsHandler);
router.get('/workflows/:workflowId', getWorkflowByIdHandler);
router.post('/workflows/:workflowId/start', startWorkflowHandler);
router.post('/workflows/:workflowId/pause', pauseWorkflowHandler);
router.post('/workflows/:workflowId/cancel', cancelWorkflowHandler);
router.post('/workflows/:workflowId/approve', approveWorkflowHandler);
router.post('/workflows/:workflowId/reject', rejectWorkflowHandler);
router.get('/workflows/:workflowId/package', getWorkflowPackageHandler);

// Approval Center & Action Previews
router.get('/approval-center', getApprovalCenterHandler);
router.get('/actions/:actionId/preview', getActionPreviewHandler);
router.post('/actions/:actionId/edit', editActionPackageContentHandler);
router.post('/actions/:actionId/approve-package', approveActionPackageHandler);

// Outcomes
router.post('/outcomes', recordOutcomeHandler);
router.get('/outcomes', getOutcomesHandler);

module.exports = router;
