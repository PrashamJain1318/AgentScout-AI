const Application = require('../models/Application.model');
const Resume = require('../models/Resume.model');
const InterviewSession = require('../models/InterviewSession.model');

/**
 * Career Momentum Service - Calculates dynamic candidate momentum score (0-100%)
 */

const calculateMomentumScore = async (userId) => {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [appsCountRes, recentAppsRes, resumeRes, interviewRes] = await Promise.allSettled([
      Application ? Application.countDocuments({ user: userId }) : Promise.resolve(0),
      Application ? Application.countDocuments({ user: userId, updatedAt: { $gte: fourteenDaysAgo } }) : Promise.resolve(0),
      Resume ? Resume.findOne({ user: userId }).select('atsScore score').lean() : Promise.resolve(null),
      InterviewSession ? InterviewSession.countDocuments({ user: userId }) : Promise.resolve(0)
    ]);

    const applicationsCount = appsCountRes.status === 'fulfilled' ? appsCountRes.value : 0;
    const recentAppsCount = recentAppsRes.status === 'fulfilled' ? recentAppsRes.value : 0;
    const resume = resumeRes.status === 'fulfilled' ? resumeRes.value : null;
    const resumeScore = resume?.atsScore ?? resume?.score ?? 0;
    const interviewCount = interviewRes.status === 'fulfilled' ? interviewRes.value : 0;

    // Weighted Score Calculation
    // 1. Resume baseline contribution (up to 30 pts)
    const resumeContribution = Math.min(30, Math.round((resumeScore / 100) * 30));

    // 2. Total application presence (up to 20 pts)
    const appPresenceContribution = Math.min(20, applicationsCount * 4);

    // 3. Recent activity velocity (up to 30 pts)
    const velocityContribution = Math.min(30, recentAppsCount * 10);

    // 4. Interview preparation commitment (up to 20 pts)
    const interviewContribution = Math.min(20, interviewCount * 10);

    score = Math.min(100, Math.max(10, resumeContribution + appPresenceContribution + velocityContribution + interviewContribution));

    let trend = 'STABLE';
    let changePercentage = 0;

    if (score >= 75) {
      trend = 'UP';
      changePercentage = 15;
    } else if (score < 40) {
      trend = 'DOWN';
      changePercentage = -10;
    } else {
      trend = 'STABLE';
      changePercentage = 5;
    }

    return {
      score,
      trend,
      changePercentage,
      lastActiveDays: recentAppsCount > 0 ? 0 : 3,
      weeklyActivityCount: recentAppsCount + interviewCount
    };
  } catch (error) {
    console.error('Error calculating momentum score:', error);
    return {
      score: 65,
      trend: 'STABLE',
      changePercentage: 0,
      lastActiveDays: 1,
      weeklyActivityCount: 3
    };
  }
};

module.exports = {
  calculateMomentumScore
};
