const User = require('../models/User.model');
const Match = require('../models/Match.model');
const Application = require('../models/Application.model');
const Opportunity = require('../models/Opportunity.model');
const geminiService = require('./gemini.service');

/**
 * Build a compact candidate context for Gemini.
 */
const buildCandidateContext = async (userId) => {
  const user = await User.findById(userId).lean();

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const matches = await Match.find({ user: userId })
    .populate(
      'opportunity',
      'title company location type remote requirements description postedAt'
    )
    .sort({ score: -1, createdAt: -1 })
    .limit(20)
    .lean();

  const applications = await Application.find({ user: userId })
    .populate(
      'opportunity',
      'title company location type remote requirements'
    )
    .sort({ updatedAt: -1 })
    .limit(20)
    .lean();

  const statusCounts = {
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0
  };

  for (const application of applications) {
    if (statusCounts[application.status] !== undefined) {
      statusCounts[application.status]++;
    }
  }

  const profile = user.profile || {};
  const preferences = profile.preferences || {};

  return {
    candidate: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      headline: profile.headline || '',
      location: profile.location || '',
      biography: profile.biography || profile.bio || '',
      skills: profile.skills || [],
      experience: profile.experience || [],
      education: profile.education || []
    },

    preferences: {
      desiredRoles: preferences.desiredRoles || [],
      preferredLocations: preferences.preferredLocations || [],
      remotePreference: preferences.remotePreference ?? false
    },

    matching: {
      totalMatches: matches.length,
      topMatches: matches.map((match) => ({
        score: match.score,
        matchLevel: match.matchLevel,
        matchedSkills: match.matchedSkills || [],
        missingSkills: match.missingSkills || [],
        opportunity: match.opportunity
          ? {
              title: match.opportunity.title,
              company: match.opportunity.company,
              location: match.opportunity.location,
              type: match.opportunity.type,
              remote: match.opportunity.remote,
              requirements: match.opportunity.requirements || []
            }
          : null
      }))
    },

    applications: {
      total: applications.length,
      statusCounts,
      recent: applications.map((application) => ({
        status: application.status,
        appliedAt: application.appliedAt,
        notes: application.notes || '',
        opportunity: application.opportunity
          ? {
              title: application.opportunity.title,
              company: application.opportunity.company,
              location: application.opportunity.location,
              type: application.opportunity.type,
              remote: application.opportunity.remote,
              requirements: application.opportunity.requirements || []
            }
          : null
      }))
    }
  };
};

/**
 * Safely normalize and validate Career Copilot plan schema.
 */
const normalizeCareerCopilotPlan = (rawPlan = {}) => {
  const plan = typeof rawPlan === 'object' && rawPlan !== null ? rawPlan : {};

  return {
    careerSummary: plan.careerSummary ? String(plan.careerSummary).trim() : 'Career analysis and development plan.',
    strengths: Array.isArray(plan.strengths) ? plan.strengths.map(s => String(s).trim()).filter(Boolean) : [],
    skillGaps: Array.isArray(plan.skillGaps) ? plan.skillGaps.map(s => String(s).trim()).filter(Boolean) : [],
    recommendedSkills: Array.isArray(plan.recommendedSkills) ? plan.recommendedSkills.map(s => String(s).trim()).filter(Boolean) : [],
    projectIdeas: Array.isArray(plan.projectIdeas)
      ? plan.projectIdeas.map(p => ({
          title: p && p.title ? String(p.title).trim() : 'Recommended Project',
          description: p && p.description ? String(p.description).trim() : 'Build a practical project to demonstrate skills.',
          skills: p && Array.isArray(p.skills) ? p.skills.map(s => String(s).trim()).filter(Boolean) : []
        }))
      : [],
    interviewPreparation: Array.isArray(plan.interviewPreparation)
      ? plan.interviewPreparation.map(s => String(s).trim()).filter(Boolean)
      : [],
    weeklyGoals: Array.isArray(plan.weeklyGoals)
      ? plan.weeklyGoals.map((w, idx) => ({
          week: w && typeof w.week === 'number' ? w.week : idx + 1,
          goals: w && Array.isArray(w.goals) ? w.goals.map(s => String(s).trim()).filter(Boolean) : []
        }))
      : [],
    nextActions: Array.isArray(plan.nextActions)
      ? plan.nextActions.map(s => String(s).trim()).filter(Boolean)
      : [],
    generatedAt: plan.generatedAt || new Date()
  };
};

