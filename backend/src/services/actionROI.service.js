/**
 * Career Action ROI Engine
 * Calculates Effort vs. Impact matrix and ranks candidate actions by ROI Score.
 */

const evaluateActionROI = (unifiedContext) => {
  const resume = unifiedContext.resume || {};
  const applications = Array.isArray(unifiedContext.applications) ? unifiedContext.applications : (unifiedContext.rawApplications || []);
  const matches = Array.isArray(unifiedContext.matches) ? unifiedContext.matches : (unifiedContext.rawMatches || []);
  const interviewSessions = Array.isArray(unifiedContext.interviewSessions) ? unifiedContext.interviewSessions : (unifiedContext.rawInterviewSessions || []);

  const atsScore = resume.atsScore ?? resume.score ?? 0;
  const actions = [];

  // 1. Resume ATS Optimization Action
  if (atsScore < 75) {
    actions.push({
      id: 'act-resume-ats',
      title: 'Optimize Resume ATS Score',
      description: 'Refine keywords and quantifiable metrics in Resume Studio.',
      category: 'RESUME',
      effort: 'LOW',
      impact: 'HIGH',
      urgency: 'HIGH',
      roiScore: 95,
      roiCategory: 'VERY_HIGH',
      deepLink: '/resume-studio',
      actionLabel: 'Optimize Resume',
      reason: 'Low effort, maximum impact on clearing initial ATS filters.'
    });
  }

  // 2. High Match Application Action
  const topMatch = matches.find(m => (m.matchScore || 0) >= 80);
  if (topMatch) {
    actions.push({
      id: 'act-apply-topmatch',
      title: `Submit Tailored Application to ${topMatch.opportunity?.company || 'Top Role'}`,
      description: `Apply to ${topMatch.matchScore}% match posting while listing is fresh.`,
      category: 'APPLICATION',
      effort: 'LOW',
      impact: 'HIGH',
      urgency: 'CRITICAL',
      roiScore: 90,
      roiCategory: 'VERY_HIGH',
      deepLink: `/opportunities/${topMatch.opportunity?._id || ''}`,
      actionLabel: 'Apply Now',
      reason: 'Immediate callback opportunity with minimal friction.'
    });
  }

  // 3. Interview Prep Action
  if (applications.length > 0 && interviewSessions.length === 0) {
    actions.push({
      id: 'act-mock-interview',
      title: 'Conduct AI Mock Interview Session',
      description: 'Practice behavioral & STAR method answers to ensure interview readiness.',
      category: 'INTERVIEW',
      effort: 'MEDIUM',
      impact: 'HIGH',
      urgency: 'MEDIUM',
      roiScore: 85,
      roiCategory: 'HIGH',
      deepLink: '/interview-prep',
      actionLabel: 'Launch Simulator',
      reason: 'Builds candidate confidence and improves response quality.'
    });
  }

  // 4. Discover Opportunities Action
  actions.push({
    id: 'act-discover-jobs',
    title: 'Explore High-Match Career Opportunities',
    description: 'Browse fresh AI-matched job postings tailored to your profile.',
    category: 'OPPORTUNITY',
    effort: 'LOW',
    impact: 'MEDIUM',
    urgency: 'MEDIUM',
    roiScore: 75,
    roiCategory: 'HIGH',
    deepLink: '/opportunity-discovery',
    actionLabel: 'Discover Jobs',
    reason: 'Keeps candidate pipeline active and fresh.'
  });

  actions.sort((a, b) => b.roiScore - a.roiScore);

  return {
    highestROIAction: actions[0] || null,
    actions
  };
};

module.exports = {
  evaluateActionROI
};
