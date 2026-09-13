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
    currentStage: 'PROFILE_BUILDING',
    primaryFocus: 'NO_PROFILE',
    smartPriorities: [
      {
        id: 'p-default',
        title: 'Set Target Role & Complete Profile',
        description: 'Set your target role and complete core preferences to unlock personalized career intelligence.',
        category: 'profile',
        priority: 'critical',
        deepLink: '/settings',
        actionLabel: 'Complete Profile',
        impact: 'Essential Baseline',
        reason: 'Profile setup is required to initialize AI career guidance.',
        icon: 'target'
      }
    ],
    momentum: {
      score: 0,
      trend: 'STABLE',
      changePercentage: 0,
      lastActiveDays: 0,
      weeklyActivityCount: 0
    },
    dailyInsight: {
      title: 'Initialize Career Profile',
      category: 'Profile Setup',
      tip: 'Setting a clear target role unlocks high-precision job matching and custom interview coaching.',
      deepLink: '/settings',
      deepLinkLabel: 'Set Target Role',
      rationale: 'Generated for new user onboarding.'
    },
    journeyPhases: [
      { id: 'phase-profile', label: 'Profile Setup', status: 'incomplete', progress: 0, deepLink: '/settings' },
      { id: 'phase-resume', label: 'Resume Optimization', status: 'not_started', progress: 0, deepLink: '/resume-studio' },
      { id: 'phase-opportunities', label: 'Job Discovery', status: 'not_started', progress: 0, deepLink: '/opportunity-discovery' },
      { id: 'phase-applications', label: 'Applications', status: 'not_started', progress: 0, deepLink: '/applications' },
      { id: 'phase-interviews', label: 'Interviews', status: 'not_started', progress: 0, deepLink: '/interview-prep' },
      { id: 'phase-growth', label: 'Career OS', status: 'not_started', progress: 0, deepLink: '/career-os' }
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