/**
 * Fallback AI Career Plan generator when Gemini API is unresponsive or rate-limited.
 */
const generateLocalCareerCopilotFallback = (context = {}) => {
  const candidate = context.candidate || {};
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const topMatches = context.matching?.topMatches || [];
  const missingSkills = topMatches.length > 0 && Array.isArray(topMatches[0].missingSkills) ? topMatches[0].missingSkills : ['Advanced System Architecture'];

  return {
    careerSummary: `${candidate.firstName || 'Candidate'} has demonstrated technical capabilities in ${skills.join(', ') || 'software engineering'} and is actively pursuing role opportunities aligned with their preferences.`,
    strengths: skills.length > 0 ? skills.map(s => `Proficiency in ${s}`) : ['General software development background', 'Proactive job search engagement'],
    skillGaps: missingSkills.map(s => `Mastery of ${s}`),
    recommendedSkills: missingSkills.length > 0 ? missingSkills : ['System Design', 'Cloud Architecture'],
    projectIdeas: [
      {
        title: `Full-Stack ${skills[0] || 'Software'} Project`,
        description: `Build a production-grade web application combining ${skills.join(', ') || 'modern frameworks'} to showcase practical experience.`,
        skills: skills.length > 0 ? skills : ['Node.js', 'React']
      }
    ],
    interviewPreparation: [
      `Review core concepts and algorithms for ${skills[0] || 'software engineering'}.`,
      'Prepare STAR-method responses for behavioral interview rounds.'
    ],
    weeklyGoals: [
      {
        week: 1,
        goals: [`Focus on strengthening ${missingSkills[0] || 'core technical stack'}.`, 'Update GitHub repositories.']
      },
      {
        week: 2,
        goals: ['Build hands-on portfolio project.', 'Apply to matched active opportunities.']
      }
    ],
    nextActions: [
      'Refine profile headline and bio.',
      'Complete recommended technical project.'
    ]
  };
};

/**
 * Generate a personalized AI career plan using Gemini.
 */
const generateCareerCopilotPlan = async (userId, options = {}) => {
  const context = await buildCandidateContext(userId);

  const prompt = `
You are an AI Career Copilot for a candidate using AgentScout AI.

Analyze the candidate's profile, preferences, job matches, and application history.

Candidate context:
${JSON.stringify(context, null, 2)}

Generate a practical and personalized career plan.

The response MUST be valid JSON with exactly this structure:

{
  "careerSummary": "string",
  "strengths": ["string"],
  "skillGaps": ["string"],
  "recommendedSkills": ["string"],
  "projectIdeas": [
    {
      "title": "string",
      "description": "string",
      "skills": ["string"]
    }
  ],
  "interviewPreparation": ["string"],
  "weeklyGoals": [
    {
      "week": 1,
      "goals": ["string"]
    }
  ],
  "nextActions": ["string"]
}

Rules:
- Base recommendations on the candidate data.
- Do not invent work experience or education.
- Prioritize skills relevant to the candidate's desired roles and matched opportunities.
- Keep recommendations practical and actionable.
- If information is missing, make conservative recommendations.
- Return JSON only.
`;

  try {
    const result = await geminiService.generateJSON(prompt, {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxOutputTokens ?? 3000
    });

    return normalizeCareerCopilotPlan({
      ...result,
      generatedAt: new Date()
    });
  } catch (err) {
    console.warn(`Career Copilot Gemini API call warning: ${err.message}. Using safe candidate career plan fallback.`);
    const fallback = generateLocalCareerCopilotFallback(context);
    return normalizeCareerCopilotPlan({
      ...fallback,
      generatedAt: new Date()
    });
  }
};

module.exports = {
  buildCandidateContext,
  generateCareerCopilotPlan
};
