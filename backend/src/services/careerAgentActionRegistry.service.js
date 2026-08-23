/**
 * Safe Action Registry Service
 * Explicit registry defining all supported Career Agent actions, their categories, risk levels, and execution handlers.
 */

const ACTION_DEFINITIONS = {
  REFRESH_INTELLIGENCE: {
    id: 'REFRESH_INTELLIGENCE',
    label: 'Refresh Career Intelligence Snapshot',
    description: 'Rebuilds unified context and updates candidate career health benchmarks.',
    category: 'career',
    riskLevel: 'SAFE',
    requiresApproval: false,
    deepLink: '/dashboard/agent'
  },
  IMPROVE_RESUME: {
    id: 'IMPROVE_RESUME',
    label: 'Optimize Resume ATS Score',
    description: 'Analyzes resume content against target roles and suggests bullet points.',
    category: 'resume',
    riskLevel: 'SAFE',
    requiresApproval: false,
    deepLink: '/dashboard/resume'
  },
  PRACTICE_INTERVIEW: {
    id: 'PRACTICE_INTERVIEW',
    label: 'Practice AI Mock Interview',
    description: 'Launches tailored mock interview session based on candidate skill gaps.',
    category: 'interview',
    riskLevel: 'SAFE',
    requiresApproval: false,
    deepLink: '/dashboard/interview-coach'
  },
  PREPARE_APPLICATION: {
    id: 'PREPARE_APPLICATION',
    label: 'Prepare Job Application Assets',
    description: 'Generates tailored cover letter and application checklist for target role.',
    category: 'application',
    riskLevel: 'SAFE',
    requiresApproval: false,
    deepLink: '/dashboard/application-assistant'
  },
  LEARN_SKILL: {
    id: 'LEARN_SKILL',
    label: 'Explore Skill Learning Path',
    description: 'Generates recommended learning resources and project ideas for missing skills.',
    category: 'skills',
    riskLevel: 'SAFE',
    requiresApproval: false,
    deepLink: '/dashboard/career-copilot'
  },
  BUILD_APPLICATION_PIPELINE: {
    id: 'BUILD_APPLICATION_PIPELINE',
    label: 'Discover Monitored Opportunities',
    description: 'Scans AI Opportunity Monitor for newly discovered 80%+ match opportunities.',
    category: 'opportunities',
    riskLevel: 'SAFE',
    requiresApproval: false,
    deepLink: '/dashboard/opportunities'
  },
  UPDATE_PROFILE: {
    id: 'UPDATE_PROFILE',
    label: 'Update Candidate Profile Preferences',
    description: 'Modifies candidate target roles, preferred locations, or salary expectations.',
    category: 'profile',
    riskLevel: 'HIGH_IMPACT',
    requiresApproval: true,
    deepLink: '/dashboard/profile'
  },
  APPLY_TO_OPPORTUNITY: {
    id: 'APPLY_TO_OPPORTUNITY',
    label: 'Submit Job Application to Employer',
    description: 'Submits job application or contacts external recruiter on behalf of candidate.',
    category: 'application',
    riskLevel: 'EXTERNAL_ACTION',
    requiresApproval: true, // MANDATORY EXPLICIT APPROVAL
    deepLink: '/dashboard/applications'
  }
};

const getActionDefinition = (actionType) => {
  return ACTION_DEFINITIONS[actionType] || null;
};

const getAllActionDefinitions = () => {
  return Object.values(ACTION_DEFINITIONS);
};

module.exports = {
  ACTION_DEFINITIONS,
  getActionDefinition,
  getAllActionDefinitions
};
