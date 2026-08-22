const mongoose = require('mongoose');
const CareerOSSnapshot = require('../models/CareerOSSnapshot.model');
const User = require('../models/User.model');
const Resume = require('../models/Resume.model');
const Opportunity = require('../models/Opportunity.model');
const Match = require('../models/Match.model');
const Application = require('../models/Application.model');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');
const InterviewSession = require('../models/InterviewSession.model');
const CareerActionPlan = require('../models/CareerActionPlan.model');
const OpportunityMonitor = require('../models/OpportunityMonitor.model');
const OpportunityObservation = require('../models/OpportunityObservation.model');
const Notification = require('../models/Notification.model');
const settingsService = require('./settings.service');

const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

/**
 * Build unified candidate raw platform state.
 */
const buildRawPlatformState = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [
    user,
    resume,
    matches,
    applications,
    opportunities,
    assistants,
    interviews,
    actionPlan,
    monitor,
    observations,
    notifications,
    settingsData
  ] = await Promise.all([
    User.findById(userId),
    Resume.findOne({ user: userObjectId }),
    Match.find({ user: userObjectId }).populate('opportunity', 'title company location requirements type'),
    Application.find({ user: userObjectId }),
    Opportunity.find({ isActive: true }).sort({ postedAt: -1 }).limit(20),
    ApplicationAssistant.find({ user: userObjectId }),
    InterviewSession.find({ user: userObjectId, status: 'completed' }).sort({ createdAt: -1 }),
    CareerActionPlan.findOne({ user: userObjectId }).sort({ createdAt: -1 }),
    OpportunityMonitor.findOne({ user: userObjectId }),
    OpportunityObservation.find({ user: userObjectId, dismissed: false }).populate('opportunity'),
    Notification.find({ user: userObjectId }).sort({ createdAt: -1 }).limit(10),
    settingsService.getSettings(userId).catch(() => null)
  ]);

  const profile = user ? (user.profile || {}) : {};
  const candidateSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const resumeSkills = Array.isArray(resume?.extractedData?.skills) ? resume.extractedData.skills : [];
  const allSkills = Array.from(new Set([...candidateSkills, ...resumeSkills]));

  // Profile Readiness (0-100)
  let profileScore = 0;
  if (user?.firstName) profileScore += 15;
  if (user?.lastName) profileScore += 15;
  if (user?.email) profileScore += 20;
  if (profile.headline || profile.targetRole) profileScore += 20;
  if (candidateSkills.length > 0) profileScore += 15;
  if (profile.location) profileScore += 15;
  profileScore = Math.min(100, profileScore);

  // Resume Score (0-100)
  const resumeAtsScore = resume?.scores?.ats || 0;
  const resumeCompleteness = resume?.scores?.completeness || (resume ? 75 : 0);
  const resumeSkillsCoverage = resume?.scores?.skillsCoverage || (resume ? 70 : 0);
  const resumeQuality = resumeAtsScore > 0 ? resumeAtsScore : (resume ? 65 : 0);

  // Opportunity Fit (0-100)
  const totalMatches = matches.length;
  const excellentMatches = matches.filter(m => (m.score >= 90 || m.matchLevel === 'excellent'));
  const strongMatches = matches.filter(m => (m.score >= 75 && m.score < 90));
  const avgMatchScore = totalMatches > 0 ? Math.round(matches.reduce((a, m) => a + (m.score || 0), 0) / totalMatches) : 70;

  // Skill Gaps & Coverage
  const missingSkillCounts = {};
  matches.forEach(m => {
    if (Array.isArray(m.missingSkills)) {
      m.missingSkills.forEach(s => {
        const clean = String(s).trim();
        if (clean) missingSkillCounts[clean] = (missingSkillCounts[clean] || 0) + 1;
      });
    }
  });
  const criticalGaps = Object.keys(missingSkillCounts).sort((a, b) => missingSkillCounts[b] - missingSkillCounts[a]).slice(0, 5);
  const skillCoverage = allSkills.length > 0 ? Math.min(100, Math.round((allSkills.length / (allSkills.length + criticalGaps.length || 1)) * 100)) : 40;

  // Application Pipeline Metrics
  const totalApps = applications.length;
  const activeApps = applications.filter(a => a.status === 'applied' || a.status === 'screening' || a.status === 'interview').length;
  const interviewApps = applications.filter(a => a.status === 'interview' || a.status === 'screening').length;
  const offerApps = applications.filter(a => a.status === 'offer' || a.status === 'accepted').length;
  const rejectedApps = applications.filter(a => a.status === 'rejected').length;
  const responseRate = totalApps > 0 ? Math.round(((interviewApps + offerApps) / totalApps) * 100) : 0;
  const appPipelineScore = Math.min(100, (totalApps * 15) + (interviewApps * 20) + (offerApps * 25));

  // Interview Readiness Score (0-100)
  const mockAttempts = interviews.length;
  const latestMockScore = mockAttempts > 0 ? (interviews[0].overallScore || 0) : 0;
  const interviewReadinessScore = mockAttempts > 0
    ? Math.round(interviews.reduce((a, s) => a + (s.readinessScore || 0), 0) / mockAttempts)
    : 70;

  // Portfolio Strength (0-100)
  const hasPortfolioUrl = Boolean(profile.portfolioUrl || resume?.portfolio?.portfolioUrl);
  const hasGithubUrl = Boolean(profile.githubUrl || resume?.portfolio?.githubUrl);
  const portfolioScore = (hasPortfolioUrl ? 50 : 0) + (hasGithubUrl ? 50 : 0);

  return {
    user,
    profileScore,
    resumeAtsScore,
    resumeCompleteness,
    resumeSkillsCoverage,
    resumeQuality,
    avgMatchScore,
    totalMatches,
    excellentMatchesCount: excellentMatches.length,
    strongMatchesCount: strongMatches.length,
    allSkills,
    criticalGaps,
    skillCoverage,
    totalApps,
    activeApps,
    interviewApps,
    offerApps,
    rejectedApps,
    responseRate,
    appPipelineScore,
    mockAttempts,
    latestMockScore,
    interviewReadinessScore,
    portfolioScore,
    hasPortfolioUrl,
    hasGithubUrl,
    actionPlan,
    monitor,
    observations,
    notifications,
    assistants,
    settingsData,
    opportunities
  };
};

