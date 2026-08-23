const mongoose = require('mongoose');
const OpportunityMonitor = require('../models/OpportunityMonitor.model');
const OpportunityObservation = require('../models/OpportunityObservation.model');
const Opportunity = require('../models/Opportunity.model');
const Match = require('../models/Match.model');
const Application = require('../models/Application.model');
const User = require('../models/User.model');
const notificationService = require('./notification.service');
const { evaluateOpportunityFit } = require('./opportunityIntelligence.service');
const careerActionPlannerService = require('./careerActionPlanner.service');
const settingsService = require('./settings.service');

/**
 * Get or initialize candidate Opportunity Monitor.
 */
const getMonitor = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let monitor = await OpportunityMonitor.findOne({ user: userObjectId });

  if (!monitor) {
    const user = await User.findById(userId);
    const pref = user?.profile?.preferences || {};

    monitor = new OpportunityMonitor({
      user: userObjectId,
      enabled: true,
      frequency: 'daily',
      preferredRoles: Array.isArray(pref.desiredRoles) ? pref.desiredRoles : [],
      preferredLocations: Array.isArray(pref.preferredLocations) ? pref.preferredLocations : [],
      jobTypes: Array.isArray(pref.jobTypes) ? pref.jobTypes : ['Full-time'],
      workModes: Array.isArray(pref.workModes) ? pref.workModes : ['Remote', 'Hybrid'],
      minimumSalary: typeof pref.minimumSalary === 'number' ? pref.minimumSalary : 0,
      minimumMatchScore: 60,
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await monitor.save();
  }

  return monitor;
};

/**
 * Update candidate Opportunity Monitor preferences.
 */
const updateMonitor = async (userId, updates = {}) => {
  const monitor = await getMonitor(userId);

  const allowedFields = [
    'enabled',
    'frequency',
    'preferredRoles',
    'preferredLocations',
    'jobTypes',
    'workModes',
    'minimumSalary',
    'experienceLevel',
    'minimumMatchScore',
    'alertPreferences',
    'digestPreferences'
  ];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      monitor[field] = updates[field];
    }
  });

  await monitor.save();
  return monitor;
};

/**
 * Start Opportunity Monitor.
 */
const startMonitor = async (userId) => {
  return updateMonitor(userId, { enabled: true });
};

/**
 * Pause Opportunity Monitor.
 */
const pauseMonitor = async (userId) => {
  return updateMonitor(userId, { enabled: false });
};

/**
 * Run Monitoring Engine for candidate.
 */
