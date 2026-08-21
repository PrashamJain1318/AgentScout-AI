const express = require('express');
const {
  getOpportunities,
  getOpportunityById
} = require('../controllers/opportunity.controller');

const router = express.Router();

// Public Opportunity browsing endpoints
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

module.exports = router;