/**
 * Deterministic Weighted Career Score (0-100).
 */
const calculateCareerScore = (state) => {
  const breakdown = {
    profile: Math.min(100, Math.max(0, state.profileScore)),
    resume: Math.min(100, Math.max(0, state.resumeQuality)),
    opportunityFit: Math.min(100, Math.max(0, state.avgMatchScore)),
    applications: Math.min(100, Math.max(0, state.appPipelineScore)),
    interview: Math.min(100, Math.max(0, state.interviewReadinessScore)),
    skills: Math.min(100, Math.max(0, state.skillCoverage)),
    portfolio: Math.min(100, Math.max(0, state.portfolioScore))
  };

  const weightedScore = Math.round(
    (breakdown.profile * 0.10) +
    (breakdown.resume * 0.15) +
    (breakdown.opportunityFit * 0.20) +
    (breakdown.applications * 0.15) +
    (breakdown.interview * 0.15) +
    (breakdown.skills * 0.15) +
    (breakdown.portfolio * 0.10)
  );

  return {
    careerScore: Math.min(100, Math.max(0, weightedScore)),
    breakdown
  };
};

/**
 * Deterministic Career Stage Detection.
 */
const detectCareerStage = (state) => {
  if (state.profileScore < 70) return 'PROFILE_BUILDING';
  if (state.resumeAtsScore > 0 && state.resumeAtsScore < 70) return 'RESUME_OPTIMIZATION';
  if (state.offerApps > 0) return 'OFFER_READY';
  if (state.interviewApps > 0 || (state.totalApps > 0 && state.interviewReadinessScore < 75)) return 'INTERVIEW_PREPARATION';
  if (state.totalApps > 0) return 'ACTIVE_APPLICATION';
  if (state.excellentMatchesCount > 0) return 'APPLICATION_READY';
  if (state.totalMatches > 0) return 'JOB_DISCOVERY';
  return 'CAREER_ACCELERATION';
};

