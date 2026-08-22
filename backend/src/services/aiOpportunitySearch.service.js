const https = require('https');
const Opportunity = require('../models/Opportunity.model');
const { isGeminiConfigured } = require('../config/gemini');

/**
 * Perform HTTPS POST request to Google Gemini API with timeout protection.
 * @param {string} apiKey - Gemini API key
 * @param {Object} payload - Gemini request body
 * @param {number} timeoutMs - Timeout limit in milliseconds
 * @returns {Promise<Object>} API Response
 */
const makeGeminiHttpRequest = (apiKey, payload, timeoutMs = 10000) => {
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
 * Fallback natural language query parser when Gemini API key is placeholder or network times out.
 * @param {string} queryText
 * @returns {Object} Structured filters
 */
const parseHeuristicQuery = (queryText = '') => {
  const text = String(queryText).trim().toLowerCase();

  const knownSkills = [
    'python', 'react', 'node.js', 'nodejs', 'mongodb', 'pytorch', 'tensorflow',
    'javascript', 'typescript', 'aws', 'docker', 'sql', 'express', 'c++', 'java'
  ];
  const detectedSkills = knownSkills.filter(skill => text.includes(skill.toLowerCase()));

  const knownLocations = ['bangalore', 'bengaluru', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'india'];
  let detectedLocation = '';
  for (const loc of knownLocations) {
    if (text.includes(loc)) {
      detectedLocation = loc === 'bengaluru' ? 'Bangalore' : loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  let type = '';
  if (text.includes('internship') || text.includes('intern')) type = 'internship';
  else if (text.includes('research')) type = 'research';
  else if (text.includes('job') || text.includes('full-time') || text.includes('full time') || text.includes('engineer') || text.includes('developer')) type = 'job';

  let remote = null;
  if (text.includes('remote') || text.includes('work from home')) remote = true;

  const keywords = [];
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('ml') || text.includes('machine learning')) keywords.push('AI');
  if (text.includes('backend')) keywords.push('backend');
  if (text.includes('frontend')) keywords.push('frontend');
  if (text.includes('fullstack') || text.includes('full-stack') || text.includes('full stack')) keywords.push('full-stack');

  return {
    keywords,
    skills: detectedSkills.map(s => s === 'nodejs' ? 'Node.js' : s.charAt(0).toUpperCase() + s.slice(1)),
    location: detectedLocation,
    type,
    remote,
    company: '',
    desiredRoles: []
  };
};

/**
 * Interpret a natural language query into structured search filters using Gemini.
 * @param {string} queryText
 * @returns {Promise<Object>} Structured search filters
 */
const interpretQueryWithGemini = async (queryText = '') => {
  if (!isGeminiConfigured()) {
    return parseHeuristicQuery(queryText);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const promptText = `
You are an intelligent search intent parser for job and internship opportunities at AgentScout AI.
Parse the following candidate natural language search query into a structured JSON filter object:

QUERY: "${queryText}"

INSTRUCTIONS:
1. Extract user intent accurately.
2. Identify:
   - "keywords": Array of topic/domain keywords (e.g. ["AI", "Machine Learning", "Backend"])
   - "skills": Array of technical skill names (e.g. ["Python", "React", "Node.js"])
   - "location": City or country name if specified (e.g. "Bangalore" or "India"), else ""
   - "type": Role type ("job", "internship", "research"), or "" if not specified
   - "remote": true if user asks for remote/work-from-home, false if onsite explicitly requested, null if not specified
   - "company": Specific company name if requested, else ""
   - "desiredRoles": Array of target role titles (e.g. ["AI Engineer", "Software Engineer"])
3. Return ONLY a valid JSON object matching the EXACT schema below.

REQUIRED JSON SCHEMA:
{
  "keywords": ["string"],
  "skills": ["string"],
  "location": "string",
  "type": "string",
  "remote": true|false|null,
  "company": "string",
  "desiredRoles": ["string"]
}
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  try {
    const res = await makeGeminiHttpRequest(apiKey, payload, 10000);
    if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
      const candidates = res.data.candidates;
      if (Array.isArray(candidates) && candidates.length > 0) {
        let textContent = candidates[0].content?.parts[0]?.text;
        if (textContent) {
          textContent = textContent.trim();
          if (textContent.startsWith('```')) {
            textContent = textContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          }
          const parsed = JSON.parse(textContent);
          return {
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(s => String(s).trim()).filter(Boolean) : [],
            skills: Array.isArray(parsed.skills) ? parsed.skills.map(s => String(s).trim()).filter(Boolean) : [],
            location: parsed.location ? String(parsed.location).trim() : '',
            type: (parsed.type && ['job', 'internship', 'research'].includes(String(parsed.type).toLowerCase())) ? String(parsed.type).toLowerCase() : '',
            remote: typeof parsed.remote === 'boolean' ? parsed.remote : null,
            company: parsed.company ? String(parsed.company).trim() : '',
            desiredRoles: Array.isArray(parsed.desiredRoles) ? parsed.desiredRoles.map(s => String(s).trim()).filter(Boolean) : []
          };
        }
      }
    }
  } catch (err) {
    console.warn(`Gemini AI search interpretation warning: ${err.message}. Using heuristic parser fallback.`);
  }

  return parseHeuristicQuery(queryText);
};

