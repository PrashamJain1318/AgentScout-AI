/**
 * Career Agent Reasoning Engine
 * Determines WHY an action matters based on unified candidate context.
 * Generates user-safe concise reasoning, evidence, confidence, and urgency.
 */
const generateReasoning = (context, memories = []) => {
  const {
    profile = {},
    resume = {},
    skills = {},
    applications = {},
    applicationReadiness = 0,
    interviewReadiness = 0,
    opportunities = {},
    risks = []
  } = context;

  const profileCompletion = profile.completion || 0;
  const atsScore = resume.atsScore || 0;
  const activeApps = applications.active || 0;
  const totalApps = applications.total || 0;
  const highQualityCount = opportunities.highQualityCount || 0;
  const criticalGaps = skills.criticalGaps || [];

  // Deterministic Reasoning Tree
  let decisionKey = 'REVIEW_CAREER_ANALYTICS';
  let reason = 'Review your continuous career health and progress metrics.';
  let evidence = ['All core profile and resume benchmarks meet recommended thresholds.'];
  let confidence = 0.88;
  let impact = 'medium';
  let urgency = 'low';

  if (atsScore < 70) {
    decisionKey = 'IMPROVE_RESUME';
    reason = `Your resume ATS score is ${atsScore}%, which is below the recommended 70% threshold for recruiter screening.`;
    evidence = [
      `Current ATS Score: ${atsScore}%`,
      `Profile completion: ${profileCompletion}%`,
      `Key skill coverage is at ${skills.coverageScore || 50}%`
    ];
    confidence = 0.95;
    impact = 'critical';
    urgency = 'critical';
  } else if (interviewReadiness < 70 && totalApps > 0) {
    decisionKey = 'PRACTICE_INTERVIEW';
    reason = `Your interview readiness score is ${interviewReadiness}%, below the 70% threshold needed to clear technical rounds.`;
    evidence = [
      `Interview readiness score: ${interviewReadiness}%`,
      `Active applications in pipeline: ${activeApps}`,
      `Completed mock sessions: ${context.interviewReadiness > 0 ? 'Needs more practice' : '0 sessions'}`
    ];
    confidence = 0.92;
    impact = 'high';
    urgency = 'high';
  } else if (highQualityCount > 0 && activeApps < 3) {
    decisionKey = 'PREPARE_APPLICATION';
    reason = `You have ${highQualityCount} high-match opportunities (80%+ match) available that haven't been applied to yet.`;
    evidence = [
      `${highQualityCount} high-match opportunities found`,
      `Current application readiness: ${applicationReadiness}%`,
      `Active pipeline count: ${activeApps} (target: 5+)`
    ];
    confidence = 0.94;
    impact = 'high';
    urgency = 'high';
  } else if (criticalGaps.length > 0) {
    decisionKey = 'LEARN_SKILL';
    reason = `High-demand target skills like ${criticalGaps.slice(0, 2).join(', ')} are currently missing from your profile.`;
    evidence = [
      `Identified critical gaps: ${criticalGaps.join(', ')}`,
      `Market skill coverage: ${skills.coverageScore || 60}%`
    ];
    confidence = 0.89;
    impact = 'high';
    urgency = 'medium';
  } else if (totalApps < 5) {
    decisionKey = 'BUILD_APPLICATION_PIPELINE';
    reason = `Your application pipeline has ${totalApps} total submissions. Increasing pipeline volume improves interview frequency.`;
    evidence = [
      `Total applications submitted: ${totalApps}`,
      `Target pipeline volume: 5+ active applications`,
      `High-match roles available: ${highQualityCount}`
    ];
    confidence = 0.90;
    impact = 'medium';
    urgency = 'medium';
  }

  // Incorporate Relevant Memory Insights if Available
  if (Array.isArray(memories) && memories.length > 0) {
    const prefMemories = memories.filter(m => m.memoryType === 'PREFERENCE');
    if (prefMemories.length > 0) {
      evidence.push(`Agent memory aligned with candidate preferences: ${prefMemories.map(m => m.key).join(', ')}`);
    }
  }

  return {
    decisionKey,
    reason,
    evidence,
    confidence,
    impact,
    urgency
  };
};

module.exports = {
  generateReasoning
};
