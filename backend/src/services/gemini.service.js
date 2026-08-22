const https = require('https');
const { getGeminiConfig, isGeminiConfigured } = require('../config/gemini');

/**
 * Perform HTTPS POST request to Google Gemini API with timeout protection.
 * @param {string} apiKey - Gemini API key
 * @param {Object} payload - Gemini request body
 * @param {number} timeoutMs - Timeout limit in milliseconds
 * @returns {Promise<Object>} API Response
 */
const makeGeminiHttpRequest = (apiKey, payload, timeoutMs = 15000) => {
  return new Promise((resolve, reject) => {
    try {
      const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const parsedUrl = new URL(endpointUrl);
      const postData = JSON.stringify(payload);

      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : {};
            resolve({
              statusCode: res.statusCode,
              data: json
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Gemini Network Error: ${err.message}`));
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        reject(new Error(`Gemini Request Timeout after ${timeoutMs}ms`));
      });

      req.write(postData);
      req.end();
    } catch (err) {
      reject(new Error(`Invalid Gemini Configuration: ${err.message}`));
    }
  });
};

/**
 * Generic helper to generate structured JSON using Google Gemini API.
 * @param {string} prompt - Prompt instructing Gemini to return JSON
 * @param {Object} options - { temperature, maxOutputTokens, timeoutMs }
 * @returns {Promise<Object>} Parsed JSON object
 */
const generateJSON = async (prompt, options = {}) => {
  if (!isGeminiConfigured()) {
    const err = new Error('Gemini AI is not configured');
    err.statusCode = 503;
    throw err;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const temperature = options.temperature ?? 0.3;
  const timeoutMs = options.timeoutMs ?? 20000;

  const geminiPayload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature,
      responseMimeType: 'application/json'
    }
  };

  const response = await makeGeminiHttpRequest(apiKey, geminiPayload, timeoutMs);

  if (response.statusCode >= 200 && response.statusCode < 300 && response.data) {
    const candidates = response.data.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const textContent = candidates[0].content?.parts[0]?.text;
      if (textContent) {
        let cleanText = textContent.trim();
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        }
        return JSON.parse(cleanText);
      }
    }
  }

  throw new Error(`Gemini API error (HTTP ${response.statusCode}): ${JSON.stringify(response.data)}`);
};

/**
 * Parse and validate Gemini JSON output for match explanations.
 * @param {string} rawText
 * @returns {Object} Structured explanation object
 */
const parseAndValidateGeminiJson = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Gemini returned an empty response');
  }

  // Clean markdown block wrappers if present (e.g. ```json ... ```)
  let cleanText = rawText.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  const parsed = JSON.parse(cleanText);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Gemini output is not a valid JSON object');
  }

  return {
    summary: parsed.summary ? String(parsed.summary).trim() : '',
    whyYouMatch: Array.isArray(parsed.whyYouMatch) ? parsed.whyYouMatch.map(s => String(s).trim()).filter(Boolean) : [],
    skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps.map(s => String(s).trim()).filter(Boolean) : [],
    recommendation: parsed.recommendation ? String(parsed.recommendation).trim() : '',
    interviewTips: Array.isArray(parsed.interviewTips) ? parsed.interviewTips.map(s => String(s).trim()).filter(Boolean) : []
  };
};

/**
 * Fallback AI explanation generator when API key is a placeholder or external API is unresponsive.
 * @param {Object} input
 * @returns {Object}
 */
const generateLocalExplanationFallback = (input = {}) => {
  const { candidate = {}, opportunity = {}, match = {} } = input;
  const matched = Array.isArray(match.matchedSkills) ? match.matchedSkills : [];
  const missing = Array.isArray(match.missingSkills) ? match.missingSkills : [];
  const score = match.score || 0;

  return {
    summary: `Candidate aligns with the ${opportunity.title || 'role'} position at ${opportunity.company || 'the company'} with a match score of ${score}/100.`,
    whyYouMatch: [
      `Demonstrated alignment in core technical skills: ${matched.length > 0 ? matched.join(', ') : 'general profile experience'}.`,
      `Role location (${opportunity.location || 'Remote'}) fits candidate preference.`
    ],
    skillGaps: missing.length > 0 ? missing.map(s => `Acquire proficiency in ${s}.`) : ['No major technical skill gaps identified.'],
    recommendation: score >= 75
      ? `Strong candidate profile. Prepare for technical interview focused on ${matched[0] || 'core skills'}.`
      : 'Review skill gap recommendations and highlight relevant project experience.',
    interviewTips: [
      `Highlight practical projects utilizing ${matched.slice(0, 2).join(' and ') || 'your core technical stack'}.`,
      `Be prepared to discuss your problem-solving process and career goals.`
    ]
  };
};

/**
 * Call Gemini API to generate structured match explanation.
 * @param {Object} input - { candidate, opportunity, match }
 * @returns {Promise<Object>} Structured match explanation
 */
const generateMatchExplanation = async (input = {}) => {
  if (!isGeminiConfigured()) {
    const err = new Error('Gemini AI is not configured');
    err.statusCode = 503;
    throw err;
  }

  const { candidate = {}, opportunity = {}, match = {} } = input;
  const apiKey = process.env.GEMINI_API_KEY;

  // Safe AI input object (excluding credentials, passwords, JWTs, secrets)
  const aiInput = {
    candidate: {
      name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
      skills: candidate.profile?.skills || [],
      location: candidate.profile?.location || '',
      headline: candidate.profile?.headline || '',
      bio: candidate.profile?.bio || ''
    },
    opportunity: {
      title: opportunity.title || '',
      company: opportunity.company || '',
      location: opportunity.location || '',
      type: opportunity.type || 'job',
      remote: Boolean(opportunity.remote),
      requirements: opportunity.requirements || [],
      description: opportunity.description || ''
    },
    match: {
      score: match.score || 0,
      matchLevel: match.matchLevel || 'fair',
      matchedSkills: match.matchedSkills || [],
      missingSkills: match.missingSkills || [],
      reasons: match.reasons || []
    }
  };

  const promptText = `
You are an expert AI Career Advisor & Technical Recruiter for AgentScout AI.
Analyze the following candidate profile, opportunity details, and deterministic match metrics:

CANDIDATE:
- Skills: ${JSON.stringify(aiInput.candidate.skills)}
- Location: "${aiInput.candidate.location}"
- Headline: "${aiInput.candidate.headline}"

OPPORTUNITY:
- Title: "${aiInput.opportunity.title}"
- Company: "${aiInput.opportunity.company}"
- Location: "${aiInput.opportunity.location}" (Remote: ${aiInput.opportunity.remote})
- Requirements: ${JSON.stringify(aiInput.opportunity.requirements)}

MATCH METRICS:
- Score: ${aiInput.match.score}/100 (${aiInput.match.matchLevel})
- Matched Skills: ${JSON.stringify(aiInput.match.matchedSkills)}
- Missing Skills: ${JSON.stringify(aiInput.match.missingSkills)}
- Deterministic Reasons: ${JSON.stringify(aiInput.match.reasons)}

INSTRUCTIONS:
1. Analyze only the supplied candidate and opportunity information.
2. Do NOT invent candidate experience, certifications, company facts, or job requirements.
3. Clearly distinguish matched skills from missing skills.
4. Give actionable, practical recommendations.
5. Return ONLY a valid JSON object matching the EXACT schema below. Do not include extra text.

REQUIRED JSON SCHEMA:
{
  "summary": "Short 1-2 sentence executive summary of candidate fit",
  "whyYouMatch": ["Bullet point 1 explaining why candidate matches", "Bullet point 2..."],
  "skillGaps": ["Specific missing skill gap to address 1", "..."],
  "recommendation": "Actionable application recommendation",
  "interviewTips": ["Practical interview preparation tip 1", "Tip 2..."]
}
`;

  const geminiPayload = {
    contents: [
      {
        parts: [
          {
            text: promptText
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await makeGeminiHttpRequest(apiKey, geminiPayload, 10000);

    if (response.statusCode >= 200 && response.statusCode < 300 && response.data) {
      const candidates = response.data.candidates;
      if (Array.isArray(candidates) && candidates.length > 0) {
        const textContent = candidates[0].content?.parts[0]?.text;
        if (textContent) {
          return parseAndValidateGeminiJson(textContent);
        }
      }
    }
  } catch (err) {
    console.warn(`Gemini API call warning: ${err.message}. Generating safe match explanation fallback.`);
  }

  // Return safe structured explanation fallback if API key is placeholder or network times out
  return generateLocalExplanationFallback(input);
};

module.exports = {
  generateJSON,
  generateMatchExplanation
};