/**
 * Deterministic Career Risk Engine.
 */
const detectCareerRisks = (state) => {
  const risks = [];

  if (state.profileScore < 70) {
    risks.push({
      type: 'PROFILE_INCOMPLETE',
      severity: 'HIGH',
      title: 'Incomplete Candidate Profile',
      explanation: `Your profile completion is at ${state.profileScore}%. Missing target role and skills matrix reduces AI matching accuracy.`,
      recommendation: 'Add missing target roles and technical skills to your candidate profile.',
      deepLink: '/dashboard/profile'
    });
  }

  if (state.resumeAtsScore > 0 && state.resumeAtsScore < 70) {
    risks.push({
      type: 'RESUME_ATS_BELOW_TARGET',
      severity: 'CRITICAL',
      title: `Resume ATS Score Below Threshold (${state.resumeAtsScore}%)`,
      explanation: 'Your current resume ATS score is below 70%, which causes automated recruiter screening software to filter out applications.',
      recommendation: 'Incorporate quantifiable achievement metrics and missing skills in your resume.',
      deepLink: '/dashboard/resume'
    });
  }

  if (state.excellentMatchesCount > 0 && state.totalApps === 0) {
    risks.push({
      type: 'UNSUBMITTED_EXCELLENT_MATCHES',
      severity: 'HIGH',
      title: `${state.excellentMatchesCount} Unsubmitted 90%+ AI Opportunity Matches`,
      explanation: 'You have high-quality 90%+ AI matched roles available but zero submitted applications.',
      recommendation: 'Use AI Application Assistant to generate tailored cover letters and submit applications.',
      deepLink: '/dashboard/opportunity-monitor'
    });
  }

  if (state.totalApps >= 5 && state.responseRate === 0) {
    risks.push({
      type: 'LOW_INTERVIEW_CONVERSION',
      severity: 'HIGH',
      title: 'Low Application-to-Interview Conversion',
      explanation: `You have submitted ${state.totalApps} applications with a 0% recruiter screening conversion rate.`,
      recommendation: 'Tailor your application assets for each role using Application Assistant before applying.',
      deepLink: '/dashboard/application-assistant'
    });
  }

  if (state.criticalGaps.length > 0) {
    risks.push({
      type: 'CRITICAL_SKILL_GAPS',
      severity: 'MEDIUM',
      title: `Recurring Market Skill Gap: ${state.criticalGaps[0]}`,
      explanation: `${state.criticalGaps[0]} is required by multiple active target opportunities in your pipeline.`,
      recommendation: `Study core fundamentals of ${state.criticalGaps[0]} and feature evidence on your profile.`,
      deepLink: '/dashboard/career-copilot'
    });
  }

  if (state.totalApps > 0 && state.interviewReadinessScore < 70) {
    risks.push({
      type: 'LOW_INTERVIEW_READINESS',
      severity: 'MEDIUM',
      title: `Interview Readiness Score (${state.interviewReadinessScore}%) Needs Practice`,
      explanation: 'You have active applications submitted, but your mock interview readiness score is below competitive standard.',
      recommendation: 'Complete a role-specific mock session using the AI Interview Coach.',
      deepLink: '/dashboard/interview-coach'
    });
  }

  return risks;
};

/**
 * Career Momentum Engine (0-100 + Trend).
 */
const calculateCareerMomentum = (state) => {
  const activeCount = state.totalApps + state.mockAttempts + (state.actionPlan?.dailyActions?.length || 0);
  const score = Math.min(100, Math.max(30, 50 + (activeCount * 8)));
  const trend = activeCount >= 4 ? 'UP' : activeCount >= 2 ? 'STABLE' : 'DOWN';

  return {
    score,
    trend,
    changePercentage: activeCount >= 4 ? 25 : activeCount >= 2 ? 0 : -15
  };
};

