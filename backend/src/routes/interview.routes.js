const express = require('express');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewReadiness,
  getInterviewSession,
  deleteInterviewSession
} = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/history', protect, getInterviewHistory);
router.get('/readiness', protect, getInterviewReadiness);
router.get('/readiness/:opportunityId', protect, getInterviewReadiness);

router.post('/start', protect, startInterview);
router.post('/:sessionId/answer', protect, submitAnswer);
router.post('/:sessionId/complete', protect, completeInterview);

router.get('/:sessionId', protect, getInterviewSession);
router.delete('/:sessionId', protect, deleteInterviewSession);

module.exports = router;
