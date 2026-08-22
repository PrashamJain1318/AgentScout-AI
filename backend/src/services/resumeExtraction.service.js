const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

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
  const lowerText = text.toLowerCase();

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
 * Extract structured resume data using Gemini AI if available or fallback.
 */
const extractStructuredResumeData = async (rawText, userProfile = {}) => {
  const det = extractDeterministic(rawText);

  let extracted = {
    name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
    email: det.email || userProfile.email || '',
    phone: det.phone || '',
    location: userProfile.profile?.location || '',
    headline: userProfile.profile?.headline || 'Software Engineer',
    summary: rawText.slice(0, 300),
    skills: det.skills.length > 0 ? det.skills : (userProfile.profile?.skills || []),
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: []
  };

  if (isGeminiConfigured() && rawText.length > 50) {
    try {
      const prompt = `Analyze this resume text and extract candidate details as JSON:
      
      RESUME TEXT:
      ${rawText.slice(0, 4000)}
      
      Respond ONLY with a valid JSON object matching this schema:
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
        "languages": ["string"]
      }`;

      const aiResponse = await makeGeminiHttpRequest(prompt);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extracted = {
          ...extracted,
          ...parsed,
          skills: Array.from(new Set([...(parsed.skills || []), ...det.skills]))
        };
      }
    } catch (err) {
      console.warn('Gemini extraction fallback:', err.message);
    }
  }

  return extracted;
};

module.exports = {
  extractDeterministic,
  extractStructuredResumeData
};
