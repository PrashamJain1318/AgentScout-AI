const aiProvider = require('./ai/aiProvider');

const COMMON_SKILLS = [
  'React', 'React.js', 'Node.js', 'Express', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript',
  'Python', 'Java', 'C++', 'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'GraphQL', 'REST API', 'SQL', 'PostgreSQL', 'Redis', 'Git', 'CI/CD', 'Tailwind CSS',
  'HTML5', 'CSS3', 'Next.js', 'Vue.js', 'Angular', 'PyTorch', 'TensorFlow', 'Scikit-learn',
  'LLM', 'LangChain', 'OpenAI', 'Gemini', 'NLP', 'System Design', 'Microservices'
];

/**
 * Deterministic skill and contact extractor.
 */
const extractDeterministic = (text = '') => {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  const foundSkills = new Set();

  COMMON_SKILLS.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  });

  return {
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    skills: Array.from(foundSkills)
  };
};

/**
 * Attach AI Provenance tagging to skills array.
 * Separates authentic RESUME user skills from AI_RECOMMENDATION suggestions.
 */
const formatSkillsWithProvenance = (resumeSkills = [], aiRecommendedSkills = []) => {
  const provenanceList = [];
  const seen = new Set();

  // 1. Confirmed Resume Skills (Source: RESUME)
  resumeSkills.forEach(s => {
    const name = String(typeof s === 'object' ? s.name : s).trim();
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      provenanceList.push({
        name,
        source: "RESUME",
        confidence: 0.95
      });
    }
  });

  // 2. AI Recommended Skills (Source: AI_RECOMMENDATION)
  aiRecommendedSkills.forEach(s => {
    const name = String(typeof s === 'object' ? s.name : s).trim();
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      provenanceList.push({
        name,
        source: "AI_RECOMMENDATION",
        confidence: 0.82
      });
    }
  });

  return provenanceList;
};

/**
 * Extract structured resume data using AI Abstraction Provider (NVIDIA NIM / Gemini).
 */
const extractStructuredResumeData = async (rawText, userProfile = {}) => {
  const det = extractDeterministic(rawText);

  const rawResumeSkills = det.skills.length > 0 ? det.skills : (userProfile.profile?.skills || []);
  const initialProvenanceSkills = formatSkillsWithProvenance(rawResumeSkills, []);

  let extracted = {
    name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
    email: det.email || userProfile.email || '',
    phone: det.phone || '',
    location: userProfile.profile?.location || '',
    headline: userProfile.profile?.targetRole || userProfile.profile?.headline || null,
    summary: rawText.slice(0, 300),
    skills: rawResumeSkills,
    provenanceSkills: initialProvenanceSkills,
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    strengths: [],
    skillGaps: [],
    recommendedSkills: []
  };

  if (rawText && rawText.length > 50) {
    try {
      const prompt = `Analyze this candidate resume text and target role to generate a structured analysis.
      
      RESUME TEXT:
      ${rawText.slice(0, 4000)}

      TARGET ROLE:
      ${userProfile.profile?.targetRole || 'Software Professional'}

      Return strictly a valid JSON object matching this schema:
      {
        "name": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "headline": "string",
        "summary": "string",
        "skills": ["string"],
        "experience": [
          {
            "company": "string",
            "role": "string",
            "startDate": "string",
            "endDate": "string",
            "description": "string",
            "achievements": ["string"]
          }
        ],
        "education": [
          {
            "institution": "string",
            "degree": "string",
            "field": "string",
            "startDate": "string",
            "endDate": "string"
          }
        ],
        "projects": [
          {
            "name": "string",
            "description": "string",
            "technologies": ["string"],
            "url": "string"
          }
        ],
        "certifications": ["string"],
        "strengths": ["string"],
        "skillGaps": ["string"],
        "recommendedSkills": ["string"]
      }`;

      const parsed = await aiProvider.generateJSON(prompt, {
        temperature: 0.2,
        systemPrompt: "You are AgentScout Resume Intelligence AI."
      });

      if (parsed && typeof parsed === 'object') {
        const combinedResumeSkills = Array.from(new Set([...(parsed.skills || []), ...det.skills]));
        const aiRecommendations = Array.from(new Set(parsed.recommendedSkills || []));
        const provenanceSkills = formatSkillsWithProvenance(combinedResumeSkills, aiRecommendations);

        extracted = {
          ...extracted,
          ...parsed,
          skills: combinedResumeSkills,
          provenanceSkills,
          recommendedSkills: aiRecommendations
        };
      }
    } catch (err) {
      console.warn('AI Resume Extraction Warning:', err.message);
    }
  }

  return extracted;
};

module.exports = {
  extractDeterministic,
  formatSkillsWithProvenance,
  extractStructuredResumeData
};
