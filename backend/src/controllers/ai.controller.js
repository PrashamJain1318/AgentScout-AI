const aiProvider = require('../services/ai/aiProvider');

/**
 * POST /api/ai/test
 * Health check test endpoint for configured AI provider (NVIDIA NIM or Gemini).
 */
const testAIProvider = async (req, res, next) => {
  try {
    const { message } = req.body || {};
    const result = await aiProvider.testConnection(message || 'Say hello from AgentScout.');

    return res.status(200).json({
      success: true,
      provider: result.provider,
      model: result.model,
      response: result.response
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      provider: aiProvider.getActiveProviderName(),
      error: error.message || 'AI service temporarily unavailable'
    });
  }
};

/**
 * GET /api/ai/status
 * Get current AI provider configuration status.
 */
const getAIStatus = async (req, res, next) => {
  try {
    const info = aiProvider.getProviderInfo();
    return res.status(200).json({
      success: true,
      ...info
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  testAIProvider,
  getAIStatus
};
