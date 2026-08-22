const mongoose = require('mongoose');
const Match = require('../models/Match.model');
const matchingService = require('../services/matching.service');
const matchingEngineService = require('../services/matchingEngine.service');
const matchExplanationService = require('../services/matchExplanation.service');

const checkNoMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) {
      const err = new Error(`Invalid request parameter: Mongo operators (${key}) are forbidden`);
      err.statusCode = 400;
      throw err;
    }
  }
};

/**
 * Fetch match analytics and KPIs for current user.
 * @route GET /api/matches/analytics
 * @access Private
 */
const getMatchAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const matches = await Match.find({ user: userId });

    const totalMatches = matches.length;
    const excellentMatches = matches.filter(m => m.score >= 90 || m.matchLevel === 'excellent').length;
    const strongMatches = matches.filter(m => m.score >= 75 && m.score < 90).length;

    const totalScoreSum = matches.reduce((acc, m) => acc + (m.score || 0), 0);
    const averageScore = totalMatches > 0 ? Math.round(totalScoreSum / totalMatches) : 0;

    const skillCounts = {};
    matches.forEach(m => {
      if (Array.isArray(m.missingSkills)) {
        m.missingSkills.forEach(s => {
          const clean = String(s).trim();
          if (clean) {
            skillCounts[clean] = (skillCounts[clean] || 0) + 1;
          }
        });
      }
    });

    const sortedSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);
    const skillsToImprove = sortedSkills.slice(0, 5);

    res.status(200).json({
      success: true,
      analytics: {
        totalMatches,
        excellentMatches,
        strongMatches,
        averageScore,
        skillsToImprove
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger AI-powered match explanation generation using Google Gemini.
 * @route POST /api/matches/:id/explain
 * @access Private
 */
const explainMatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID'
      });
    }

    const userId = req.user.id || req.user._id;

    const refresh = req.query && (req.query.refresh === 'true' || req.query.refresh === '1');

    const explanation = await matchExplanationService.generateExplanationForMatch(id, userId, refresh);

    res.status(200).json({
      success: true,
      message: 'AI match explanation generated successfully',
      explanation
    });
  } catch (error) {
    if (error.statusCode === 503) {
      return res.status(503).json({
        success: false,
        message: 'Gemini AI is not configured'
      });
    }
    if (error.statusCode === 502) {
      return res.status(502).json({
        success: false,
        message: 'Unable to generate AI explanation at this time'
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid match ID'
      });
    }
    next(error);
  }
};

/**
 * Trigger deterministic automatic match generation for current authenticated user.
 * @route POST /api/matches/generate
 * @access Private
 */
const generateUserMatches = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);

    const userId = req.user.id || req.user._id;

    const limit = req.body && req.body.limit ? parseInt(req.body.limit, 10) : 20;

    const summary = await matchingEngineService.generateMatchesForUser(userId, limit);

    res.status(200).json({
      success: true,
      message: 'Matches generated successfully',
      summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update a match recommendation document for the authenticated user.
 * @route POST /api/matches
 * @access Private
 */
const createMatch = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);

    const userId = req.user.id || req.user._id;

    const {
      opportunity,
      score,
      matchLevel,
      matchedSkills,
      missingSkills,
      reasons,
      recommendation,
      status
    } = req.body || {};

    if (!opportunity || !mongoose.Types.ObjectId.isValid(opportunity)) {
      return res.status(400).json({
        success: false,
        message: 'Valid opportunity ID is required'
      });
    }

    if (score === undefined || score === null || score === '') {
      return res.status(400).json({
        success: false,
        message: 'Score must be a number between 0 and 100'
      });
    }

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return res.status(400).json({
        success: false,
        message: 'Score must be a number between 0 and 100'
      });
    }

    const validLevels = ['low', 'moderate', 'strong', 'excellent', 'poor', 'fair', 'good'];
    if (!matchLevel || !validLevels.includes(matchLevel)) {
      return res.status(400).json({
        success: false,
        message: 'matchLevel must be one of: low, moderate, strong, excellent'
      });
    }

    if (status && !['generated', 'viewed', 'saved', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be one of: generated, viewed, saved, dismissed'
      });
    }

    const match = await matchingService.createMatch({
      user: userId,
      opportunity,
      score: numScore,
      matchLevel,
      matchedSkills,
      missingSkills,
      reasons,
      recommendation,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      match
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Opportunity not found'
      });
    }
    if (error.statusCode === 400 || error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Get all match results for current authenticated user.
 * @route GET /api/matches
 * @access Private
 */
const getUserMatches = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);

    const userId = req.user.id || req.user._id;

    const matches = await matchingService.getUserMatches(userId);

    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific match result by ID for current authenticated user.
 * @route GET /api/matches/:id
 * @access Private
 */
const getMatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID'
      });
    }

    const userId = req.user.id || req.user._id;

    const match = await matchingService.getMatchById(id, userId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.status(200).json({
      success: true,
      match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a match result by ID for current authenticated user.
 * @route DELETE /api/matches/:id
 * @access Private
 */
const deleteMatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID'
      });
    }

    const userId = req.user.id || req.user._id;

    const isDeleted = await matchingService.deleteMatch(id, userId);

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatchAnalytics,
  explainMatch,
  generateUserMatches,
  createMatch,
  getUserMatches,
  getMatch,
  deleteMatch
};
