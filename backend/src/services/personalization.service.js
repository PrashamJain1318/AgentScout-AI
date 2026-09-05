const UserPersonalization = require('../models/UserPersonalization.model');
const { evaluateSmartPriorities } = require('./smartPriority.service');
const { calculateMomentumScore } = require('./careerMomentum.service');
const { getJourneyRoadmap, getAIDailyInsight, calculateWidgetPriority } = require('./adaptiveDashboard.service');

/**
 * Main Personalization Orchestrator Service
 */

const getPersonalization = async (userId) => {
  try {
    let personalization = await UserPersonalization.findOne({ user: userId });

    // Refresh if not exists or if older than 30 minutes
    const isStale = !personalization || (Date.now() - new Date(personalization.lastCalculatedAt).getTime() > 30 * 60 * 1000);

    if (isStale) {
      personalization = await refreshPersonalization(userId);
    }

    return personalization;
  } catch (error) {
    console.error('Error fetching personalization:', error);
    return fallbackPersonalization(userId);
  }
};

const refreshPersonalization = async (userId) => {
  try {
    const [
      prioritiesData,
      momentum,
      journeyPhases
    ] = await Promise.all([
      evaluateSmartPriorities(userId),
      calculateMomentumScore(userId),
      getJourneyRoadmap(userId)
    ]);

    const { primaryFocus, smartPriorities } = prioritiesData;
    const dailyInsight = getAIDailyInsight(primaryFocus);
    const widgetPriorityOrder = calculateWidgetPriority(primaryFocus);

    let stage = 'PROFILE_BUILDING';
    if (primaryFocus === 'WEAK_RESUME') stage = 'RESUME_OPTIMIZATION';
    else if (primaryFocus === 'HIGH_MATCH_AVAILABLE') stage = 'JOB_DISCOVERY';
    else if (primaryFocus === 'INTERVIEW_SOON') stage = 'INTERVIEW_PREPARATION';
    else if (primaryFocus === 'INACTIVE_MOMENTUM') stage = 'ACTIVE_APPLICATION';

    const updateData = {
      user: userId,
      currentStage: stage,
      primaryFocus,
      smartPriorities,
      momentum,
      dailyInsight,
      journeyPhases,
      widgetPriorityOrder,
      lastCalculatedAt: new Date()
    };

    const personalization = await UserPersonalization.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return personalization;
  } catch (error) {
    console.error('Error refreshing personalization:', error);
    return fallbackPersonalization(userId);
  }
};

const getAdaptiveDashboard = async (userId) => {
  const personalization = await getPersonalization(userId);
  return {
    stage: personalization.currentStage,
    primaryFocus: personalization.primaryFocus,
    topPriority: personalization.smartPriorities[0] || null,
    smartPriorities: personalization.smartPriorities,
    journeyPhases: personalization.journeyPhases,
    momentum: personalization.momentum,
    dailyInsight: personalization.dailyInsight,
    widgetPriorityOrder: personalization.widgetPriorityOrder,
    preferences: personalization.userPreferences
  };
};

const getMomentum = async (userId) => {
  const personalization = await getPersonalization(userId);
  return personalization.momentum;
};

const updatePreferences = async (userId, preferences) => {
  try {
    const personalization = await UserPersonalization.findOneAndUpdate(
      { user: userId },
      { $set: { userPreferences: preferences } },
      { new: true, upsert: true }
    );
    return personalization.userPreferences;
  } catch (error) {
    console.error('Error updating personalization preferences:', error);
    throw error;
  }
};

function fallbackPersonalization(userId) {
  return {
    user: userId,
    currentStage: 'RESUME_OPTIMIZATION',
    primaryFocus: 'WEAK_RESUME',
    smartPriorities: [
      {
        id: 'p-default',
        title: 'Optimize Your Resume ATS Score',
        description: 'Upload or refine your resume in Resume Studio to unlock tailored job matching.',
        category: 'resume',
        priority: 'critical',
        deepLink: '/resume-studio',
        actionLabel: 'Open Resume Studio',
        impact: 'Essential Baseline',
        reason: 'Recommended for optimal job matching.',
        icon: 'file-text'
      }
    ],
    momentum: {
      score: 60,
      trend: 'STABLE',
      changePercentage: 0,
      lastActiveDays: 1,
      weeklyActivityCount: 2
    },
    dailyInsight: {
      title: 'Resume Impact Optimization',
      category: 'Resume Strategy',
      tip: 'Using strong action verbs and quantifiable results increases ATS resume pass rates by 40%.',
      deepLink: '/resume-studio',
      deepLinkLabel: 'Optimize Resume',
      rationale: 'Generated to boost candidate application performance.'
    },
    journeyPhases: [
      { id: 'phase-profile', label: 'Profile Setup', status: 'completed', progress: 100, deepLink: '/settings' },
      { id: 'phase-resume', label: 'Resume Optimization', status: 'active', progress: 65, deepLink: '/resume-studio' },
      { id: 'phase-opportunities', label: 'Job Discovery', status: 'upcoming', progress: 20, deepLink: '/opportunity-discovery' },
      { id: 'phase-applications', label: 'Applications', status: 'upcoming', progress: 0, deepLink: '/applications' },
      { id: 'phase-interviews', label: 'Interviews', status: 'upcoming', progress: 0, deepLink: '/interview-prep' },
      { id: 'phase-growth', label: 'Career OS', status: 'upcoming', progress: 0, deepLink: '/career-os' }
    ],
    widgetPriorityOrder: ['greeting', 'priority', 'journey', 'momentum', 'readiness', 'opportunities', 'insight', 'today_plan', 'agent', 'activity'],
    userPreferences: { adaptiveLayout: true, focusMode: false, customThemeAccent: 'indigo' },
    lastCalculatedAt: new Date()
  };
}

module.exports = {
  getPersonalization,
  refreshPersonalization,
  getAdaptiveDashboard,
  getMomentum,
  updatePreferences
};
