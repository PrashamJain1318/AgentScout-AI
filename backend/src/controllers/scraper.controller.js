const { validateBrightDataConfig, runBrightDataScraper } = require('../services/brightData.service');

/**
 * Check execution readiness and status of Bright Data Scraper configuration.
 * @route GET /api/scraper/status
 * @access Private (Authenticated User)
 */
const getScraperStatus = async (req, res, next) => {
  try {
    const isConfigured = validateBrightDataConfig();

    if (isConfigured) {
      return res.status(200).json({
        success: true,
        configured: true,
        message: 'Bright Data configuration is available'
      });
    }

    return res.status(200).json({
      success: true,
      configured: false,
      message: 'Bright Data configuration is missing'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger Bright Data Scraper execution and ingest opportunity records.
 * @route POST /api/scraper/run
 * @access Private (Authenticated User)
 */
const runScraper = async (req, res, next) => {
  try {
    const isConfigured = validateBrightDataConfig();

    if (!isConfigured) {
      return res.status(400).json({
        success: false,
        configured: false,
        message: 'Bright Data configuration is missing. Please set BRIGHT_DATA_API_KEY in backend/.env.'
      });
    }

    const { query, location, limit } = req.body || {};

    const result = await runBrightDataScraper({
      query: query ? String(query).trim() : 'AI internship',
      location: location ? String(location).trim() : '',
      limit: limit ? parseInt(limit, 10) : 10
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getScraperStatus,
  runScraper
};
