const https = require('https');

/**
 * Helper to retrieve NVIDIA NIM API configuration from environment.
 */
const getNvidiaConfig = () => {
  const apiKey = process.env.NVIDIA_API_KEY;
  const baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const model = process.env.NVIDIA_MODEL;

  return {
    apiKey,
    baseUrl,
    model,
    isConfigured: Boolean(apiKey && apiKey.trim() && apiKey !== 'your_nvidia_api_key_here')
  };
};

/**
 * Perform HTTPS POST request to NVIDIA NIM OpenAI-compatible API endpoint.
 * @param {Object} payload - { messages, temperature, max_tokens, ... }
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Object>} Response object
 */
const makeNvidiaHttpRequest = (payload, timeoutMs = 25000) => {
  return new Promise((resolve, reject) => {
    const config = getNvidiaConfig();

    if (!config.isConfigured) {
      const err = new Error('NVIDIA_API_KEY is not configured.');
      err.statusCode = 503;
      return reject(err);
    }

    if (!config.model || !config.model.trim()) {
      const err = new Error('NVIDIA_MODEL is not configured.');
      err.statusCode = 400;
      return reject(err);
    }

    try {
      const url = new URL(`${config.baseUrl.replace(/\/+$/, '')}/chat/completions`);
      const postData = JSON.stringify({
        model: config.model,
        ...payload
      });

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const startTime = Date.now();

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const duration = Date.now() - startTime;
          try {
            const json = data ? JSON.parse(data) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[AI Provider: nvidia] [model: ${config.model}] HTTP ${res.statusCode} (${duration}ms)`);
            } else {
              console.error(`[AI Provider: nvidia] [model: ${config.model}] HTTP ${res.statusCode} Error (${duration}ms):`, json.error || json.message || data);
            }
            resolve({
              statusCode: res.statusCode,
              data: json,
              duration
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data,
              duration
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`NVIDIA Network Error: ${err.message}`));
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        reject(new Error(`NVIDIA Request Timeout after ${timeoutMs}ms`));
      });

      req.write(postData);
      req.end();
    } catch (err) {
      reject(new Error(`Invalid NVIDIA API Configuration: ${err.message}`));
    }
  });
};

/**
 * Health check test for NVIDIA NIM provider.
 * @param {string} message - Health check prompt
 */
const testConnection = async (message = "Say hello from AgentScout.") => {
  const config = getNvidiaConfig();
  if (!config.isConfigured) {
    const err = new Error('NVIDIA_API_KEY is not configured.');
    err.statusCode = 503;
    throw err;
  }
  if (!config.model) {
    const err = new Error('NVIDIA_MODEL is not configured.');
    err.statusCode = 400;
    throw err;
  }

  const payload = {
    messages: [
      { role: "system", content: "You are AgentScout AI, a professional career intelligence assistant." },
      { role: "user", content: message }
    ],
    temperature: 0.2,
    max_tokens: 150
  };

  const res = await makeNvidiaHttpRequest(payload, 25000);

  if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
    const text = res.data.choices?.[0]?.message?.content;
    if (text) {
      return {
        success: true,
        provider: "nvidia",
        model: config.model,
        response: text.trim()
      };
    }
  }

  const errMessage = res.data?.error?.message || res.data?.message || `NVIDIA HTTP ${res.statusCode}`;
  const error = new Error(`NVIDIA NIM test failed: ${errMessage}`);
  error.statusCode = res.statusCode || 500;
  throw error;
};

/**
 * Generate raw text response using NVIDIA NIM API.
 */
const generateText = async (prompt, options = {}) => {
  const config = getNvidiaConfig();
  if (!config.isConfigured) {
    const err = new Error('NVIDIA_API_KEY is not configured.');
    err.statusCode = 503;
    throw err;
  }

  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens ?? 1500;
  const timeoutMs = options.timeoutMs ?? 25000;

  const payload = {
    messages: [
      { role: "system", content: options.systemPrompt || "You are AgentScout AI, a high-precision career intelligence engine." },
      { role: "user", content: prompt }
    ],
    temperature,
    max_tokens: maxTokens
  };

  const res = await makeNvidiaHttpRequest(payload, timeoutMs);

  if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
    const text = res.data.choices?.[0]?.message?.content;
    if (text) return text.trim();
  }

  const errMessage = res.data?.error?.message || res.data?.message || `NVIDIA HTTP ${res.statusCode}`;
  const error = new Error(`NVIDIA NIM inference error: ${errMessage}`);
  error.statusCode = res.statusCode || 500;
  throw error;
};

/**
 * Generate structured JSON object using NVIDIA NIM API.
 */
const generateJSON = async (prompt, options = {}) => {
  const systemPrompt = (options.systemPrompt || "You are AgentScout AI.") +
    "\nIMPORTANT: Output strictly raw valid JSON. Do not wrap output in markdown formatting or conversational text.";

  const rawText = await generateText(prompt, { ...options, systemPrompt });

  let cleanText = rawText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    const match = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        // Fall through
      }
    }
    const parseErr = new Error(`Failed to parse structured JSON from NVIDIA NIM output: ${e.message}`);
    parseErr.statusCode = 422;
    throw parseErr;
  }
};

module.exports = {
  getNvidiaConfig,
  testConnection,
  generateText,
  generateJSON
};
