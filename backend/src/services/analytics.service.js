const mongoose = require('mongoose');
const User = require('../models/User.model');
const Application = require('../models/Application.model');
const Match = require('../models/Match.model');
const Notification = require('../models/Notification.model');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Calculate dynamic Profile Completion Percentage (0-100%)
 */
const calculateProfileCompletion = (user) => {
  if (!user) return 0;
  let score = 0;
  if (user.firstName) score += 15;
  if (user.lastName) score += 15;
  if (user.email) score += 20;

  const p = user.profile || {};
  if (p.headline || p.targetRole) score += 20;
  if (Array.isArray(p.skills) && p.skills.length > 0) score += 15;
  if (p.location) score += 15;

  return Math.min(100, score);
};

/**
 * GET /api/analytics/overview
 */
const getOverviewAnalytics = async (userId) => {
  if (!isValidObjectId(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [user, applications, matches, assistantRecords] = await Promise.all([
    User.findById(userId),
    Application.find({ user: userObjectId }),
    Match.find({ user: userObjectId }),
    ApplicationAssistant.find({ user: userObjectId })
  ]);

  const totalApplications = applications.length;
  const activeApplications = applications.filter(a => ['saved', 'applied', 'screening', 'interview'].includes(a.status)).length;
  const interviews = applications.filter(a => a.status === 'interview').length;
  const offers = applications.filter(a => a.status === 'offer').length;
  const accepted = applications.filter(a => a.status === 'accepted').length;
  const rejected = applications.filter(a => a.status === 'rejected').length;

  const applicationsThisWeek = applications.filter(a => a.createdAt >= sevenDaysAgo).length;
  const applicationsThisMonth = applications.filter(a => a.createdAt >= thirtyDaysAgo).length;

  const totalMatches = matches.length;
  const excellentMatches = matches.filter(m => (m.score >= 90 || m.matchLevel === 'excellent')).length;
  const strongMatches = matches.filter(m => (m.score >= 75 && m.score < 90)).length;

  const totalScoreSum = matches.reduce((acc, m) => acc + (m.score || 0), 0);
  const averageMatchScore = totalMatches > 0 ? Math.round(totalScoreSum / totalMatches) : 0;
  const profileCompletion = calculateProfileCompletion(user);

  const applicationsPrepared = assistantRecords.length;
  const averageReadinessScore = applicationsPrepared > 0
    ? Math.round(assistantRecords.reduce((acc, a) => acc + (a.readinessScore || 0), 0) / applicationsPrepared)
    : 0;

  return {
    totalApplications,
    activeApplications,
    interviews,
    offers,
    accepted,
    rejected,
    totalMatches,
    excellentMatches,
    strongMatches,
    averageMatchScore,
    profileCompletion,
    applicationsThisWeek,
    applicationsThisMonth,
    applicationsPrepared,
    averageReadinessScore
  };
};

/**
 * GET /api/analytics/applications
 */
const getApplicationAnalyticsFull = async (userId) => {
  if (!isValidObjectId(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const applications = await Application.find({ user: userObjectId })
    .sort({ createdAt: -1 })
    .populate('opportunity', 'title company location type');

  const total = applications.length;

  const statuses = {
    saved: 0,
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  };

  applications.forEach(a => {
    if (statuses[a.status] !== undefined) {
      statuses[a.status]++;
    }
  });

  const appliedCount = statuses.applied + statuses.screening + statuses.interview + statuses.offer + statuses.accepted + statuses.rejected;

  const interviewRate = appliedCount > 0
    ? Number(((statuses.interview / appliedCount) * 100).toFixed(1))
    : 0;

  const offerRate = appliedCount > 0
    ? Number(((statuses.offer / appliedCount) * 100).toFixed(1))
    : 0;

  const rejectionRate = appliedCount > 0
    ? Number(((statuses.rejected / appliedCount) * 100).toFixed(1))
    : 0;

  // Funnel conversion percentages
  const funnel = [
    { stage: 'Saved', count: statuses.saved, conversion: 100 },
    { stage: 'Applied', count: statuses.applied, conversion: total > 0 ? Number(((statuses.applied / total) * 100).toFixed(1)) : 0 },
    { stage: 'Screening', count: statuses.screening, conversion: statuses.applied > 0 ? Number(((statuses.screening / statuses.applied) * 100).toFixed(1)) : 0 },
    { stage: 'Interview', count: statuses.interview, conversion: statuses.screening > 0 ? Number(((statuses.interview / Math.max(1, statuses.screening)) * 100).toFixed(1)) : 0 },
    { stage: 'Offer', count: statuses.offer, conversion: statuses.interview > 0 ? Number(((statuses.offer / statuses.interview) * 100).toFixed(1)) : 0 },
    { stage: 'Accepted', count: statuses.accepted, conversion: statuses.offer > 0 ? Number(((statuses.accepted / statuses.offer) * 100).toFixed(1)) : 0 }
  ];

  const weeklyCount = applications.filter(a => a.createdAt >= sevenDaysAgo).length;
  const monthlyCount = applications.filter(a => a.createdAt >= thirtyDaysAgo).length;

  return {
    total,
    statuses,
    conversion: {
      interviewRate,
      offerRate,
      rejectionRate
    },
    funnel,
    weeklyCount,
    monthlyCount,
    recentApplications: applications.slice(0, 5)
  };
};

/**
 * GET /api/analytics/matches
 */
const getMatchAnalyticsFull = async (userId) => {
  if (!isValidObjectId(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const matches = await Match.find({ user: userObjectId })
    .sort({ score: -1, createdAt: -1 })
    .populate('opportunity', 'title company location requirements type remote');

  const totalMatches = matches.length;

  const lowMatches = matches.filter(m => m.score < 60).length;
  const moderateMatches = matches.filter(m => m.score >= 60 && m.score < 75).length;
  const strongMatches = matches.filter(m => m.score >= 75 && m.score < 90).length;
  const excellentMatches = matches.filter(m => m.score >= 90 || m.matchLevel === 'excellent').length;

  const totalScoreSum = matches.reduce((acc, m) => acc + (m.score || 0), 0);
  const averageScore = totalMatches > 0 ? Math.round(totalScoreSum / totalMatches) : 0;
  const highestScore = totalMatches > 0 ? Math.max(...matches.map(m => m.score || 0)) : 0;

  const distribution = {
    low: lowMatches,
    moderate: moderateMatches,
    strong: strongMatches,
    excellent: excellentMatches
  };

  const distributionPercent = {
    low: totalMatches > 0 ? Math.round((lowMatches / totalMatches) * 100) : 0,
    moderate: totalMatches > 0 ? Math.round((moderateMatches / totalMatches) * 100) : 0,
    strong: totalMatches > 0 ? Math.round((strongMatches / totalMatches) * 100) : 0,
    excellent: totalMatches > 0 ? Math.round((excellentMatches / totalMatches) * 100) : 0
  };

  return {
    totalMatches,
    averageScore,
    highestScore,
    excellentMatches,
    strongMatches,
    moderateMatches,
    lowMatches,
    distribution,
    distributionPercent,
    recentMatches: matches.slice(0, 5)
  };
};

/**
 * GET /api/analytics/skills
 */
const getSkillAnalyticsFull = async (userId) => {
  if (!isValidObjectId(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const [user, matches] = await Promise.all([
    User.findById(userId),
    Match.find({ user: userObjectId })
  ]);

  const candidateSkills = user?.profile?.skills || user?.skills || [];

  const matchedCounts = {};
  const missingCounts = {};

  matches.forEach(m => {
    if (Array.isArray(m.matchedSkills)) {
      m.matchedSkills.forEach(s => {
        const clean = String(s).trim();
        if (clean) matchedCounts[clean] = (matchedCounts[clean] || 0) + 1;
      });
    }
    if (Array.isArray(m.missingSkills)) {
      m.missingSkills.forEach(s => {
        const clean = String(s).trim();
        if (clean) missingCounts[clean] = (missingCounts[clean] || 0) + 1;
      });
    }
  });

  const totalMatchCount = Math.max(1, matches.length);

  const topStrengths = candidateSkills.map(skill => {
    const count = matchedCounts[skill] || matchedCounts[skill.toLowerCase()] || 0;
    const percentage = Math.min(100, Math.round((count / totalMatchCount) * 100));
    return { skill, count, percentage };
  }).sort((a, b) => b.count - a.count);

  const sortedMissing = Object.keys(missingCounts).sort((a, b) => missingCounts[b] - missingCounts[a]);

  const topSkillGaps = sortedMissing.map(skill => {
    const count = missingCounts[skill];
    const percentage = Math.min(100, Math.round((count / totalMatchCount) * 100));
    return { skill, count, percentage };
  });

  const highDemandMissingSkills = topSkillGaps.slice(0, 5);

  return {
    topStrengths,
    topSkillGaps,
    highDemandMissingSkills
  };
};

/**
 * GET /api/analytics/activity
 */
const getActivityAnalyticsFull = async (userId) => {
  if (!isValidObjectId(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [applications, matches, notifications] = await Promise.all([
    Application.find({ user: userObjectId, createdAt: { $gte: thirtyDaysAgo } }),
    Match.find({ user: userObjectId, createdAt: { $gte: thirtyDaysAgo } }),
    Notification.find({ user: userObjectId, createdAt: { $gte: thirtyDaysAgo } })
  ]);

  // Aggregate by date (YYYY-MM-DD)
  const dateMap = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split('T')[0];
    dateMap[dateKey] = { date: dateKey, applications: 0, matches: 0, activities: 0 };
  }

  applications.forEach(a => {
    const dateKey = new Date(a.createdAt).toISOString().split('T')[0];
    if (dateMap[dateKey]) {
      dateMap[dateKey].applications++;
      dateMap[dateKey].activities++;
    }
  });

  matches.forEach(m => {
    const dateKey = new Date(m.createdAt).toISOString().split('T')[0];
    if (dateMap[dateKey]) {
      dateMap[dateKey].matches++;
      dateMap[dateKey].activities++;
    }
  });

  notifications.forEach(n => {
    const dateKey = new Date(n.createdAt).toISOString().split('T')[0];
    if (dateMap[dateKey]) {
      dateMap[dateKey].activities++;
    }
  });

  const dailyActivity = Object.values(dateMap);

  return {
    dailyActivity,
    totalEventsLast30Days: applications.length + matches.length + notifications.length
  };
};

/**
 * GET /api/analytics/insights
 */
const getCareerInsightsFull = async (userId) => {
  const [overview, apps, matchesData, skills] = await Promise.all([
    getOverviewAnalytics(userId),
    getApplicationAnalyticsFull(userId),
    getMatchAnalyticsFull(userId),
    getSkillAnalyticsFull(userId)
  ]);

  const insights = [];

  // Insight 1: Profile Completion
  if (overview.profileCompletion < 80) {
    insights.push({
      type: 'profile',
      icon: 'UserCheck',
      title: 'Complete Profile Skills Matrix',
      explanation: `Your profile completion is currently ${overview.profileCompletion}%. Adding missing target skills will increase AI match accuracy and unlocked opportunities.`,
      cta: 'Complete Profile',
      link: '/dashboard/profile'
    });
  }

  // Insight 2: Match Score & Skill Gaps
  if (skills.highDemandMissingSkills.length > 0) {
    const topMissing = skills.highDemandMissingSkills[0].skill;
    insights.push({
      type: 'skill_gap',
      icon: 'Target',
      title: `High Market Demand Skill: ${topMissing}`,
      explanation: `${topMissing} appears in ${skills.highDemandMissingSkills[0].count} of your matched opportunities. Learning ${topMissing} will directly raise your match scores.`,
      cta: 'Improve with Career Copilot',
      link: '/dashboard/career-copilot'
    });
  }

  // Insight 3: Application Funnel Target
  if (apps.total === 0) {
    insights.push({
      type: 'application',
      icon: 'Briefcase',
      title: 'Start Applying to High-Match Roles',
      explanation: 'You currently have zero active applications submitted. Apply to your top AI matches to start populating your career pipeline.',
      cta: 'Explore Matches',
      link: '/dashboard/matches'
    });
  } else if (apps.conversion.interviewRate === 0 && apps.total >= 3) {
    insights.push({
      type: 'application',
      icon: 'RefreshCw',
      title: 'Optimize Application Targeting',
      explanation: `You have submitted ${apps.total} applications but have 0 interviews scheduled. Use Career Copilot to tailor your resume summary and highlight relevant skills.`,
      cta: 'Prepare with Copilot',
      link: '/dashboard/career-copilot'
    });
  } else if (apps.conversion.interviewRate > 0) {
    insights.push({
      type: 'interview',
      icon: 'Award',
      title: 'Strong Interview Conversion Rate',
      explanation: `Your interview conversion rate is ${apps.conversion.interviewRate}%. Prepare for upcoming technical rounds using the Interview Prep module.`,
      cta: 'Practice Interview Questions',
      link: '/dashboard/career-copilot'
    });
  }

  // Insight 4: Match Score Performance
  if (matchesData.averageScore >= 80) {
    insights.push({
      type: 'match',
      icon: 'Sparkles',
      title: 'High Career Match Scores',
      explanation: `Your average match score across ${matchesData.totalMatches} opportunities is ${matchesData.averageScore}%. Apply to your top 90%+ excellent matches now.`,
      cta: 'View Excellent Matches',
      link: '/dashboard/matches'
    });
  }

  return {
    insights
  };
};

module.exports = {
  getOverviewAnalytics,
  getApplicationAnalyticsFull,
  getMatchAnalyticsFull,
  getSkillAnalyticsFull,
  getActivityAnalyticsFull,
  getCareerInsightsFull
};
