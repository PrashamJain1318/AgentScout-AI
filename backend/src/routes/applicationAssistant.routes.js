const express = require('express');
const {
  analyzeOpportunityReadiness,
  getAssistantByOpportunity,
  generateCoverLetter,
  generateApplicationAnswers,
  generateApplicationStrategy,
  updateChecklist,
  deleteAssistant,
  getAssetHistory
} = require('../controllers/applicationAssistant.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/history', protect, getAssetHistory);
router.post('/analyze/:opportunityId', protect, analyzeOpportunityReadiness);
router.get('/:opportunityId', protect, getAssistantByOpportunity);
router.post('/:opportunityId/cover-letter', protect, generateCoverLetter);
router.post('/:opportunityId/answers', protect, generateApplicationAnswers);
router.post('/:opportunityId/strategy', protect, generateApplicationStrategy);
router.patch('/:opportunityId/checklist', protect, updateChecklist);
router.delete('/:opportunityId', protect, deleteAssistant);

module.exports = router;
