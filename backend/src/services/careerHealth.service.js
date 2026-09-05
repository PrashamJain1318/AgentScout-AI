const CareerHealth = require('../models/CareerHealth.model');
const { buildUnifiedContext } = require('./careerAgentContext.service');

/**
 * Calculate Unified 7-Category Weighted Career Health Score (0-100)
 */
const calculateCareerHealth = async (userId) => {
  if (!userId) {
    throw new Error('UserId is required to calculate Career Health.');
  }

  const unifiedContext = await buildUnifiedContext(userId);

  const user = unifiedContext.user || {};
  const profile = user.profile || {};
  const resume = unifiedContext.resume || {};
  const applications = Array.isArray(unifiedContext.applications) ? unifiedContext.applications : (unifiedContext.rawApplications || []);
  const matches = Array.isArray(unifiedContext.matches) ? unifiedContext.matches : (unifiedContext.rawMatches || []);
  const interviewSessions = Array.isArray(unifiedContext.interviewSessions) ? unifiedContext.interviewSessions : (unifiedContext.rawInterviewSessions || []);
  const opportunityMonitor = unifiedContext.opportunityMonitor || {};

  // 1. Profile Health Score (10% weight)
  let profileScore = 30;
  if (profile.headline) profileScore += 20;
  if (Array.isArray(profile.skills) && profile.skills.length >= 3) profileScore += 25;
  if (profile.location) profileScore += 15;
  if (Array.isArray(profile.experience) && profile.experience.length > 0) profileScore += 10;
  profileScore = Math.min(100, profileScore);

  // 2. Resume Health Score (20% weight)
  const atsScore = resume.atsScore ?? resume.score ?? (resume.content ? 65 : 25);
  const resumeScore = Math.min(100, Math.max(0, atsScore));

  // 3. Application Health Score (20% weight)
  const appCount = applications.length;
  const activeApps = applications.filter(a => !['Rejected', 'Withdrawn', 'rejected', 'withdrawn'].includes(a.status));
  const interviewApps = applications.filter(a => ['Screening', 'Interviewing', 'interview', 'screening'].includes(a.status));
  let appScore = 20;
  if (appCount > 0) appScore += 30;
  if (activeApps.length > 0) appScore += 25;
  if (interviewApps.length > 0) appScore += 25;
  appScore = Math.min(100, appScore);

  // 4. Skill Health Score (15% weight)
  const candidateSkills = (profile.skills || []).concat(resume.skills || []);
  const skillScore = Math.min(100, Math.max(30, candidateSkills.length * 10 + 30));

  // 5. Interview Health Score (15% weight)
  const completedMocks = interviewSessions.filter(s => s.status === 'completed' || s.status === 'COMPLETED');
  let interviewScore = 40;
  if (completedMocks.length > 0) {
    const avgScore = completedMocks.reduce((sum, s) => sum + (s.overallScore || s.score || 70), 0) / completedMocks.length;
    interviewScore = Math.min(100, Math.round(avgScore * 0.7 + Math.min(completedMocks.length, 5) * 6));
  }

  // 6. Activity Health Score (10% weight)
  const totalActions = appCount + completedMocks.length + (profile.skills?.length || 0);
  const activityScore = Math.min(100, Math.max(35, totalActions * 8 + 35));

  // 7. Opportunity Health Score (10% weight)
  const topMatches = matches.filter(m => (m.matchScore || m.score || 0) >= 75);
  const watchlistCount = opportunityMonitor.watchlistCount || 0;
  const oppScore = Math.min(100, Math.max(40, topMatches.length * 15 + watchlistCount * 10 + 40));

  // Compute Overall Weighted Score
  const overallScore = Math.round(
    profileScore * 0.10 +
    resumeScore * 0.20 +
    appScore * 0.20 +
    skillScore * 0.15 +
    interviewScore * 0.15 +
    activityScore * 0.10 +
    oppScore * 0.10
  );

  // Fetch Latest Historical Snapshot for Trend Analysis
  const previousHealthDoc = await CareerHealth.findOne({ user: userId }).sort({ createdAt: -1 });

  let previousScore = overallScore;
  let change = 0;
  let trend = 'NEW';

  if (previousHealthDoc) {
    previousScore = previousHealthDoc.overallScore;
    change = overallScore - previousScore;
    if (change > 0) {
      trend = 'IMPROVING';
    } else if (change < 0) {
      trend = 'DECLINING';
    } else {
      trend = 'STABLE';
    }
  }

  // Formulate Strengths, Concerns & Actionable Recommendations
  const strengths = [];
  const concerns = [];
  const recommendations = [];

  if (resumeScore >= 75) {
    strengths.push(`Strong ATS Resume score of ${resumeScore}/100.`);
  } else {
    concerns.push(`Resume ATS score is at ${resumeScore}/100, below the optimal 75+ threshold.`);
    recommendations.push({
      title: 'Optimize Resume ATS Score',
      description: 'Refine technical keywords and metrics in Resume Studio to pass automated recruiter screeners.',
      category: 'RESUME',
      priority: 'HIGH',
      deepLink: '/dashboard/resume',
      actionLabel: 'Optimize Resume'
    });
  }

  if (appCount >= 3) {
    strengths.push(`Active application pipeline with ${appCount} logged submission(s).`);
  } else {
    concerns.push('Low application activity logged in your job tracker.');
    recommendations.push({
      title: 'Submit 2 High-Match Applications',
      description: 'Explore your top 80%+ match opportunities and submit tailored applications.',
      category: 'APPLICATION',
      priority: 'HIGH',
      deepLink: '/opportunities',
      actionLabel: 'Browse Opportunities'
    });
  }

  if (completedMocks.length > 0) {
    strengths.push(`Completed ${completedMocks.length} mock interview practice session(s).`);
  } else {
    concerns.push('No AI mock interview practice recorded yet.');
    recommendations.push({
      title: 'Complete First Mock Interview',
      description: 'Test your STAR method responses with the AI Interview Coach before real recruiter rounds.',
      category: 'INTERVIEW',
      priority: 'MEDIUM',
      deepLink: '/dashboard/interview-coach',
      actionLabel: 'Start Practice'
    });
  }

  if (profileScore >= 80) {
    strengths.push('Candidate profile setup is complete and structured.');
  }

  // Store Snapshot if score changed or if > 24 hours since last snapshot
  const isTimeForSnapshot = !previousHealthDoc || (Date.now() - new Date(previousHealthDoc.createdAt).getTime() > 24 * 60 * 60 * 1000);
  const isSignificantChange = previousHealthDoc && Math.abs(change) >= 1;

  if (isTimeForSnapshot || isSignificantChange) {
    await CareerHealth.create({
      user: userId,
      overallScore,
      previousScore,
      change,
      trend,
      breakdown: {
        profile: { score: profileScore, weight: 10 },
        resume: { score: resumeScore, weight: 20 },
        applications: { score: appScore, weight: 20 },
        skills: { score: skillScore, weight: 15 },
        interview: { score: interviewScore, weight: 15 },
        activity: { score: activityScore, weight: 10 },
        opportunities: { score: oppScore, weight: 10 }
      },
      strengths,
      concerns,
      recommendations,
      snapshotDate: new Date()
    });
  }

  return {
    overallScore,
    previousScore,
    change,
    trend,
    breakdown: {
      profile: { score: profileScore, weight: 10 },
      resume: { score: resumeScore, weight: 20 },
      applications: { score: appScore, weight: 20 },
      skills: { score: skillScore, weight: 15 },
      interview: { score: interviewScore, weight: 15 },
      activity: { score: activityScore, weight: 10 },
      opportunities: { score: oppScore, weight: 10 }
    },
    strengths,
    concerns,
    recommendations,
    calculatedAt: new Date()
  };
};

module.exports = {
  calculateCareerHealth
};
