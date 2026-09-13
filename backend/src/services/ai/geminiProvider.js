const geminiService = require('../gemini.service');
const { getGeminiConfig, isGeminiConfigured } = require('../../config/gemini');

const testConnection = async (message = "Say hello from AgentScout.") => {
  if (!isGeminiConfigured()) {
    const err = new Error('GEMINI_API_KEY is not configured.');
    err.statusCode = 503;
    throw err;
  }

  const prompt = `Say hello from AgentScout AI and confirm system connectivity. Message: ${message}`;
  const apiKey = process.env.GEMINI_API_KEY;
  const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } };

  const res = await geminiService.makeGeminiHttpRequest(apiKey, payload, 10000);
  if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return {
        success: true,
        provider: "gemini",
        model: "gemini-2.5-flash",
        response: text.trim()
      };
    }
  }

  throw new Error(`Gemini test failed with status ${res.statusCode}`);
};

const generateText = async (prompt, options = {}) => {
  if (!isGeminiConfigured()) {
    const err = new Error('GEMINI_API_KEY is not configured.');
    err.statusCode = 503;
    throw err;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const payload = {
    contents: [{ parts: [{ text: `${options.systemPrompt ? options.systemPrompt + '\n\n' : ''}${prompt}` }] }],
    generationConfig: { temperature: options.temperature ?? 0.3 }
  };

  const res = await geminiService.makeGeminiHttpRequest(apiKey, payload, options.timeoutMs || 20000);
  if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text.trim();
  }

  throw new Error(`Gemini generateText error: ${JSON.stringify(res.data)}`);
};

const generateJSON = async (prompt, options = {}) => {
  return geminiService.generateJSON(prompt, options);
};

module.exports = {
  testConnection,
  generateText,
  generateJSON
};