/**
 * Aggregates Recent Platform Changes Timeline.
 */
const aggregateRecentChanges = (state) => {
  const changes = [];

  if (state.notifications && state.notifications.length > 0) {
    state.notifications.slice(0, 5).forEach(n => {
      changes.push({
        type: n.type || 'notification',
        title: n.title,
        description: n.message,
        timestamp: n.createdAt || new Date(),
        icon: n.type === 'excellent_match' ? 'sparkles' : 'bell'
      });
    });
  }

  if (changes.length === 0) {
    changes.push({
      type: 'system',
      title: 'AgentScout Monitoring Active',
      description: 'Career Operating System is actively monitoring target opportunities and application progress.',
      timestamp: new Date(),
      icon: 'activity'
    });
  }

  return changes;
};

/**
 * Generate Next Best Action and Recommendations.
 */
const determineActionsAndRecommendations = (state, risks) => {
  const recommendations = [];
  let nextBestAction = null;

  if (risks.length > 0) {
    const topRisk = risks[0];
    nextBestAction = {
      title: topRisk.title,
      description: topRisk.explanation,
      category: topRisk.type.toLowerCase(),
      priority: topRisk.severity === 'CRITICAL' ? 'critical' : 'high',
      impact: 'high',
      deepLink: topRisk.deepLink,
      reason: topRisk.explanation
    };
  } else if (state.actionPlan?.nextBestAction) {
    nextBestAction = state.actionPlan.nextBestAction;
  } else {
    nextBestAction = {
      title: 'Explore High Match Opportunities',
      description: 'Review top 90%+ AI opportunity matches and prepare application materials.',
      category: 'job_search',
      priority: 'high',
      impact: 'high',
      deepLink: '/dashboard/opportunity-monitor',
      reason: 'Applying to high-match roles yields highest recruiter response rates.'
    };
  }

  recommendations.push({
    title: nextBestAction.title,
    reason: nextBestAction.reason || nextBestAction.description,
    impact: nextBestAction.impact || 'high',
    priority: nextBestAction.priority || 'high',
    deepLink: nextBestAction.deepLink || '/dashboard',
    isNextBestAction: true
  });

  if (state.resumeAtsScore > 0 && state.resumeAtsScore < 80) {
    recommendations.push({
      title: `Boost Resume ATS Score to 80%+ (Current: ${state.resumeAtsScore}%)`,
      reason: 'Higher ATS alignment improves recruiter interview callbacks.',
      impact: 'high',
      priority: 'high',
      deepLink: '/dashboard/resume',
      isNextBestAction: false
    });
  }

  if (state.criticalGaps.length > 0) {
    recommendations.push({
      title: `Develop Market Skill: ${state.criticalGaps[0]}`,
      reason: `Required by multiple active job postings matching your headline.`,
      impact: 'medium',
      priority: 'medium',
      deepLink: '/dashboard/career-copilot',
      isNextBestAction: false
    });
  }

  if (state.mockAttempts === 0) {
    recommendations.push({
      title: 'Complete First AI Technical Mock Interview',
      reason: 'Mock practice increases technical assessment confidence.',
      impact: 'high',
      priority: 'high',
      deepLink: '/dashboard/interview-coach',
      isNextBestAction: false
    });
  }

  return { nextBestAction, recommendations };
};

/**
 * Generate or retrieve current Career OS Snapshot.
 */
