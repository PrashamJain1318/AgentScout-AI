const User = require('../models/User.model');
const Application = require('../models/Application.model');
const Opportunity = require('../models/Opportunity.model');
const Match = require('../models/Match.model');
const Resume = require('../models/Resume.model');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');
const InterviewSession = require('../models/InterviewSession.model');
const CareerActionPlan = require('../models/CareerActionPlan.model');
const OpportunityMonitor = require('../models/OpportunityMonitor.model');
const Notification = require('../models/Notification.model');
const CareerOSSnapshot = require('../models/CareerOSSnapshot.model');
const ApplicationAgent = require('../models/ApplicationAgent.model');
const CareerHealth = require('../models/CareerHealth.model');
const CareerEvent = require('../models/CareerEvent.model');

/**
 * Unified Career Context Service
 * Aggregates all candidate career data across modules into a single normalized context object.
 * Always strictly scoped to userId passed from authenticated request (req.user.id).
 */
const buildUnifiedContext = async (userId) => {
  if (!userId) {
    throw new Error('UserId is required to build unified career context.');
  }

  const [
    user,
    resume,
    applications,
    matches,
    interviewSessions,
    careerPlan,
    opportunityMonitor,
    appAssistantRecords,
    latestNotifications,
    latestOSSnapshot,
    applicationAgent,
    latestCareerHealth,
    recentCareerEvents
  ] = await Promise.all([
    User.findById(userId).lean(),
    Resume.findOne({ user: userId }).lean(),
    Application.find({ user: userId }).populate('opportunity').lean(),
    Match.find({ user: userId }).populate('opportunity').lean(),
    InterviewSession.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    CareerActionPlan.findOne({ user: userId }).lean(),
    OpportunityMonitor.findOne({ user: userId }).populate('watchlist.opportunity').lean(),
    ApplicationAssistant.find({ user: userId }).lean(),
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    CareerOSSnapshot.findOne({ user: userId }).sort({ generatedAt: -1 }).lean(),
    ApplicationAgent.findOne({ user: userId }).populate('currentOpportunity').lean(),
    CareerHealth.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
    CareerEvent.find({ user: userId, isArchived: false }).sort({ occurredAt: -1 }).limit(5).lean()
  ]);

  if (!user) {
    throw new Error('User not found.');
  }

  // Calculate Profile Completeness
  const profile = user.profile || {};
  const hasHeadline = Boolean(profile.headline);
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  const hasLocation = Boolean(profile.location);
  const hasExperience = Array.isArray(profile.experience) && profile.experience.length > 0;
  const hasEducation = Array.isArray(profile.education) && profile.education.length > 0;
  const profileCompletion = Math.round(
    ((hasHeadline ? 20 : 0) +
      (hasSkills ? 25 : 0) +
      (hasLocation ? 15 : 0) +
      (hasExperience ? 25 : 0) +
      (hasEducation ? 15 : 0))
  );

  // Resume Intelligence Normalization
  const resumeATSScore = resume?.atsScore || resume?.score || 0;
  const resumeCompleteness = resume?.completeness || (resume ? 80 : 0);
  const extractedSkills = Array.isArray(resume?.skills)
    ? resume.skills
    : Array.isArray(profile.skills)
    ? profile.skills
    : [];

  // Application Pipeline Metrics
  const totalApplications = applications.length;
  const activeApplications = applications.filter(a => !['Rejected', 'Withdrawn'].includes(a.status));
  const interviewApplications = applications.filter(a => ['Screening', 'Interviewing'].includes(a.status));
  const offerApplications = applications.filter(a => a.status === 'Offer Received');
  const rejectedApplications = applications.filter(a => a.status === 'Rejected');
  const responseRate = totalApplications > 0
    ? Math.round(((interviewApplications.length + offerApplications.length) / totalApplications) * 100)
    : 0;

  const applicationReadiness = Math.min(
    100,
    Math.round(
      (profileCompletion * 0.3) +
      (resumeATSScore * 0.4) +
      (extractedSkills.length > 3 ? 30 : extractedSkills.length * 10)
    )
  );

  // Match Intelligence
  const highQualityMatches = matches.filter(m => (m.matchScore || m.score || 0) >= 80);
  const averageMatchScore = matches.length > 0
    ? Math.round(matches.reduce((acc, m) => acc + (m.matchScore || m.score || 0), 0) / matches.length)
    : 0;

  // Interview Readiness Metrics
  const completedMocks = interviewSessions.filter(s => s.status === 'COMPLETED');
  const latestMock = completedMocks[0] || null;
  const latestMockScore = latestMock?.overallScore || latestMock?.score || 0;
  const averageMockScore = completedMocks.length > 0
    ? Math.round(completedMocks.reduce((acc, s) => acc + (s.overallScore || s.score || 0), 0) / completedMocks.length)
    : 0;
  const interviewReadiness = completedMocks.length > 0
    ? Math.round((averageMockScore * 0.7) + (Math.min(completedMocks.length, 5) * 6))
    : 0;

  // Skill Gaps & Strengths
  const candidateSkillsLower = new Set(extractedSkills.map(s => String(s).toLowerCase()));
  const targetMarketSkills = ['react', 'node.js', 'typescript', 'docker', 'mongodb', 'aws', 'python', 'graphql', 'system design'];
  const marketStrengths = targetMarketSkills.filter(s => candidateSkillsLower.has(s)).map(s => s.charAt(0).toUpperCase() + s.slice(1));
  const marketGaps = targetMarketSkills.filter(s => !candidateSkillsLower.has(s)).map(s => s.charAt(0).toUpperCase() + s.slice(1));

  // Career Composite Health Score
  const overallReadiness = Math.round(
    (profileCompletion * 0.2) +
    (resumeATSScore * 0.25) +
    (applicationReadiness * 0.2) +
    (interviewReadiness * 0.2) +
    (Math.min(totalApplications, 10) * 1.5)
  );

  return {
    userId,
    candidate: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || ''
    },
    goals: {
      currentGoal: 'Maximize hiring probability for target software engineering roles',
      desiredRoles: profile.preferences?.desiredRoles || ['Software Engineer'],
      preferredLocations: profile.preferences?.preferredLocations || ['Remote'],
      workModes: profile.preferences?.workModes || ['Remote', 'Hybrid']
    },
    preferences: user.profile?.preferences || {},
    profile: {
      completion: profileCompletion,
      headline: profile.headline || '',
      location: profile.location || '',
      experienceCount: (profile.experience || []).length,
      educationCount: (profile.education || []).length
    },
    resume: {
      exists: Boolean(resume),
      atsScore: resumeATSScore,
      completeness: resumeCompleteness,
      skillsCount: extractedSkills.length,
      updatedAt: resume?.updatedAt || null
    },
    portfolio: {
      github: profile.github || '',
      linkedin: profile.linkedin || '',
      projectsCount: (profile.projects || []).length
    },
    skills: {
      list: extractedSkills,
      strengths: marketStrengths,
      criticalGaps: marketGaps.slice(0, 4),
      coverageScore: Math.round((marketStrengths.length / targetMarketSkills.length) * 100)
    },
    opportunities: {
      monitoredCount: opportunityMonitor?.watchlist?.length || 0,
      matchesCount: matches.length,
      highQualityCount: highQualityMatches.length,
      topMatches: highQualityMatches.slice(0, 3).map(m => ({
        id: m.opportunity?._id || m._id,
        title: m.opportunity?.title || 'Software Engineer',
        company: m.opportunity?.company || 'Target Company',
        matchScore: m.matchScore || m.score || 85
      }))
    },
    rawMatches: matches,
    rawApplications: applications,
    rawInterviewSessions: interviewSessions,
    matches: {
      total: matches.length,
      averageScore: averageMatchScore
    },
    applications: {
      total: totalApplications,
      active: activeApplications.length,
      interviews: interviewApplications.length,
      offers: offerApplications.length,
      rejected: rejectedApplications.length,
      responseRate
    },
    applicationReadiness,
    interviewReadiness,
    careerPlan: {
      exists: Boolean(careerPlan),
      completedTasks: careerPlan?.dailyTasks?.filter(t => t.completed)?.length || 0,
      totalTasks: careerPlan?.dailyTasks?.length || 0
    },
    opportunityMonitor: {
      active: Boolean(opportunityMonitor),
      watchlistCount: opportunityMonitor?.watchlist?.length || 0
    },
    analytics: {
      careerScore: overallReadiness,
      momentumTrend: overallReadiness >= 75 ? 'UP' : overallReadiness >= 50 ? 'STABLE' : 'DOWN'
    },
    recentActivity: latestNotifications.map(n => ({
      title: n.title,
      description: n.message,
      timestamp: n.createdAt
    })),
    notifications: latestNotifications,
    milestones: [
      { id: 'profile', title: 'Complete Candidate Profile', target: 100, current: profileCompletion, percentage: profileCompletion, completed: profileCompletion >= 90 },
      { id: 'resume', title: 'Optimize Resume ATS Score', target: 80, current: resumeATSScore, percentage: Math.min(100, Math.round((resumeATSScore / 80) * 100)), completed: resumeATSScore >= 80 },
      { id: 'applications', title: 'Submit 5 Active Applications', target: 5, current: totalApplications, percentage: Math.min(100, Math.round((totalApplications / 5) * 100)), completed: totalApplications >= 5 },
      { id: 'interview', title: 'Achieve 75% Interview Readiness', target: 75, current: interviewReadiness, percentage: Math.min(100, Math.round((interviewReadiness / 75) * 100)), completed: interviewReadiness >= 75 }
    ],
    risks: [
      ...(resumeATSScore < 70 ? [{ severity: 'CRITICAL', title: 'Low Resume ATS Score', explanation: `Your ATS score is ${resumeATSScore}%, below the 70% threshold required to pass recruiter screening.`, recommendation: 'Use Resume Intelligence to rewrite key experience achievements.', deepLink: '/dashboard/resume' }] : []),
      ...(interviewReadiness < 65 ? [{ severity: 'HIGH', title: 'Interview Practice Needed', explanation: `Interview readiness is ${interviewReadiness}%. Practice technical questions to avoid dropping early rounds.`, recommendation: 'Complete 1-2 AI Mock Interviews.', deepLink: '/dashboard/interview-coach' }] : []),
      ...(totalApplications === 0 ? [{ severity: 'MEDIUM', title: 'Empty Application Pipeline', explanation: 'No active job applications submitted yet.', recommendation: 'Select high-match opportunities and apply.', deepLink: '/dashboard/opportunities' }] : [])
    ],
    strengths: marketStrengths,
    gaps: marketGaps,
    applicationAgent: applicationAgent ? {
      status: applicationAgent.status,
      mode: applicationAgent.mode,
      readiness: applicationAgent.readinessMetrics?.overall || 75,
      currentOpportunity: applicationAgent.currentOpportunity ? {
        id: applicationAgent.currentOpportunity._id,
        title: applicationAgent.currentOpportunity.title,
        company: applicationAgent.currentOpportunity.company
      } : null,
      nextAction: applicationAgent.readinessMetrics?.overall < 80 ? 'Optimize Resume for target role' : 'Review application package'
    } : {
      status: 'IDLE',
      mode: 'ASSISTED',
      readiness: 75,
      currentOpportunity: null,
      nextAction: 'Select a target opportunity to start Application Agent'
    },
    careerHealth: latestCareerHealth ? {
      overallScore: latestCareerHealth.overallScore,
      previousScore: latestCareerHealth.previousScore,
      change: latestCareerHealth.change,
      trend: latestCareerHealth.trend,
      breakdown: latestCareerHealth.breakdown
    } : {
      overallScore: 70,
      previousScore: 70,
      change: 0,
      trend: 'STABLE'
    },
    recentCareerEvents: recentCareerEvents.map(e => ({
      id: e._id,
      eventType: e.eventType,
      title: e.title,
      description: e.description,
      priority: e.priority,
      occurredAt: e.occurredAt
    }))
  };
};

module.exports = {
  buildUnifiedContext
};
