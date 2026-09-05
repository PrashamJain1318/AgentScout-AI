/**
 * Opportunity Priority Intelligence Service
 * Ranks opportunities into actionable priority tiers with explanations.
 */

const evaluateOpportunityPriorities = (unifiedContext) => {
  const matches = Array.isArray(unifiedContext.matches) ? unifiedContext.matches : (unifiedContext.rawMatches || []);
  const opportunities = Array.isArray(unifiedContext.opportunities) ? unifiedContext.opportunities : (unifiedContext.rawOpportunities || []);
  const resume = unifiedContext.resume || {};

  const atsScore = resume.atsScore ?? resume.score ?? 0;
  const oppList = matches.length > 0 ? matches.map(m => ({ ...m.opportunity, matchScore: m.matchScore })) : opportunities;

  const prioritized = (oppList || []).map(opp => {
    if (!opp) return null;
    const matchScore = opp.matchScore || 70;
    const readiness = Math.round((matchScore + atsScore) / 2);

    let priorityCategory = 'GOOD_OPPORTUNITY';
    let priorityBadge = 'GOOD OPPORTUNITY';
    let reason = 'Solid skill and experience alignment.';

    if (matchScore >= 85 && readiness >= 75) {
      priorityCategory = 'APPLY_NOW';
      priorityBadge = 'APPLY NOW 🔥';
      reason = 'Top-tier match score and high application readiness. High callback probability.';
    } else if (matchScore >= 75) {
      priorityCategory = 'HIGH_PRIORITY';
      priorityBadge = 'HIGH PRIORITY';
      reason = 'Strong alignment with your profile and target role goals.';
    } else if (matchScore < 60) {
      priorityCategory = 'WATCH';
      priorityBadge = 'WATCHLIST';
      reason = 'Requires minor skill buildup or resume customization before applying.';
    }

    return {
      opportunityId: opp._id || opp.id,
      title: opp.title || 'Target Role',
      company: opp.company || 'Target Company',
      location: opp.location || 'Remote',
      matchScore,
      applicationReadiness: readiness,
      priorityCategory,
      priorityBadge,
      reason,
      deepLink: `/opportunities/${opp._id || opp.id || ''}`
    };
  }).filter(Boolean);

  prioritized.sort((a, b) => b.matchScore - a.matchScore);

  return {
    topPriorityOpportunity: prioritized[0] || null,
    opportunities: prioritized
  };
};

module.exports = {
  evaluateOpportunityPriorities
};
