/**
 * Application Agent Decision Engine
 * Evaluates unified candidate & opportunity context against decision rules
 * to calculate the Next Best Action, priority, and risk level.
 */
const evaluateApplicationDecision = (context) => {
  const { opportunity, match, readinessMetrics, duplicateDetected, existingApplicationStatus } = context;

  if (!opportunity) {
    return {
      decisionCode: 'NO_OPPORTUNITY_SELECTED',
      title: 'Select a Target Opportunity',
      description: 'Choose a high-match opportunity from Explorer to start AI Application Agent optimization.',
      nextAction: 'SELECT_OPPORTUNITY',
      priority: 'LOW',
      riskLevel: 'SAFE_INTERNAL_ACTION',
      recommendation: 'Browse Top Matches and set a target role for application preparation.'
    };
  }

  // Rule 4: Duplicate Application Check
  if (duplicateDetected) {
    return {
      decisionCode: 'BLOCK_APPLICATION',
      title: 'Duplicate Application Blocked',
      description: `You have already submitted an application for ${opportunity.title} at ${opportunity.company} (Status: ${existingApplicationStatus || 'Submitted'}).`,
      nextAction: 'VIEW_APPLICATION_STATUS',
      priority: 'LOW',
      riskLevel: 'SAFE_INTERNAL_ACTION',
      recommendation: 'Track existing application progress in Applications Tracker.'
    };
  }

  // Rule 5: Closed Opportunity Check
  if (opportunity.status === 'CLOSED' || opportunity.status === 'ARCHIVED') {
    return {
      decisionCode: 'STOP_WORKFLOW',
      title: 'Opportunity Closed',
      description: `${opportunity.company} is no longer accepting applications for ${opportunity.title}.`,
      nextAction: 'SWITCH_OPPORTUNITY',
      priority: 'LOW',
      riskLevel: 'SAFE_INTERNAL_ACTION',
      recommendation: 'Switch target role to another active high-match opportunity.'
    };
  }

  const matchScore = match?.score || 0;
  const overallReadiness = readinessMetrics?.overall || 0;
  const atsScore = readinessMetrics?.ats || 0;

  // Rule 1: Match Score < 60%
  if (matchScore < 60) {
    return {
      decisionCode: 'LOW_PRIORITY',
      title: 'Low Role Match Score',
      description: `Match score for ${opportunity.title} at ${opportunity.company} is ${matchScore}%, below the 60% recommended threshold.`,
      nextAction: 'DISCOVER_HIGHER_MATCHES',
      priority: 'LOW',
      riskLevel: 'SAFE_INTERNAL_ACTION',
      recommendation: 'Focus application energy on roles with >= 80% skill alignment.'
    };
  }

  // Rule 2: Match Score >= 80% AND Readiness < 70%
  if (matchScore >= 80 && overallReadiness < 70) {
    const isATSGapped = atsScore < 75;
    return {
      decisionCode: 'IMPROVE_APPLICATION',
      title: isATSGapped ? 'Optimize Resume ATS Score' : 'Tailor Application Skills & Cover Letter',
      description: `High match score (${matchScore}%), but overall application readiness is ${overallReadiness}%. ${isATSGapped ? `ATS score is ${atsScore}%.` : ''}`,
      nextAction: isATSGapped ? 'OPTIMIZE_RESUME' : 'GENERATE_COVER_LETTER',
      priority: 'HIGH',
      riskLevel: 'SAFE_INTERNAL_ACTION',
      recommendation: `Run AI Application Agent to generate tailored cover letter and optimize ATS keywords for ${opportunity.company}.`
    };
  }

  // Rule 3: Readiness >= 85%
  if (overallReadiness >= 85) {
    return {
      decisionCode: 'PREPARE_FOR_REVIEW',
      title: 'Prepare Application Package for Review',
      description: `Application readiness for ${opportunity.title} is ${overallReadiness}% with a ${atsScore}% ATS score. Ready for final review.`,
      nextAction: 'REQUEST_APPROVAL',
      priority: 'HIGH',
      riskLevel: 'HIGH_IMPACT',
      recommendation: 'Review generated cover letter, tailored answers, and submit with candidate approval.'
    };
  }

  // Default Fallback: Moderate Match & Readiness
  return {
    decisionCode: 'PROGRESS_PREPARATION',
    title: 'Complete Application Tailoring',
    description: `Match score: ${matchScore}%, Readiness: ${overallReadiness}%. Generate tailored materials to reach 85%+ readiness.`,
    nextAction: 'CALCULATE_READINESS',
    priority: 'MEDIUM',
    riskLevel: 'SAFE_INTERNAL_ACTION',
    recommendation: 'Generate application answers and review missing role requirements.'
  };
};

module.exports = {
  evaluateApplicationDecision
};
