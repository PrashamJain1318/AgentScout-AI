const {
  getCareerIntelligenceOverview,
  refreshCareerIntelligence,
  markEventAsRead,
  archiveEvent
} = require('../services/careerIntelligence.service');

const { calculateCareerHealth } = require('../services/careerHealth.service');
const { generateIntelligenceFeed } = require('../services/careerIntelligenceFeed.service');
const { getCareerEvents } = require('../services/careerEvent.service');

/**
 * @desc    Get complete Career Intelligence Overview (Health, Highlights, Feed, Events)
 * @route   GET /api/career-intelligence/overview
 * @access  Private
 */
const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const overview = await getCareerIntelligenceOverview(userId);
    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed 7-Category Career Health Data
 * @route   GET /api/career-intelligence/health
 * @access  Private
 */
const getHealth = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const health = await calculateCareerHealth(userId);
    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ranked AI Intelligence Feed
 * @route   GET /api/career-intelligence/feed
 * @access  Private
 */
const getFeed = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { limit, category, priority } = req.query;
    const feed = await generateIntelligenceFeed(userId, { limit, category, priority });
    res.status(200).json({
      success: true,
      data: feed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate career timeline events
 * @route   GET /api/career-intelligence/events
 * @access  Private
 */
const getEvents = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { limit, page, category, priority, unreadOnly } = req.query;
    const result = await getCareerEvents(userId, {
      limit,
      page,
      category,
      priority,
      unreadOnly: unreadOnly === 'true'
    });
    res.status(200).json({
      success: true,
      data: result.events,
      meta: {
        total: result.total,
        unreadCount: result.unreadCount,
        page: result.page,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a career event as read
 * @route   PATCH /api/career-intelligence/events/:eventId/read
 * @access  Private
 */
const markRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { eventId } = req.params;
    const event = await markEventAsRead(userId, eventId);
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive a career event
 * @route   PATCH /api/career-intelligence/events/:eventId/archive
 * @access  Private
 */
const markArchive = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { eventId } = req.params;
    const event = await archiveEvent(userId, eventId);
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Force manual recalculation of Career Intelligence (Rate limited)
 * @route   POST /api/career-intelligence/refresh
 * @access  Private
 */
const refreshIntelligence = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const refreshed = await refreshCareerIntelligence(userId);
    res.status(200).json({
      success: true,
      data: refreshed
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getHealth,
  getFeed,
  getEvents,
  markRead,
  markArchive,
  refreshIntelligence
};
