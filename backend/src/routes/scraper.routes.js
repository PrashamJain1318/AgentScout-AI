const express = require('express');
const { getScraperStatus, runScraper } = require('../controllers/scraper.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protected Scraper endpoints
router.get('/status', protect, getScraperStatus);
router.post('/run', protect, runScraper);

module.exports = router;
