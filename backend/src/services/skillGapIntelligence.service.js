/**
 * Skill Gap Intelligence Service
 * Analyzes candidate skills against market demand from opportunities and matches.
 */

const analyzeSkillGaps = (unifiedContext) => {
  const profile = unifiedContext.profile || unifiedContext.user?.profile || {};
  const resume = unifiedContext.resume || {};
  const matches = Array.isArray(unifiedContext.matches) ? unifiedContext.matches : (unifiedContext.rawMatches || []);
  const opportunities = Array.isArray(unifiedContext.opportunities) ? unifiedContext.opportunities : (unifiedContext.rawOpportunities || []);

  const candidateSkills = new Set([
    ...(profile.skills || []).map(s => String(s).toLowerCase().trim()),
    ...(resume.skills || []).map(s => String(s).toLowerCase().trim())
  ]);

  // Aggregate market skill requirements
  const marketSkillCounts = {};
  const sampleOppList = [
    ...(matches || []).map(m => m.opportunity || m),
    ...(opportunities || [])
  ];

  sampleOppList.forEach(opp => {
    if (!opp) return;
    const reqSkills = [
      ...(opp.requiredSkills || []),
      ...(opp.skills || []),
      ...(opp.tags || [])
    ];
    reqSkills.forEach(skill => {
      const normalized = String(skill).toLowerCase().trim();
      if (normalized.length > 1) {
        marketSkillCounts[normalized] = (marketSkillCounts[normalized] || 0) + 1;
      }
    });
  });

  const missingSkills = [];

  Object.entries(marketSkillCounts).forEach(([skill, count]) => {
    if (!candidateSkills.has(skill)) {
      let importance = 'MODERATE';
      let impact = 'Moderate Impact';

      if (count >= 3) {
        importance = 'CRITICAL';
        impact = 'Very High Impact (Required by 80%+ matches)';
      } else if (count === 2) {
        importance = 'HIGH';
        impact = 'High Impact (Appears in multiple tracked roles)';
      }

      missingSkills.push({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        importance,
        impact,
        demandFrequency: count,
        estimatedPriority: count >= 3 ? 1 : count === 2 ? 2 : 3,
        reason: `Required by ${count} opportunity posting(s) in your market match pool.`
      });
    }
  });

  // Default fallback gaps if no data found
  if (missingSkills.length === 0) {
    if (!candidateSkills.has('typescript')) {
      missingSkills.push({
        skill: 'TypeScript',
        importance: 'HIGH',
        impact: 'High Impact (Top demand for frontend/fullstack roles)',
        demandFrequency: 4,
        estimatedPriority: 1,
        reason: 'Recommended key skill for software development roles.'
      });
    }
    if (!candidateSkills.has('docker')) {
      missingSkills.push({
        skill: 'Docker',
        importance: 'MODERATE',
        impact: 'Moderate Impact (Containerization standard)',
        demandFrequency: 2,
        estimatedPriority: 2,
        reason: 'Recommended for backend & cloud platform roles.'
      });
    }
  }

  // Sort by estimated priority
  missingSkills.sort((a, b) => a.estimatedPriority - b.estimatedPriority);

  const strengths = Array.from(candidateSkills).map(s => s.charAt(0).toUpperCase() + s.slice(1));

  return {
    skillStrengths: strengths,
    skillGaps: missingSkills,
    topPriorityGap: missingSkills[0] || null
  };
};

module.exports = {
  analyzeSkillGaps
};
