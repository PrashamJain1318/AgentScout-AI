/**
 * Career Bottleneck Detection Service
 * Analyzes pipeline friction points blocking candidate career acceleration.
 */

const detectCareerBottlenecks = (unifiedContext) => {
  const user = unifiedContext.user || {};
  const resume = unifiedContext.resume || {};
  const applications = Array.isArray(unifiedContext.applications) ? unifiedContext.applications : (unifiedContext.rawApplications || []);
  const interviewSessions = Array.isArray(unifiedContext.interviewSessions) ? unifiedContext.interviewSessions : (unifiedContext.rawInterviewSessions || []);
  const matches = Array.isArray(unifiedContext.matches) ? unifiedContext.matches : (unifiedContext.rawMatches || []);

  const bottlenecks = [];
  const atsScore = resume.atsScore ?? resume.score ?? 0;
  const profileCompleteness = calculateProfileCompleteness(user.profile);

  // 1. Check Profile Incompleteness
  if (profileCompleteness < 70) {
    bottlenecks.push({
      bottleneck: 'INCOMPLETE_PROFILE',
      severity: 'HIGH',
      evidence: `Profile completeness is at ${profileCompleteness}%. Missing target roles, headline, or preferred work locations.`,
      confidence: 90,
      recommendedAction: 'Complete profile setup in Settings'
    });
  }

  // 2. Check Resume ATS Score
  if (!resume || atsScore < 65) {
    bottlenecks.push({
      bottleneck: 'LOW_ATS_SCORE',
      severity: atsScore === 0 ? 'CRITICAL' : 'HIGH',
      evidence: atsScore === 0 ? 'No optimized ATS resume uploaded.' : `Current ATS score is ${atsScore}/100, which is below automated screening thresholds.`,
      confidence: 95,
      recommendedAction: 'Optimize resume keywords and structure in Resume Studio'
    });
  }

  // 3. Check Application Conversion (High applications but low interviews)
  const interviewApps = applications.filter(a => ['INTERVIEWING', 'INTERVIEW_SCHEDULED', 'ASSESSMENT'].includes(a.status));
  if (applications.length >= 5 && interviewApps.length === 0) {
    bottlenecks.push({
      bottleneck: 'LOW_MATCH_QUALITY',
      severity: 'HIGH',
      evidence: `You have submitted ${applications.length} applications but have 0 interview callbacks.`,
      confidence: 85,
      recommendedAction: 'Tailor resume to match specific job descriptions before submitting'
    });
  }

  // 4. Check Application Activity (Strong matches available but low submission activity)
  const highMatches = matches.filter(m => (m.matchScore || 0) >= 80);
  if (highMatches.length > 0 && applications.length === 0) {
    bottlenecks.push({
      bottleneck: 'LOW_APPLICATION_ACTIVITY',
      severity: 'MEDIUM',
      evidence: `You have ${highMatches.length} high-match opportunities available, but 0 active application submissions.`,
      confidence: 88,
      recommendedAction: 'Submit applications to top 80%+ match opportunities'
    });
  }

  // 5. Check Interview Weaknesses
  if (interviewSessions.length > 0) {
    const avgInterviewScore = interviewSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / interviewSessions.length;
    if (avgInterviewScore < 60) {
      bottlenecks.push({
        bottleneck: 'INTERVIEW_WEAKNESS',
        severity: 'HIGH',
        evidence: `Average mock interview score is ${Math.round(avgInterviewScore)}/100.`,
        confidence: 80,
        recommendedAction: 'Practice mock interview sessions with STAR method feedback'
      });
    }
  }

  // Default fallback if no bottleneck triggered
  if (bottlenecks.length === 0) {
    bottlenecks.push({
      bottleneck: 'CAREER_INACTIVITY',
      severity: 'LOW',
      evidence: 'No critical blockers detected in your candidate pipeline.',
      confidence: 75,
      recommendedAction: 'Keep exploring high-match job postings'
    });
  }

  // Sort by severity
  const severityRank = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
  bottlenecks.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  return {
    primaryBottleneck: bottlenecks[0],
    allBottlenecks: bottlenecks
  };
};

function calculateProfileCompleteness(profile = {}) {
  let score = 30;
  if (profile.headline) score += 20;
  if (Array.isArray(profile.skills) && profile.skills.length > 0) score += 20;
  if (profile.location) score += 15;
  if (Array.isArray(profile.experience) && profile.experience.length > 0) score += 15;
  return Math.min(100, score);
}

module.exports = {
  detectCareerBottlenecks
};