/**
 * Execute AI opportunity search and rank results based on relevance score.
 * @param {string} queryText - Candidate natural language search query
 * @param {number} limit - Maximum results to return (default 20)
 * @returns {Promise<Object>} { query, interpretedFilters, count, opportunities }
 */
const searchAndRankOpportunities = async (queryText, limit = 20) => {
  const interpretedFilters = await interpretQueryWithGemini(queryText);

  const filter = { isActive: true };
  const orConditions = [];

  // Role type filter
  if (interpretedFilters.type) {
    filter.type = interpretedFilters.type;
  }

  // Remote filter
  if (interpretedFilters.remote !== null && interpretedFilters.remote !== undefined) {
    filter.remote = interpretedFilters.remote;
  }

  // Location filter
  if (interpretedFilters.location) {
    filter.location = { $regex: interpretedFilters.location.trim(), $options: 'i' };
  }

  // Company filter
  if (interpretedFilters.company) {
    filter.company = { $regex: interpretedFilters.company.trim(), $options: 'i' };
  }

  // Skills & Keywords matching
  const searchTerms = [
    ...(interpretedFilters.skills || []),
    ...(interpretedFilters.keywords || []),
    ...(interpretedFilters.desiredRoles || [])
  ];

  if (searchTerms.length > 0) {
    for (const term of searchTerms) {
      if (term && term.trim()) {
        const regex = new RegExp(term.trim(), 'i');
        orConditions.push(
          { title: regex },
          { company: regex },
          { description: regex },
          { requirements: regex }
        );
      }
    }
  }

  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }

  // Execute database query
  let opportunities = await Opportunity.find(filter);

  // If strict filter yielded 0 results, relax MongoDB query to active opportunities for ranking
  if (!opportunities || opportunities.length === 0) {
    delete filter.$or;
    delete filter.company;
    opportunities = await Opportunity.find({ isActive: true });
  }

  // Calculate Relevance Ranking Score for each opportunity
  const normSkills = (interpretedFilters.skills || []).map(s => s.toLowerCase());
  const normKeywords = (interpretedFilters.keywords || []).map(k => k.toLowerCase());
  const normRoles = (interpretedFilters.desiredRoles || []).map(r => r.toLowerCase());
  const reqLocation = (interpretedFilters.location || '').toLowerCase();

  const ranked = opportunities.map(opp => {
    let score = 0;

    const oppTitle = (opp.title || '').toLowerCase();
    const oppDesc = (opp.description || '').toLowerCase();
    const oppCompany = (opp.company || '').toLowerCase();
    const oppLocation = (opp.location || '').toLowerCase();
    const oppReqs = (opp.requirements || []).map(r => String(r).toLowerCase());

    // 1. Skill Match Scoring (+20 per matched requirement skill)
    for (const skill of normSkills) {
      if (oppReqs.some(r => r.includes(skill))) {
        score += 20;
      } else if (oppTitle.includes(skill) || oppDesc.includes(skill)) {
        score += 10;
      }
    }

    // 2. Keyword & Role Scoring (+15 for title match, +10 for description match)
    for (const kw of [...normKeywords, ...normRoles]) {
      if (oppTitle.includes(kw)) {
        score += 15;
      }
      if (oppDesc.includes(kw) || oppCompany.includes(kw)) {
        score += 10;
      }
    }

    // 3. Location Match Scoring (+15 if location matches)
    if (reqLocation && oppLocation.includes(reqLocation)) {
      score += 15;
    }

    // 4. Role Type Match Scoring (+15 if type matches)
    if (interpretedFilters.type && opp.type === interpretedFilters.type) {
      score += 15;
    }

    // 5. Remote Preference Match Scoring (+10 if remote setting matches)
    if (interpretedFilters.remote !== null && opp.remote === interpretedFilters.remote) {
      score += 10;
    }

    // 6. Recency Scoring (+5 bonus if posted within 7 days)
    if (opp.postedAt) {
      const ageDays = (Date.now() - new Date(opp.postedAt).getTime()) / (1000 * 3600 * 24);
      if (ageDays <= 7) score += 5;
    }

    return {
      opportunity: opp,
      score
    };
  });

  // Sort descending by relevance score
  ranked.sort((a, b) => b.score - a.score);

  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 50));
  const finalResults = ranked.slice(0, safeLimit).map(r => r.opportunity);

  return {
    query: queryText,
    interpretedFilters,
    count: finalResults.length,
    opportunities: finalResults
  };
};

module.exports = {
  interpretQueryWithGemini,
  searchAndRankOpportunities
};