const generateSnapshot = async (userId, refresh = false) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let snapshot = await CareerOSSnapshot.findOne({ user: userObjectId, generatedAt: { $gte: startOfToday } }).sort({ generatedAt: -1 });

  if (!snapshot || refresh) {
    const state = await buildRawPlatformState(userId);
    const scoreData = calculateCareerScore(state);
    const stage = detectCareerStage(state);
    const risks = detectCareerRisks(state);
    const momentum = calculateCareerMomentum(state);
    const recentChanges = aggregateRecentChanges(state);
    const { nextBestAction, recommendations } = determineActionsAndRecommendations(state, risks);

    // Milestones tracking
    const milestones = [
      { id: 'm_profile', title: 'Profile 100% Complete', target: 100, current: state.profileScore, unit: '%', percentage: state.profileScore, completed: state.profileScore >= 100 },
      { id: 'm_resume', title: 'Resume ATS Score > 80%', target: 80, current: state.resumeAtsScore, unit: '%', percentage: Math.min(100, Math.round((state.resumeAtsScore / 80) * 100)), completed: state.resumeAtsScore >= 80 },
      { id: 'm_apps', title: '5+ Submitted Applications', target: 5, current: state.totalApps, unit: 'apps', percentage: Math.min(100, Math.round((state.totalApps / 5) * 100)), completed: state.totalApps >= 5 },
      { id: 'm_interview', title: 'Interview Readiness > 80%', target: 80, current: state.interviewReadinessScore, unit: '%', percentage: Math.min(100, Math.round((state.interviewReadinessScore / 80) * 100)), completed: state.interviewReadinessScore >= 80 }
    ];

    let aiSummary = `You are currently in the ${stage.replace(/_/g, ' ')} stage with a Career Score of ${scoreData.careerScore}/100. Your single highest-impact priority today is: "${nextBestAction.title}".`;
    let aiReasoning = nextBestAction.reason || `Based on platform context evaluation across your candidate profile, ATS score, and pipeline velocity.`;

    if (isGeminiConfigured()) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const prompt = `Write a concise 2-sentence executive career briefing for candidate ${state.user?.firstName || 'Candidate'}.
        CAREER STAGE: ${stage}
        CAREER SCORE: ${scoreData.careerScore}/100
        NEXT BEST ACTION: ${nextBestAction.title}
        REASON: ${nextBestAction.reason}
        
        Keep text highly practical, clear, and encouraging.`;

        const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } };
        const aiRes = await makeGeminiHttpRequest(apiKey, payload, 8000);
        if (aiRes.statusCode >= 200 && aiRes.statusCode < 300 && aiRes.data) {
          const text = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) aiSummary = text.trim();
        }
      } catch (err) {
        // Fallback
      }
    }

    if (!snapshot) {
      snapshot = new CareerOSSnapshot({
        user: userObjectId,
        generatedAt: new Date(),
        version: '1.0.0',
        careerScore: scoreData.careerScore,
        careerStage: stage,
        readiness: scoreData.breakdown,
        opportunityState: {
          discovered: state.totalMatches,
          excellent: state.excellentMatchesCount,
          strong: state.strongMatchesCount,
          readyToApply: state.excellentMatchesCount,
          watchlist: state.observations.filter(o => o.saved).length
        },
        applicationState: {
          total: state.totalApps,
          active: state.activeApps,
          interviews: state.interviewApps,
          offers: state.offerApps,
          rejected: state.rejectedApps,
          responseRate: state.responseRate,
          pipelineVelocity: state.totalApps
        },
        skillState: {
          strengths: state.allSkills.slice(0, 5),
          criticalGaps: state.criticalGaps,
          emergingGaps: state.criticalGaps.slice(2, 5),
          coverageScore: state.skillCoverage
        },
        interviewState: {
          readinessScore: state.interviewReadinessScore,
          latestScore: state.latestMockScore,
          attempts: state.mockAttempts,
          weakCategories: ['System Architecture', 'STAR Method Behavioral']
        },
        resumeState: {
          atsScore: state.resumeAtsScore,
          completeness: state.resumeCompleteness,
          impact: state.resumeQuality,
          skillsCoverage: state.resumeSkillsCoverage
        },
        actionState: {
          completionRate: state.actionPlan?.completionPercentage || 0,
          pending: (state.actionPlan?.dailyActions || []).filter(a => a.status === 'pending').length,
          completed: (state.actionPlan?.dailyActions || []).filter(a => a.status === 'completed').length,
          nextBestAction
        },
        riskState: risks,
        momentum,
        milestones,
        recentChanges,
        recommendations,
        aiSummary,
        aiReasoning,
        lastUpdatedAt: new Date()
      });
    } else {
      snapshot.careerScore = scoreData.careerScore;
      snapshot.careerStage = stage;
      snapshot.readiness = scoreData.breakdown;
      snapshot.opportunityState = {
        discovered: state.totalMatches,
        excellent: state.excellentMatchesCount,
        strong: state.strongMatchesCount,
        readyToApply: state.excellentMatchesCount,
        watchlist: state.observations.filter(o => o.saved).length
      };
      snapshot.applicationState = {
        total: state.totalApps,
        active: state.activeApps,
        interviews: state.interviewApps,
        offers: state.offerApps,
        rejected: state.rejectedApps,
        responseRate: state.responseRate,
        pipelineVelocity: state.totalApps
      };
      snapshot.skillState = {
        strengths: state.allSkills.slice(0, 5),
        criticalGaps: state.criticalGaps,
        emergingGaps: state.criticalGaps.slice(2, 5),
        coverageScore: state.skillCoverage
      };
      snapshot.interviewState = {
        readinessScore: state.interviewReadinessScore,
        latestScore: state.latestMockScore,
        attempts: state.mockAttempts,
        weakCategories: ['System Architecture', 'STAR Method Behavioral']
      };
      snapshot.resumeState = {
        atsScore: state.resumeAtsScore,
        completeness: state.resumeCompleteness,
        impact: state.resumeQuality,
        skillsCoverage: state.resumeSkillsCoverage
      };
      snapshot.actionState = {
        completionRate: state.actionPlan?.completionPercentage || 0,
        pending: (state.actionPlan?.dailyActions || []).filter(a => a.status === 'pending').length,
        completed: (state.actionPlan?.dailyActions || []).filter(a => a.status === 'completed').length,
        nextBestAction
      };
      snapshot.riskState = risks;
      snapshot.momentum = momentum;
      snapshot.milestones = milestones;
      snapshot.recentChanges = recentChanges;
      snapshot.recommendations = recommendations;
      snapshot.aiSummary = aiSummary;
      snapshot.aiReasoning = aiReasoning;
      snapshot.lastUpdatedAt = new Date();
    }

    await snapshot.save();
  }

  return snapshot;
};

