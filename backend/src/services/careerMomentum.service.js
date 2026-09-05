const Application = require('../models/Application.model');
const Resume = require('../models/Resume.model');
const Interview = require('../models/Interview.model');

/**
 * Career Momentum Service - Calculates dynamic candidate momentum score (0-100%)
 */

const calculateMomentumScore = async (userId) => {
  try {
    let score = 50;
    let applicationsCount = 0;
    let recentAppsCount = 0;
    let resumeScore = 0;
    let interviewCount = 0;

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    try {
      if (Application) {
        applicationsCount = await Application.countDocuments({ user: userId });
        recentAppsCount = await Application.countDocuments({
          user: userId,
          updatedAt: { $gte: fourteenDaysAgo }
        });
      }
    } catch (e) {
      // safe fallback
    }

    try {
      if (Resume) {
        const resume = await Resume.findOne({ user: userId }).lean();
        resumeScore = resume?.atsScore ?? resume?.score ?? 0;
      }
    } catch (e) {
      // safe fallback
    }

    try {
      if (Interview) {
        interviewCount = await Interview.countDocuments({ user: userId });
      }
    } catch (e) {
      // safe fallback
    }

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
