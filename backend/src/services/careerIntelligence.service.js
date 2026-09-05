const { buildUnifiedContext } = require('./careerAgentContext.service');
const { detectImportantChanges, getCareerEvents, markEventAsRead, archiveEvent } = require('./careerEvent.service');
const { calculateCareerHealth } = require('./careerHealth.service');
const { generateIntelligenceFeed } = require('./careerIntelligenceFeed.service');

/**
 * Master Intelligence Orchestrator
 * Connects Event Engine, Health Score Engine, Intelligence Feed, and Career Agent Context.
 */
const getCareerIntelligenceOverview = async (userId) => {
  if (!userId) {
    throw new Error('UserId is required for Career Intelligence overview.');
  }

  // 1. Build Unified Candidate Context
  const unifiedContext = await buildUnifiedContext(userId);

  // 2. Detect & Log New Milestone Events
  await detectImportantChanges(userId, unifiedContext);

  // 3. Calculate 7-Category Weighted Career Health Score
  const health = await calculateCareerHealth(userId);

  // 4. Generate & Rank AI Intelligence Feed
  const feed = await generateIntelligenceFeed(userId, { limit: 10 });

  // 5. Fetch Recent Candidate Timeline Events
  const eventsResult = await getCareerEvents(userId, { limit: 10, includeArchived: false });

  // 6. Extract Top 3 High-Priority Highlights ("What's Important Now")
  const highlights = feed.slice(0, 3);

  return {
    health,
    highlights,
    feed,
    events: eventsResult.events || [],
    unreadEventsCount: eventsResult.unreadCount || 0,
    calculatedAt: new Date()
  };
};

/**
 * Force manual recalculation of Career Intelligence (Rate-limited Endpoint)
 */
const refreshCareerIntelligence = async (userId) => {
  if (!userId) {
    throw new Error('UserId is required to refresh Career Intelligence.');
  }

  const unifiedContext = await buildUnifiedContext(userId);
  await detectImportantChanges(userId, unifiedContext);
  const health = await calculateCareerHealth(userId);
  const feed = await generateIntelligenceFeed(userId, { limit: 10 });
  const eventsResult = await getCareerEvents(userId, { limit: 10 });

  return {
    health,
    highlights: feed.slice(0, 3),
    feed,
    events: eventsResult.events || [],
    unreadEventsCount: eventsResult.unreadCount || 0,
    refreshedAt: new Date()
  };
};

module.exports = {
  getCareerIntelligenceOverview,
  refreshCareerIntelligence,
  markEventAsRead,
  archiveEvent
};
