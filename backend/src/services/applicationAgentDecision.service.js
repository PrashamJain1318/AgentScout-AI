/**
 * Application Agent Decision Engine
 * Evaluates candidate & opportunity context against deterministic rules
 * to determine the highest-value next action with empirical evidence.
 */
const evaluateApplicationDecision = (context, minMatchThreshold = 75) => {
  const { opportunity, match, resume, applications, readinessMetrics } = context;

  // RULE 1: Opportunity does not exist
  if (!opportunity) {
    return {
      actionType: 'NO_OPPORTUNITY',
      title: 'Select a Target Opportunity',
      description: 'Select a high-match opportunity from Explorer to initiate Application Agent analysis.',
      priority: 'LOW',
      confidence: 0.95,
      impact: 'LOW',
      urgency: 'LOW',
      reasoning: 'No active target opportunity is currently selected for analysis.',
      evidence: 'Context target opportunity is null.',
      riskLevel: 'SAFE',
      requiresApproval: false
    };
  }

  // RULE 2: Candidate has already applied
  if (applications?.alreadyApplied) {
    return {
      actionType: 'DUPLICATE_APPLICATION_BLOCKED',
      title: 'Duplicate Application Prevented',
      description: `You have already submitted an application to ${opportunity.company} for ${opportunity.title}.`,
      priority: 'LOW',
      confidence: 1.0,
      impact: 'LOW',
      urgency: 'LOW',
      reasoning: `Application record exists for opportunity ID ${opportunity.id} with status "${applications.existingStatus || 'Submitted'}".`,
      evidence: `Applications database record found for opportunity ID: ${opportunity.id}.`,
      riskLevel: 'SAFE',
      requiresApproval: false
    };
  }

  // RULE 3: Opportunity is inactive or closed
  if (opportunity.status === 'CLOSED' || opportunity.status === 'ARCHIVED' || opportunity.status === 'INACTIVE') {
    return {
      actionType: 'OPPORTUNITY_UNAVAILABLE',
      title: 'Target Opportunity Closed',
      description: `${opportunity.company} is no longer accepting applications for ${opportunity.title}.`,
      priority: 'LOW',
      confidence: 1.0,
      impact: 'LOW',
      urgency: 'LOW',
      reasoning: `Opportunity status is currently "${opportunity.status}".`,
      evidence: `Opportunity database status: ${opportunity.status}.`,
      riskLevel: 'SAFE',
      requiresApproval: false
    };
  }

  const matchScore = Number(match?.score || 0);
  const atsScore = Number(resume?.atsScore || 0);
  const overallReadiness = Number(readinessMetrics?.overall || 0);
  const missingSkills = Array.isArray(match?.gaps) ? match.gaps : [];

  // RULE 4: Match score < minimumMatchScore
  if (matchScore < minMatchThreshold) {
    return {
      actionType: 'LOW_PRIORITY_OPPORTUNITY',
      title: 'Low Role Alignment Score',
      description: `Role match score for ${opportunity.title} is ${matchScore}%, below the minimum candidate threshold (${minMatchThreshold}%).`,
      priority: 'LOW',
      confidence: 0.9,
      impact: 'LOW',
      urgency: 'LOW',
      reasoning: `Candidate match score of ${matchScore}% does not meet threshold of ${minMatchThreshold}%.`,
      evidence: `Calculated match score: ${matchScore}%, Required: ${minMatchThreshold}%.`,
      riskLevel: 'SAFE',
      requiresApproval: false
    };
  }

  // RULE 6: Resume ATS score < 70
  if (atsScore < 70) {
    return {
      actionType: 'OPTIMIZE_RESUME',
      title: 'Optimize Resume ATS Alignment',
      description: `Your resume ATS score is ${atsScore}%, which is below the 70% recruiter pass mark for ${opportunity.company}.`,
      priority: 'CRITICAL',
      confidence: 0.95,
      impact: 'CRITICAL',
      urgency: 'HIGH',
      reasoning: `ATS analysis shows a score of ${atsScore}%. Passing ATS filters requires an ATS score >= 70%.`,
      evidence: `Parsed ATS score from Resume Intelligence: ${atsScore}%. Missing skills: ${missingSkills.join(', ') || 'Keywords'}.`,
      riskLevel: 'SAFE',
      requiresApproval: false
    };
  }

  // RULE 5: Match score >= 80 AND application readiness < 70
  if (matchScore >= 80 && overallReadiness < 70) {
    return {
      actionType: 'IMPROVE_APPLICATION_READINESS',
      title: 'Tailor Resume & Cover Letter Content',
      description: `Strong job match (${matchScore}%), but application readiness is ${overallReadiness}%. Generating tailored materials will boost screening probability.`,
      priority: 'HIGH',
      confidence: 0.92,
      impact: 'HIGH',
      urgency: 'HIGH',
      reasoning: `Match score is ${matchScore}% (>=80%), but overall readiness score is ${overallReadiness}% (<70%).`,
      evidence: `Match Score: ${matchScore}%, Application Readiness: ${overallReadiness}%.`,
      riskLevel: 'SAFE',
      requiresApproval: false
    };
  }

  // RULE 7: Important skill gaps exist
  if (missingSkills.length >= 2) {
    return {
      actionType: 'ADDRESS_SKILL_GAPS',
      title: 'Address Critical Skill Requirements',
      description: `Target role requires missing key competencies: ${missingSkills.slice(0, 3).join(', ')}.`,
      priority: 'HIGH',
      confidence: 0.88,
      impact: 'HIGH',
      urgency: 'MEDIUM',
      reasoning: `Candidate profile is missing ${missingSkills.length} requested skill requirements for ${opportunity.title}.`,
      evidence: `Missing skill competencies: ${missingSkills.join(', ')}.`,
      riskLevel: 'SAFE',
      requiresApproval: false
    };
  }

  // RULE 8: Readiness >= 85%
  if (overallReadiness >= 85) {
    return {
      actionType: 'PREPARE_FOR_HUMAN_REVIEW',
      title: 'Prepare Application Package for Review',
      description: `Application package for ${opportunity.title} at ${opportunity.company} is ${overallReadiness}% ready with an ATS score of ${atsScore}%.`,
      priority: 'HIGH',
      confidence: 0.96,
      impact: 'HIGH',
      urgency: 'HIGH',
      reasoning: `Overall application readiness score has reached ${overallReadiness}% (>=85%).`,
      evidence: `Overall Readiness: ${overallReadiness}%, ATS Score: ${atsScore}%, Match Score: ${matchScore}%.`,
      riskLevel: 'HIGH_IMPACT',
      requiresApproval: true
    };
  }

  // Default Fallback Decision
  return {
    actionType: 'PREPARE_FOR_HUMAN_REVIEW',
    title: 'Review Application Package',
    description: `Application readiness is ${overallReadiness}%. Review AI generated cover letter and application answers.`,
    priority: 'MEDIUM',
    confidence: 0.85,
    impact: 'MEDIUM',
    urgency: 'MEDIUM',
    reasoning: `Match score is ${matchScore}% and readiness is ${overallReadiness}%.`,
    evidence: `Readiness: ${overallReadiness}%, Match: ${matchScore}%.`,
    riskLevel: 'SAFE',
    requiresApproval: false
  };
};

module.exports = {
  evaluateApplicationDecision
};
