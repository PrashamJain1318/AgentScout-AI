const nvidiaProvider = require('./nvidiaProvider');
const geminiProvider = require('./geminiProvider');

/**
 * Get active AI Provider name ('nvidia' | 'gemini').
 */
const getActiveProviderName = () => {
  const provider = (process.env.AI_PROVIDER || 'nvidia').toLowerCase().trim();
  return provider === 'gemini' ? 'gemini' : 'nvidia';
};

/**
 * Get active AI Provider implementation.
 */
const getActiveProvider = () => {
  const providerName = getActiveProviderName();
  return providerName === 'gemini' ? geminiProvider : nvidiaProvider;
};

/**
 * Get active AI Provider status & model info.
 */
const getProviderInfo = () => {
  const providerName = getActiveProviderName();
  if (providerName === 'nvidia') {
    const config = nvidiaProvider.getNvidiaConfig();
    return {
      provider: 'nvidia',
      model: config.model || null,
      configured: config.isConfigured
    };
  } else {
    return {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      configured: Boolean(process.env.GEMINI_API_KEY)
    };
  }
};

/**
 * Health check test connection across configured AI provider.
 */
const testConnection = async (message) => {
  const provider = getActiveProvider();
  return provider.testConnection(message);
};

/**
 * Generate raw text using active AI provider.
 */
const generateText = async (prompt, options) => {
  const provider = getActiveProvider();
  return provider.generateText(prompt, options);
};

/**
 * Generate structured JSON using active AI provider.
 */
const generateJSON = async (prompt, options) => {
  const provider = getActiveProvider();
  return provider.generateJSON(prompt, options);
};

module.exports = {
  getActiveProviderName,
  getActiveProvider,
  getProviderInfo,
  testConnection,
  generateText,
  generateJSON
};
