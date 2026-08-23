const { generateReasoning } = require('./careerAgentReasoning.service');

const ACTION_MAP = {
  IMPROVE_RESUME: {
    action: 'IMPROVE_RESUME',
    title: 'Optimize Resume ATS Score',
    category: 'resume',
    deepLink: '/dashboard/resume',
    requiresApproval: false,
    riskLevel: 'SAFE'
  },
  PRACTICE_INTERVIEW: {
    action: 'PRACTICE_INTERVIEW',
    title: 'Complete AI Mock Interview Session',
    category: 'interview',
    deepLink: '/dashboard/interview-coach',
    requiresApproval: false,
    riskLevel: 'SAFE'
  },
  PREPARE_APPLICATION: {
    action: 'PREPARE_APPLICATION',
    title: 'Prepare Tailored Application & Cover Letter',
    category: 'application',
    deepLink: '/dashboard/application-assistant',
    requiresApproval: false,
    riskLevel: 'SAFE'
  },
  LEARN_SKILL: {
    action: 'LEARN_SKILL',
    title: 'Close High-Impact Skill Gaps',
    category: 'skills',
    deepLink: '/dashboard/career-copilot',
    requiresApproval: false,
    riskLevel: 'SAFE'
  },
  BUILD_APPLICATION_PIPELINE: {
    action: 'BUILD_APPLICATION_PIPELINE',
    title: 'Discover & Bookmark Target Opportunities',
    category: 'opportunities',
    deepLink: '/dashboard/opportunities',
    requiresApproval: false,
    riskLevel: 'SAFE'
  },
  REVIEW_CAREER_ANALYTICS: {
    action: 'REVIEW_CAREER_ANALYTICS',
    title: 'Review Career Health & Analytics',
    category: 'career',
    deepLink: '/dashboard/analytics',
    requiresApproval: false,
    riskLevel: 'SAFE'
  }
};

/**
 * Next-Best-Action Decision Engine
 * Selects the single highest-value action for the candidate based on reasoned state.
 */
const selectNextBestAction = (context, memories = []) => {
  const reasoning = generateReasoning(context, memories);
  const template = ACTION_MAP[reasoning.decisionKey] || ACTION_MAP.REVIEW_CAREER_ANALYTICS;

  return {
    action: template.action,
    title: template.title,
    category: template.category,
    priority: reasoning.urgency,
    impact: reasoning.impact,
    urgency: reasoning.urgency,
    reason: reasoning.reason,
    evidence: reasoning.evidence,
    confidence: reasoning.confidence,
    deepLink: template.deepLink,
    requiresApproval: template.requiresApproval,
    riskLevel: template.riskLevel
  };
};

module.exports = {
  selectNextBestAction
};
