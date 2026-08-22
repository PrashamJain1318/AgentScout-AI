const mongoose = require('mongoose');
const Match = require('../models/Match.model');
const User = require('../models/User.model');
const { isGeminiConfigured } = require('../config/gemini');
const geminiService = require('./gemini.service');

/**
 * Generate or retrieve cached AI explanation for a match document.
 * @param {string} matchId - Match ObjectId
 * @param {string} userId - Authenticated user ObjectId
 * @param {boolean} refresh - Force fresh Gemini API call
 * @returns {Promise<Object>} Match explanation payload
 */
const generateExplanationForMatch = async (matchId, userId, refresh = false) => {
  if (!mongoose.Types.ObjectId.isValid(matchId)) {
    const err = new Error('Invalid match ID');
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const match = await Match.findOne({ _id: matchId, user: userId })
    .populate('opportunity', 'title company location type remote description requirements salary applicationUrl source sourceUrl postedAt');

  if (!match) {
    const err = new Error('Match not found');
    err.statusCode = 404;
    throw err;
  }

  // 1. Caching Check: Return cached explanation if present and refresh is not requested
  if (
    !refresh &&
    match.explanation &&
    match.explanation.summary &&
    match.explanation.summary.trim() !== '' &&
    match.explanationGeneratedAt
  ) {
    return match.explanation;
  }

  // 2. Gemini Configuration Check
  if (!isGeminiConfigured()) {
    const err = new Error('Gemini AI is not configured');
    err.statusCode = 503;
    throw err;
  }

  // 3. Fetch user profile
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // 4. Generate AI explanation via Gemini service
  const explanation = await geminiService.generateMatchExplanation({
    candidate: user,
    opportunity: match.opportunity,
    match
  });

  // 5. Update and persist explanation in MongoDB Atlas Match document
  match.explanation = explanation;
  match.explanationGeneratedAt = new Date();
  await match.save();

  return match.explanation;
};

module.exports = {
  generateExplanationForMatch
};
