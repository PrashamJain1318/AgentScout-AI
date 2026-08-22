const express = require('express');
const {
  getOpportunities,
  getOpportunityById,
  searchOpportunities,
  searchPersonalizedOpportunities,
  aiSearchOpportunities,
  getRecommendedOpportunities
} = require('../controllers/opportunity.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Specific static/action routes MUST come before /:id parameter route
router.get('/search', searchOpportunities);
router.get('/search/personalized', protect, searchPersonalizedOpportunities);
router.get('/recommended', protect, getRecommendedOpportunities);
router.post('/ai-search', protect, aiSearchOpportunities);

// Standard opportunity endpoints
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

module.exports = router;