const runMonitorForUser = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const monitor = await getMonitor(userId);

  if (!monitor.enabled) {
    return {
      ran: false,
      message: 'Opportunity Monitor is currently paused for candidate',
      monitor
    };
  }

  const settings = await settingsService.getSettings(userId).catch(() => null);
  const allowNotifs = settings?.notificationPreferences?.newMatches !== false;

  // Retrieve active opportunities & applications
  const [opportunities, applications] = await Promise.all([
    Opportunity.find({ isActive: true }).sort({ postedAt: -1 }).limit(50),
    Application.find({ user: userObjectId })
  ]);

  const appliedOppIds = new Set(applications.map(a => String(a.opportunity?._id || a.opportunity)));

  let foundCount = 0;
  let alertedCount = 0;
  const processedRecommendations = [];

  for (const opp of opportunities) {
    const oppId = opp._id;
    if (appliedOppIds.has(String(oppId))) continue;

    // Retrieve or create observation
    let obs = await OpportunityObservation.findOne({ user: userObjectId, opportunity: oppId });
    const isNewObservation = !obs;

    // Evaluate opportunity fit
    const fit = await evaluateOpportunityFit(userId, opp);

    if (fit.score < monitor.minimumMatchScore) continue;

    foundCount++;

    if (!obs) {
      obs = new OpportunityObservation({
        user: userObjectId,
        opportunity: oppId,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        firstMatchedAt: new Date(),
        highestMatchScore: fit.score,
        latestMatchScore: fit.score,
        alerted: false,
        viewed: false,
        saved: false,
        applied: false,
        dismissed: false
      });
    } else {
      obs.lastSeenAt = new Date();
      if (fit.score > obs.highestMatchScore) {
        obs.highestMatchScore = fit.score;
      }
      obs.latestMatchScore = fit.score;
    }

    // Determine Alert Eligibility (Duplicate protection)
    let shouldAlert = false;
    let alertType = null;

    if (!obs.alerted && allowNotifs) {
      if (fit.score >= 90 && monitor.alertPreferences.excellentMatches) {
        shouldAlert = true;
        alertType = 'excellent_match';
      } else if (fit.score >= 75 && monitor.alertPreferences.strongMatches) {
        shouldAlert = true;
        alertType = 'new_match';
      }
    } else if (obs.alerted && fit.score - obs.highestMatchScore >= 15 && allowNotifs) {
      // Score materially improved (72 -> 91)
      shouldAlert = true;
      alertType = 'match_improved';
    }

    if (shouldAlert) {
      obs.alerted = true;
      obs.alertType = alertType;
      alertedCount++;

      // Trigger Phase 16.8 notification
      await notificationService.createNotification({
        user: userId,
        type: alertType === 'excellent_match' ? 'excellent_match' : 'new_match',
        title: alertType === 'excellent_match' ? `90%+ Excellent Match Found: ${opp.title}` : `New High-Match Job Found: ${opp.title}`,
        message: `${opp.company} (${opp.location || 'Remote'}) is a ${fit.score}% match for your candidate profile.`,
        link: `/dashboard/opportunity-monitor`
      }).catch(() => {});
    }

    await obs.save();

    processedRecommendations.push({
      opportunity: opp,
      fit,
      observation: obs
    });
  }

  // Update Monitor stats
  monitor.lastRunAt = new Date();
  monitor.nextRunAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  monitor.opportunitiesFound = foundCount;
  monitor.opportunitiesAlerted = (monitor.opportunitiesAlerted || 0) + alertedCount;
  await monitor.save();

  // Refresh Career Planner if 90%+ match discovered
  if (alertedCount > 0) {
    careerActionPlannerService.generatePlan(userId, true).catch(() => {});
  }

  return {
    ran: true,
    lastRunAt: monitor.lastRunAt,
    opportunitiesFound: foundCount,
    opportunitiesAlerted: alertedCount,
    recommendationsCount: processedRecommendations.length,
    monitor
  };
};

/**
 * Get Ranked Candidate Recommendations.
 */
const getRecommendations = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const monitor = await OpportunityMonitor.findOne({ user: userObjectId }).lean();
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

  if (!monitor?.lastRunAt || new Date(monitor.lastRunAt) < fifteenMinsAgo) {
    await runMonitorForUser(userId).catch(() => {});
  }

  const observations = await OpportunityObservation.find({
    user: userObjectId,
    dismissed: false
  })
    .populate('opportunity')
    .sort({ highestMatchScore: -1, lastSeenAt: -1 })
    .limit(30);

  const results = await Promise.all(
    observations
      .filter(obs => obs.opportunity && obs.opportunity.isActive !== false)
      .map(async (obs) => {
        const fit = await evaluateOpportunityFit(userId, obs.opportunity);
        return {
          opportunity: obs.opportunity,
          fit,
          observation: {
            id: obs._id,
            firstSeenAt: obs.firstSeenAt,
            highestMatchScore: obs.highestMatchScore,
            viewed: obs.viewed,
            saved: obs.saved,
            applied: obs.applied,
            alerted: obs.alerted
          }
        };
      })
  );

  return results;
};

/**
 * Get Newly Discovered Opportunities.
 */
const getNewOpportunities = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const observations = await OpportunityObservation.find({
    user: userObjectId,
    dismissed: false,
    firstSeenAt: { $gte: oneDayAgo }
  })
    .populate('opportunity')
    .sort({ highestMatchScore: -1 });

  return Promise.all(
    observations
      .filter(obs => obs.opportunity)
      .map(async (obs) => ({
        opportunity: obs.opportunity,
        fit: await evaluateOpportunityFit(userId, obs.opportunity),
        observation: obs
      }))
  );
};