/**
 * Specific granular API handlers.
 */
const getSnapshot = async (userId) => generateSnapshot(userId);
const rebuildSnapshot = async (userId) => generateSnapshot(userId, true);

const getScore = async (userId) => {
  const snapshot = await generateSnapshot(userId);
  return {
    careerScore: snapshot.careerScore,
    breakdown: snapshot.readiness
  };
};

const getReadiness = async (userId) => {
  const snapshot = await generateSnapshot(userId);
  return snapshot.readiness;
};

const getNextAction = async (userId) => {
  const snapshot = await generateSnapshot(userId);
  return snapshot.actionState.nextBestAction;
};

const getRisks = async (userId) => {
  const snapshot = await generateSnapshot(userId);
  return snapshot.riskState;
};

const getMomentum = async (userId) => {
  const snapshot = await generateSnapshot(userId);
  return snapshot.momentum;
};

const getChanges = async (userId) => {
  const snapshot = await generateSnapshot(userId);
  return snapshot.recentChanges;
};

const getOpportunities = async (userId) => {
  const state = await buildRawPlatformState(userId);
  return state.opportunities;
};

const getBriefing = async (userId) => {
  const snapshot = await generateSnapshot(userId);
  return {
    summary: snapshot.aiSummary,
    reasoning: snapshot.aiReasoning,
    stage: snapshot.careerStage,
    score: snapshot.careerScore
  };
};

const getMilestones = async (userId) => {
  const snapshot = await generateSnapshot(userId);
  return snapshot.milestones;
};

module.exports = {
  buildRawPlatformState,
  calculateCareerScore,
  detectCareerStage,
  detectCareerRisks,
  generateSnapshot,
  rebuildSnapshot,
  getSnapshot,
  getScore,
  getReadiness,
  getNextAction,
  getRisks,
  getMomentum,
  getChanges,
  getOpportunities,
  getBriefing,
  getMilestones
};
