const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity.model');
const User = require('../models/User.model');
const aiOpportunitySearchService = require('../services/aiOpportunitySearch.service');
const recommendationService = require('../services/recommendation.service');

/**
 * Standardize opportunity document payload with canonical applyUrl.
 */
const formatOpportunity = (oppDoc) => {
  if (!oppDoc) return null;
  const opp = oppDoc.toObject ? oppDoc.toObject() : { ...oppDoc };
  const rawUrl = (opp.applyUrl || opp.applicationUrl || opp.sourceUrl || opp.url || '').toString().trim();
  return {
    ...opp,
    applyUrl: rawUrl,
    applicationUrl: rawUrl
  };
};

/**
 * Helper to sanitize request body against Mongo operator injection.
 */
const checkNoMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) {
      const err = new Error(`Invalid request parameter: Mongo operators (${key}) are forbidden`);
      err.statusCode = 400;
      throw err;
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      checkNoMongoOperators(obj[key]);
    }
  }
};

/**
 * Fetch personalized opportunity recommendations for authenticated candidate user.
 * @route GET /api/opportunities/recommended
 * @access Private
 */
const getRecommendedOpportunities = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);

    const userId = req.user.id || req.user._id;

    const pageRaw = req.query.page !== undefined ? req.query.page : 1;
    const page = parseInt(pageRaw, 10);
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page parameter must be a positive integer greater than or equal to 1'
      });
    }

    const limitRaw = req.query.limit !== undefined ? req.query.limit : 10;
    const limit = parseInt(limitRaw, 10);
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Limit parameter must be a positive integer greater than or equal to 1'
      });
    }
    if (limit > 50) {
      return res.status(400).json({
        success: false,
        message: 'Limit parameter cannot exceed 50'
      });
    }

    const result = await recommendationService.getRecommendedOpportunitiesForUser(userId, { page, limit });

    const formattedRecs = (result.recommendations || []).map(r => ({
      ...r,
      opportunity: formatOpportunity(r.opportunity)
    }));

    res.status(200).json({
      success: true,
      count: result.count,
      pagination: result.pagination,
      recommendations: formattedRecs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch paginated list of opportunities with filter, search, location, and sort capabilities.
 * @route GET /api/opportunities
 * @access Public
 */
const getOpportunities = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { search, type, remote, sort, location, minScore } = req.query;

    const filter = { isActive: true };

    if (type && type !== 'all') {
      const typeLower = type.toLowerCase();
      if (['job', 'internship', 'research', 'full-time', 'part-time'].includes(typeLower)) {
        filter.type = typeLower;
      }
    }

    if (remote !== undefined && remote !== 'all') {
      if (remote === 'true' || remote === '1') {
        filter.remote = true;
      } else if (remote === 'false' || remote === '0') {
        filter.remote = false;
      }
    }

    if (location && location.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: 'i'
      };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { requirements: searchRegex },
        { skills: searchRegex }
      ];
    }

    let sortOptions = { postedAt: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { postedAt: 1, createdAt: 1 };
    } else if (sort === 'company') {
      sortOptions = { company: 1, title: 1 };
    }

    const total = await Opportunity.countDocuments(filter);
    const rawOpportunities = await Opportunity.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    let opportunities = rawOpportunities.map(formatOpportunity);

    // Apply minimum score threshold if provided
    const numericMinScore = parseInt(minScore, 10);
    if (!isNaN(numericMinScore) && numericMinScore > 0) {
      opportunities = opportunities.filter(o => (o.matchScore || o.score || 75) >= numericMinScore);
    }

    const pages = Math.ceil(total / limit) || 0;

    res.status(200).json({
      success: true,
      count: opportunities.length,
      pagination: {
        page,
        limit,
        total,
        pages
      },
      opportunities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search opportunities alias.
 * @route GET /api/opportunities/search
 * @access Public
 */
const searchOpportunities = async (req, res, next) => {
  return getOpportunities(req, res, next);
};

/**
 * Search opportunities tailored to authenticated candidate skills and profile preferences.
 * @route GET /api/opportunities/search/personalized
 * @access Private
 */
const searchPersonalizedOpportunities = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const candidateSkills = (user.profile && Array.isArray(user.profile.skills))
      ? user.profile.skills.map(s => String(s).trim().toLowerCase())
      : [];
    
    const candidateLocation = (user.profile && user.profile.location)
      ? user.profile.location.trim()
      : '';

    const filter = { isActive: true };

    if (candidateSkills.length > 0) {
      const skillRegexes = candidateSkills.map(s => new RegExp(s, 'i'));
      filter.$or = [
        { requirements: { $in: skillRegexes } },
        { title: { $in: skillRegexes } },
        { description: { $in: skillRegexes } }
      ];
    }

    if (candidateLocation) {
      if (!filter.$or) filter.$or = [];
      filter.$or.push({ location: new RegExp(candidateLocation, 'i') });
    }

    const rawOpportunities = await Opportunity.find(filter)
      .sort({ postedAt: -1, createdAt: -1 })
      .limit(20);

    const opportunities = rawOpportunities.map(formatOpportunity);

    res.status(200).json({
      success: true,
      count: opportunities.length,
      personalizedFor: user.email,
      opportunities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AI-powered natural language opportunity search using Google Gemini.
 * @route POST /api/opportunities/ai-search
 * @access Private
 */
const aiSearchOpportunities = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);

    const queryInput = req.body ? (req.body.query || req.body.prompt || req.body.q) : undefined;

    if (queryInput === undefined || queryInput === null || typeof queryInput !== 'string' || !queryInput.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required and must be a non-empty string'
      });
    }

    const queryText = queryInput.trim();

    if (queryText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Search query exceeds maximum length of 500 characters'
      });
    }

    const limit = req.body && req.body.limit ? parseInt(req.body.limit, 10) : 20;

    const result = await aiOpportunitySearchService.searchAndRankOpportunities(queryText, limit);

    const formattedOpps = (result.opportunities || []).map(formatOpportunity);

    res.status(200).json({
      success: true,
      query: result.query,
      interpretedFilters: result.interpretedFilters,
      count: formattedOpps.length,
      opportunities: formattedOpps
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Fetch detailed metadata for a single opportunity by ID.
 * @route GET /api/opportunities/:id
 * @access Public
 */
const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID format'
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity || !opportunity.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    res.status(200).json({
      success: true,
      opportunity: formatOpportunity(opportunity)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendedOpportunities,
  getOpportunities,
  searchOpportunities,
  searchPersonalizedOpportunities,
  aiSearchOpportunities,
  getOpportunityById
};
