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

/**
 * Application Agent Context Engine
 * Collects candidate profile, resume ATS, target opportunity, AI matches,
 * application history, interview readiness, and learned preferences into a single
 * context object for decision making.
 */
const buildApplicationAgentContext = async (userId, opportunityId = null) => {
  if (!userId) {
    throw new Error('UserId is required to build application agent context.');
  }

  const [
    user,
    resume,
    matches,
    applications,
    appAssistantRecords,
    interviewSessions,
    careerPlan,
    opportunityMonitor,
    careerAgent,
    agentMemories
  ] = await Promise.all([
    User.findById(userId).lean(),
    Resume.findOne({ user: userId }).lean(),
    Match.find({ user: userId }).populate('opportunity').lean(),
    Application.find({ user: userId }).populate('opportunity').lean(),
    ApplicationAssistant.find({ user: userId }).lean(),
    InterviewSession.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
    CareerActionPlan.findOne({ user: userId }).lean(),
    OpportunityMonitor.findOne({ user: userId }).lean(),
    CareerAgent.findOne({ user: userId }).lean(),
    ApplicationAgentMemory.find({ user: userId }).lean()
  ]);

  if (!user) {
    throw new Error('User not found.');
  }

  // Load target opportunity if provided or pick top available match
  let targetOpportunity = null;
  let targetMatch = null;

  if (opportunityId) {
    targetOpportunity = await Opportunity.findById(opportunityId).lean();
    targetMatch = matches.find(m => String(m.opportunity?._id || m.opportunity) === String(opportunityId)) || null;
  } else if (matches.length > 0) {
    const sortedMatches = [...matches].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    targetMatch = sortedMatches[0];
    targetOpportunity = targetMatch.opportunity || null;
  }

  // Normalize candidate profile
  const profile = user.profile || {};
  const skills = Array.isArray(resume?.skills) && resume.skills.length > 0
    ? resume.skills
    : Array.isArray(profile.skills)
    ? profile.skills
    : [];

  const atsScore = resume?.atsScore || resume?.score || 0;
  const matchScore = targetMatch?.matchScore || targetMatch?.score || 0;

  // Calculate Readiness Sub-metrics
  const resumeReadiness = atsScore;
  const skillsReadiness = skills.length > 0 ? Math.min(100, skills.length * 12) : 40;
  const experienceReadiness = Array.isArray(profile.experience) && profile.experience.length > 0
    ? Math.min(100, profile.experience.length * 30 + 40)
    : 50;

  const completedInterviews = interviewSessions.filter(s => s.status === 'COMPLETED');
  const interviewReadinessScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, s) => acc + (s.overallScore || 70), 0) / completedInterviews.length)
    : 65;

  const overallReadiness = Math.round(
    (resumeReadiness * 0.3) +
    (matchScore * 0.3) +
    (skillsReadiness * 0.2) +
    (experienceReadiness * 0.1) +
    (interviewReadinessScore * 0.1)
  );

  // Application History & Duplicate Check
  const existingApp = targetOpportunity
    ? applications.find(a => String(a.opportunity?._id || a.opportunity) === String(targetOpportunity._id))
    : null;

  return {
    userId,
    candidate: {
      id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Candidate',
      email: user.email,
      headline: profile.headline || '',
      location: profile.location || '',
      skills,
      experience: profile.experience || [],
      education: profile.education || [],
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
          id: targetOpportunity._id,
          title: targetOpportunity.title,
          company: targetOpportunity.company,
          location: targetOpportunity.location,
          type: targetOpportunity.type || 'Full-time',
          description: targetOpportunity.description || '',
          requirements: targetOpportunity.requirements || [],
          skills: targetOpportunity.skills || [],
          status: targetOpportunity.status || 'ACTIVE'
        }
      : null,
    match: {
      score: matchScore,
      strengths: targetMatch?.strengths || [],
      gaps: targetMatch?.missingSkills || []
    },
    applicationHistory: applications.map(a => ({
      id: a._id,
      opportunityId: a.opportunity?._id || a.opportunity,
      company: a.opportunity?.company || 'Company',
      title: a.opportunity?.title || 'Role',
      status: a.status,
      appliedAt: a.createdAt
    })),
    duplicateDetected: Boolean(existingApp),
    existingApplicationStatus: existingApp?.status || null,
    interview: {
      readinessScore: interviewReadinessScore
    },
    careerAgent: careerAgent
      ? {
          status: careerAgent.status,
          mode: careerAgent.mode
        }
      : null,
    readinessMetrics: {
      overall: overallReadiness,
      resume: resumeReadiness,
      skills: skillsReadiness,
      experience: experienceReadiness,
      projects: profile.projects?.length ? 85 : 50,
      ats: atsScore,
      interview: interviewReadinessScore
    },
    memories: agentMemories.map(m => ({
      id: m._id,
      category: m.category,
      key: m.key,
      value: m.value,
      confidence: m.confidence
    }))
  };
};

module.exports = {
  buildApplicationAgentContext
};
