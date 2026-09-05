const User = require('../models/User.model');
const Resume = require('../models/Resume.model');
const Opportunity = require('../models/Opportunity.model');
const Match = require('../models/Match.model');
const Application = require('../models/Application.model');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');
const InterviewSession = require('../models/InterviewSession.model');
const CareerActionPlan = require('../models/CareerActionPlan.model');
const OpportunityMonitor = require('../models/OpportunityMonitor.model');
const CareerAgent = require('../models/CareerAgent.model');
const ApplicationAgentMemory = require('../models/ApplicationAgentMemory.model');
const mongoose = require('mongoose');

/**
 * Application Agent Context Engine
 * Collects normalized candidate, resume, opportunity, match, application, and assistant
 * intelligence into a safe, non-crashing context object strictly scoped to the authenticated user.
 */
const buildApplicationAgentContext = async (userId, opportunityId = null) => {
  if (!userId) {
    throw new Error('UserId is required to build application agent context.');
  }

  // Validate MongoDB ID format safely if provided
  let validOppId = null;
  if (opportunityId) {
    if (mongoose.Types.ObjectId.isValid(opportunityId)) {
      validOppId = opportunityId;
    }
  }

  const [
    user,
    resume,
    matches,
    applications,
    appAssistantRecords,
    interviewSessions,
    careerAgent,
    agentMemories
  ] = await Promise.all([
    User.findById(userId).lean(),
    Resume.findOne({ user: userId }).lean(),
    Match.find({ user: userId }).populate('opportunity').lean(),
    Application.find({ user: userId }).populate('opportunity').lean(),
    ApplicationAssistant.find({ user: userId }).lean(),
    InterviewSession.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
    CareerAgent.findOne({ user: userId }).lean(),
    ApplicationAgentMemory.find({ user: userId }).lean()
  ]);

  if (!user) {
    throw new Error('User not found.');
  }

  // Determine target opportunity safely
  let targetOpportunity = null;
  let targetMatch = null;

  if (validOppId) {
    targetOpportunity = await Opportunity.findById(validOppId).lean();
    targetMatch = matches.find(m => String(m.opportunity?._id || m.opportunity) === String(validOppId)) || null;
  } else if (matches.length > 0) {
    const sortedMatches = [...matches].sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0));
    targetMatch = sortedMatches[0];
    targetOpportunity = targetMatch.opportunity || null;
  }

  // Candidate Profile Normalization
  const profile = user.profile || {};
  const skills = Array.isArray(resume?.extractedData?.skills) && resume.extractedData.skills.length > 0
    ? resume.extractedData.skills
    : Array.isArray(resume?.skills) && resume.skills.length > 0
    ? resume.skills
    : Array.isArray(profile.skills)
    ? profile.skills
    : [];

  const atsScore = Number(resume?.scores?.ats || resume?.atsScore || resume?.score || 0);
  const matchScore = Number(targetMatch?.matchScore || targetMatch?.score || 0);

  // Check if candidate already applied to target opportunity
  const existingApp = targetOpportunity
    ? applications.find(a => String(a.opportunity?._id || a.opportunity) === String(targetOpportunity._id))
    : null;

  // Interview Readiness Score
  const completedInterviews = interviewSessions.filter(s => s.status === 'COMPLETED');
  const interviewReadinessScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, s) => acc + (s.overallScore || s.score || 70), 0) / completedInterviews.length)
    : 70;

  // Application Assistant Metrics
  const latestAppAssistant = appAssistantRecords[0] || null;
  const assistantReadinessScore = latestAppAssistant?.readinessScore || Math.round((atsScore * 0.5) + (matchScore * 0.5));

  // Compute Readiness Breakdown Metrics (strictly 0-100)
  const resumeReadiness = Math.min(100, Math.max(0, atsScore));
  const skillsReadiness = Math.min(100, Math.max(0, skills.length * 12));
  const experienceReadiness = Math.min(100, Math.max(0, (profile.experience?.length || 1) * 25 + 30));
  const projectsReadiness = Math.min(100, Math.max(0, (profile.projects?.length || 1) * 30 + 20));
  const interviewReadiness = Math.min(100, Math.max(0, interviewReadinessScore));

  const overallReadiness = Math.min(100, Math.max(0, Math.round(
    (resumeReadiness * 0.25) +
    (matchScore * 0.25) +
    (skillsReadiness * 0.2) +
    (experienceReadiness * 0.15) +
    (interviewReadiness * 0.15)
  )));

  return {
    userId: String(userId),
    candidate: {
      id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Candidate',
      email: user.email,
      profile,
      skills,
      experience: profile.experience || [],
      projects: profile.projects || [],
      preferences: profile.preferences || {}
    },
    resume: {
      exists: Boolean(resume),
      atsScore,
      skills,
      missingSkills: targetMatch?.missingSkills || []
    },
    opportunity: targetOpportunity
      ? {
          id: String(targetOpportunity._id),
          title: targetOpportunity.title || 'Role Title',
          company: targetOpportunity.company || 'Company Name',
          description: targetOpportunity.description || '',
          requirements: targetOpportunity.requirements || [],
          skills: targetOpportunity.skills || [],
          status: targetOpportunity.status || 'ACTIVE'
        }
      : null,
    match: {
      exists: Boolean(targetMatch),
      score: matchScore,
      strengths: targetMatch?.strengths || [],
      gaps: targetMatch?.missingSkills || []
    },
    applications: {
      alreadyApplied: Boolean(existingApp),
      existingStatus: existingApp?.status || null,
      applicationCount: applications.length,
      relevantHistory: applications.map(a => ({
        id: a._id,
        opportunityId: a.opportunity?._id || a.opportunity,
        company: a.opportunity?.company || 'Company',
        title: a.opportunity?.title || 'Role',
        status: a.status,
        appliedAt: a.createdAt
      }))
    },
    applicationAssistant: {
      readinessScore: assistantReadinessScore,
      strengths: targetMatch?.strengths || [],
      gaps: targetMatch?.missingSkills || []
    },
    interview: {
      readinessScore: interviewReadiness
    },
    careerAgent: {
      status: careerAgent?.status || 'IDLE',
      nextAction: careerAgent?.agentState?.currentAction || 'IMPROVE_RESUME'
    },
    readinessMetrics: {
      overall: overallReadiness,
      resume: resumeReadiness,
      skills: skillsReadiness,
      experience: experienceReadiness,
      projects: projectsReadiness,
      ats: atsScore,
      interview: interviewReadiness
    },
    memories: agentMemories.map(m => ({
      id: String(m._id),
      type: m.type,
      key: m.key,
      value: m.value,
      confidence: m.confidence
    }))
  };
};

module.exports = {
  buildApplicationAgentContext
};
