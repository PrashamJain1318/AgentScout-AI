const mongoose = require('mongoose');
const Match = require('../models/Match.model');
const Opportunity = require('../models/Opportunity.model');

/**
 * Valid fields for populated Opportunity projection.
 */
const OPPORTUNITY_POPULATE_FIELDS = 'title company location type remote description requirements salary applicationUrl source sourceUrl postedAt';

/**
 * Validate match metrics before persistence.
 * @param {Object} data
 */
const validateMatchData = (data = {}) => {
  if (data.score === undefined || data.score === null || data.score === '') {
    const err = new Error('Score is required');
    err.statusCode = 400;
    throw err;
  }

  const numScore = Number(data.score);
  if (isNaN(numScore) || numScore < 0 || numScore > 100) {
    const err = new Error('Score must be a valid number between 0 and 100');
    err.statusCode = 400;
    throw err;
  }

  if (!data.matchLevel) {
    const err = new Error('matchLevel is required');
    err.statusCode = 400;
    throw err;
  }

  const validLevels = ['low', 'moderate', 'strong', 'excellent', 'poor', 'fair', 'good'];
  if (!validLevels.includes(data.matchLevel)) {
    const err = new Error('matchLevel must be one of: low, moderate, strong, excellent');
    err.statusCode = 400;
    throw err;
  }

  if (data.status) {
    const validStatuses = ['generated', 'viewed', 'saved', 'dismissed'];
    if (!validStatuses.includes(data.status)) {
      const err = new Error('status must be one of: generated, viewed, saved, dismissed');
      err.statusCode = 400;
      throw err;
    }
  }
};

/**
 * Create or update a match document.
 * @param {Object} payload - { user, opportunity, score, matchLevel, matchedSkills, missingSkills, reasons, recommendation, status, breakdown }
 * @returns {Promise<Object>} Persisted Match document
 */
const createMatch = async (payload = {}) => {
  validateMatchData(payload);

  if (!payload.user || !mongoose.Types.ObjectId.isValid(payload.user)) {
    const err = new Error('Valid user ObjectId is required');
    err.statusCode = 400;
    throw err;
  }

  if (!payload.opportunity || !mongoose.Types.ObjectId.isValid(payload.opportunity)) {
    const err = new Error('Valid opportunity ObjectId is required');
    err.statusCode = 400;
    throw err;
  }

  const opportunityExists = await Opportunity.findById(payload.opportunity);
  if (!opportunityExists) {
    const err = new Error('Opportunity not found');
    err.statusCode = 404;
    throw err;
  }

  const matchData = {
    user: payload.user,
    opportunity: payload.opportunity,
    score: Number(payload.score),
    matchLevel: payload.matchLevel,
    matchedSkills: Array.isArray(payload.matchedSkills) ? payload.matchedSkills : [],
    missingSkills: Array.isArray(payload.missingSkills) ? payload.missingSkills : [],
    reasons: Array.isArray(payload.reasons) ? payload.reasons : [],
    recommendation: payload.recommendation ? String(payload.recommendation).trim() : '',
    breakdown: payload.breakdown || {},
    status: payload.status || 'generated'
  };

  const options = { upsert: true, new: true, runValidators: true };
  const match = await Match.findOneAndUpdate(
    { user: payload.user, opportunity: payload.opportunity },
    { $set: matchData },
    options
  ).populate('opportunity', OPPORTUNITY_POPULATE_FIELDS);

  return match;
};

/**
 * Get all matches belonging strictly to an authenticated user.
 * @param {string} userId - User ObjectId
 * @returns {Promise<Array>} List of populated user matches
 */
const getUserMatches = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  return await Match.find({ user: userId })
    .sort({ score: -1, createdAt: -1 })
    .populate('opportunity', OPPORTUNITY_POPULATE_FIELDS);
};

/**
 * Get a specific match by ID belonging strictly to an authenticated user.
 * @param {string} matchId - Match ObjectId
 * @param {string} userId - User ObjectId
 * @returns {Promise<Object|null>} Populated Match document or null
 */
const getMatchById = async (matchId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(matchId)) {
    return null;
  }

  return await Match.findOne({ _id: matchId, user: userId })
    .populate('opportunity', OPPORTUNITY_POPULATE_FIELDS);
};

/**
 * Get match by specific user & opportunity combination.
 * @param {string} userId
 * @param {string} opportunityId
 * @returns {Promise<Object|null>}
 */
const getMatchByUserAndOpportunity = async (userId, opportunityId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(opportunityId)) {
    return null;
  }

  return await Match.findOne({ user: userId, opportunity: opportunityId })
    .populate('opportunity', OPPORTUNITY_POPULATE_FIELDS);
};

/**
 * Delete a match by ID belonging strictly to an authenticated user.
 * @param {string} matchId
 * @param {string} userId
 * @returns {Promise<boolean>} True if deleted
 */
const deleteMatch = async (matchId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(matchId)) {
    return false;
  }

  const result = await Match.deleteOne({ _id: matchId, user: userId });
  return result.deletedCount > 0;
};

module.exports = {
  createMatch,
  getUserMatches,
  getMatchById,
  getMatchByUserAndOpportunity,
  deleteMatch
};
