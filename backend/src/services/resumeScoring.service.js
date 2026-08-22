const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

/**
 * Calculate deterministic resume scores, gaps, and ATS recommendations.
 */
const calculateResumeScores = async (extractedData = {}, rawText = '') => {
  const {
    name,
    email,
    phone,
    summary,
    skills = [],
    experience = [],
    education = [],
    projects = [],
    certifications = []
  } = extractedData;

  // 1. Completeness Score (0-100)
  let completeness = 0;
  if (name) completeness += 10;
  if (email) completeness += 10;
  if (phone) completeness += 10;
  if (summary && summary.length > 20) completeness += 15;
  if (skills.length >= 3) completeness += 20;
  if (experience.length > 0) completeness += 15;
  if (education.length > 0) completeness += 10;
  if (projects.length > 0) completeness += 10;
  completeness = Math.min(100, completeness);

  // 2. Skills Coverage Score (0-100)
  const skillsCount = skills.length;
  let skillsCoverage = Math.min(100, Math.round((skillsCount / 8) * 100));

  // 3. Impact Score (0-100)
  let impact = 40;
  const actionVerbs = ['developed', 'built', 'created', 'implemented', 'optimized', 'led', 'designed', 'architected', 'improved', 'scaled'];
  const lowerText = rawText.toLowerCase();
  actionVerbs.forEach(verb => {
    if (lowerText.includes(verb)) impact += 5;
  });
  if (lowerText.match(/\d+%/g) || lowerText.match(/\$\d+/g)) {
    impact += 15; // Quantifiable metric boost
  }
  impact = Math.min(100, Math.max(30, impact));

  // 4. AgentScout ATS Score (0-100)
  let ats = Math.round((completeness * 0.4) + (skillsCoverage * 0.3) + (impact * 0.3));

  // 5. Overall Score (0-100)
  let overall = Math.round((ats * 0.5) + (completeness * 0.25) + (impact * 0.25));

  const gaps = [];
  if (!summary) gaps.push('Missing professional summary section');
  if (skills.length < 5) gaps.push('Skill matrix contains fewer than 5 listed technical skills');
  if (experience.length === 0) gaps.push('No work experience entries detected');
  if (projects.length === 0) gaps.push('No portfolio projects listed');
  if (!lowerText.match(/\d+%/g)) gaps.push('Missing quantifiable impact metrics (e.g. %, $, numbers)');

  let suggestions = [
    {
      category: 'ATS Improvements',
      title: 'Include Standard Section Headers',
      explanation: 'Use clear headings like "Experience", "Education", and "Technical Skills" for optimal ATS parsing.',
      impactLevel: 'high'
    },
    {
      category: 'Content Improvements',
      title: 'Add Quantifiable Results',
      explanation: 'Add metric-driven bullet points (e.g., "Improved API response times by 35%") to boost your Impact score.',
      impactLevel: 'high'
    },
    {
      category: 'Skills Coverage',
      title: 'Expand Technical Skill Matrix',
      explanation: 'Include in-demand frameworks and cloud technologies (e.g., TypeScript, Docker, AWS) to match more recruiter queries.',
      impactLevel: 'medium'
    }
  ];

  // Optional Gemini AI suggestions refinement
  if (isGeminiConfigured() && rawText.length > 50) {
    try {
      const prompt = `Analyze this resume and provide 3-5 specific ATS and content improvement recommendations as JSON:
      
      RESUME SUMMARY:
      Skills: ${skills.join(', ')}
      Experience Count: ${experience.length}
      Projects Count: ${projects.length}
      Text snippet: ${rawText.slice(0, 2000)}
      
      Return ONLY a JSON array of objects with this schema:
      [
        {
          "category": "ATS Improvements | Content | Skills | Formatting",
          "title": "string",
          "explanation": "string",
          "impactLevel": "high | medium | low"
        }
      ]`;

      const aiRes = await makeGeminiHttpRequest(prompt);
      const jsonMatch = aiRes.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          suggestions = parsed.map(s => ({
            category: s.category || 'General',
            title: s.title || 'Improvement Recommendation',
            explanation: s.explanation || 'Enhance your resume for higher ATS alignment.',
            impactLevel: ['high', 'medium', 'low'].includes(s.impactLevel) ? s.impactLevel : 'medium'
          }));
        }
      }
    } catch (err) {
      console.warn('Gemini scoring suggestions fallback:', err.message);
    }
  }

  return {
    scores: {
      overall,
      ats,
      completeness,
      impact,
      skillsCoverage
    },
    gaps,
    suggestions
  };
};

module.exports = {
  calculateResumeScores
};