/**
 * Get Opportunity Digest.
 */
const getDigest = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const recs = await getRecommendations(userId);

  const newCount = recs.filter(r => new Date(r.observation.firstSeenAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
  const excellentCount = recs.filter(r => r.fit.category === 'EXCELLENT').length;
  const strongCount = recs.filter(r => r.fit.category === 'STRONG').length;
  const readyToApplyCount = recs.filter(r => r.fit.score >= 75 && r.fit.readinessScore >= 70).length;

  const topOpportunity = recs.length > 0 ? recs[0] : null;

  return {
    summary: `AgentScout detected ${recs.length} matched opportunities. ${excellentCount} are Excellent Matches (90%+), and ${readyToApplyCount} are ready for application submission.`,
    newOpportunitiesCount: newCount,
    excellentMatchesCount: excellentCount,
    strongMatchesCount: strongCount,
    readyToApplyCount,
    topOpportunity,
    digestGeneratedAt: new Date()
  };
};

/**
 * Watch Opportunity (Add to Saved Watchlist).
 */
const watchOpportunity = async (userId, opportunityId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oppObjectId = new mongoose.Types.ObjectId(opportunityId);

  let obs = await OpportunityObservation.findOne({ user: userObjectId, opportunity: oppObjectId });
  if (!obs) {
    obs = new OpportunityObservation({
      user: userObjectId,
      opportunity: oppObjectId,
      saved: true,
      lastActionAt: new Date()
    });
  } else {
    obs.saved = true;
    obs.lastActionAt = new Date();
  }
  await obs.save();
  return { success: true, message: 'Opportunity added to watchlist', observation: obs };
};

/**
 * Unwatch Opportunity (Remove from Saved Watchlist).
 */
const unwatchOpportunity = async (userId, opportunityId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oppObjectId = new mongoose.Types.ObjectId(opportunityId);

  const obs = await OpportunityObservation.findOne({ user: userObjectId, opportunity: oppObjectId });
  if (obs) {
    obs.saved = false;
    obs.lastActionAt = new Date();
    await obs.save();
  }
  return { success: true, message: 'Opportunity removed from watchlist' };
};

/**
 * Dismiss Opportunity from candidate view.
 */
const dismissOpportunity = async (userId, opportunityId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oppObjectId = new mongoose.Types.ObjectId(opportunityId);

  let obs = await OpportunityObservation.findOne({ user: userObjectId, opportunity: oppObjectId });
  if (!obs) {
    obs = new OpportunityObservation({
      user: userObjectId,
      opportunity: oppObjectId,
      dismissed: true,
      lastActionAt: new Date()
    });
  } else {
    obs.dismissed = true;
    obs.lastActionAt = new Date();
  }
  await obs.save();
  return { success: true, message: 'Opportunity dismissed' };
};

/**
 * Mark Opportunity as Viewed.
 */
const markOpportunityViewed = async (userId, opportunityId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oppObjectId = new mongoose.Types.ObjectId(opportunityId);

  let obs = await OpportunityObservation.findOne({ user: userObjectId, opportunity: oppObjectId });
  if (!obs) {
    obs = new OpportunityObservation({
      user: userObjectId,
      opportunity: oppObjectId,
      viewed: true,
      lastActionAt: new Date()
    });
  } else {
    obs.viewed = true;
    obs.lastActionAt = new Date();
  }
  await obs.save();
  return { success: true, message: 'Opportunity marked viewed' };
};

module.exports = {
  getMonitor,
  updateMonitor,
  startMonitor,
  pauseMonitor,
  runMonitorForUser,
  getRecommendations,
  getNewOpportunities,
  getDigest,
  watchOpportunity,
  unwatchOpportunity,
  dismissOpportunity,
  markOpportunityViewed
};
