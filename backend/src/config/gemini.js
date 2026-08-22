/**
 * Google Gemini AI configuration helper.
 * Safely evaluates Gemini execution readiness without exposing credentials.
 */
const getGeminiConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const isConfigured = Boolean(
    apiKey &&
    apiKey.trim() !== '' &&
    apiKey !== 'your_gemini_api_key_here'
  );

  return {
    isConfigured,
    model: 'gemini-2.5-flash'
  };
};

const isGeminiConfigured = () => {
  return getGeminiConfig().isConfigured;
};

module.exports = {
  getGeminiConfig,
  isGeminiConfigured
};
