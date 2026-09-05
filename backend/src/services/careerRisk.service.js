/**
 * Career Risk Detection Service
 * Identifies potential pipeline risks with constructive, encouraging mitigation steps.
 */

const detectCareerRisks = (unifiedContext) => {
  const resume = unifiedContext.resume || {};
  const applications = Array.isArray(unifiedContext.applications) ? unifiedContext.applications : (unifiedContext.rawApplications || []);
  const interviewSessions = Array.isArray(unifiedContext.interviewSessions) ? unifiedContext.interviewSessions : (unifiedContext.rawInterviewSessions || []);
  const user = unifiedContext.user || {};

  const risks = [];
  const atsScore = resume.atsScore ?? resume.score ?? 0;
  const profile = user.profile || {};

  // 1. Inactivity Risk
  if (applications.length === 0) {
    risks.push({
      risk: 'INACTIVE_PIPELINE',
      severity: 'MODERATE',
      title: 'Inactive Application Pipeline',
      evidence: 'No active job applications currently logged in your tracker.',
      recommendedMitigation: 'Review top 80%+ match recommendations and submit 2 applications this week.',
      confidence: 90
    });
  }

  // 2. ATS Score Risk
  if (atsScore < 60) {
    risks.push({
      risk: 'LOW_ATS_ALIGNMENT',
      severity: atsScore === 0 ? 'HIGH' : 'MODERATE',
      title: 'Sub-Optimum ATS Resume Score',
      evidence: atsScore === 0 ? 'No resume analyzed yet.' : `Current ATS score is ${atsScore}/100.`,
      recommendedMitigation: 'Use Resume Studio to include missing keywords and impact metrics.',
      confidence: 95
    });
  }

  // 3. Interview Readiness Gap Risk
  if (applications.length >= 3 && interviewSessions.length === 0) {
    risks.push({
      risk: 'UNPREPARED_INTERVIEW_STAGE',
      severity: 'LOW',
      title: 'Untested Interview Practice',
      evidence: 'You have active applications submitted but 0 mock interview sessions recorded.',
      recommendedMitigation: 'Run a 10-minute AI interview practice session to test STAR method formatting.',
      confidence: 80
    });
  }

  // Fallback if low risk
  if (risks.length === 0) {
    risks.push({
      risk: 'HEALTHY_TRAJECTORY',
      severity: 'LOW',
      title: 'Low Risk Status',
      evidence: 'Your career pipeline is balanced with no major risk flags.',
      recommendedMitigation: 'Continue maintaining active momentum.',
      confidence: 85
    });
  }

  const severityOrder = { CRITICAL: 1, HIGH: 2, MODERATE: 3, LOW: 4 };
  risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    highestRisk: risks[0],
    allRisks: risks
  };
};

module.exports = {
  detectCareerRisks
};
