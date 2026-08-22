/**
 * Bright Data Scraper Studio Collector (DCA API) configuration helper.
 * Manages DCA configuration and environment validation safely without exposing credentials.
 */
const getBrightDataConfig = () => {
  const apiKey = process.env.BRIGHT_DATA_API_KEY || '';
  const collectorId = process.env.BRIGHT_DATA_COLLECTOR_ID || '';
  const baseUrl = process.env.BRIGHT_DATA_BASE_URL || 'https://api.brightdata.com';

  const isConfigured = Boolean(
    apiKey &&
    apiKey.trim() !== '' &&
    apiKey !== 'your_bright_data_api_key_here' &&
    collectorId &&
    collectorId.trim() !== ''
  );

  return {
    apiKey,
    collectorId,
    baseUrl,
    isConfigured
  };
};

module.exports = {
  getBrightDataConfig
};
