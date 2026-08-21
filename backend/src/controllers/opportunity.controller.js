const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity.model');

/**
 * Fetch paginated list of opportunities with filter, search, and sort capabilities.
 * @route GET /api/opportunities
 * @access Public
 */
const getOpportunities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { search, type, remote, sort } = req.query;

    // Base query filter: active opportunities only
    const filter = { isActive: true };

    // 1. Role Type Filter (job | internship | research)
    if (type && ['job', 'internship', 'research'].includes(type.toLowerCase())) {
      filter.type = type.toLowerCase();
    }

    // 2. Remote Preference Filter (true | false)
    if (remote !== undefined) {
      if (remote === 'true' || remote === '1') {
        filter.remote = true;
      } else if (remote === 'false' || remote === '0') {
        filter.remote = false;
      }
    }

    // 3. Keyword Search Filter (title, company, description, requirements)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { requirements: searchRegex }
      ];
    }

    // 4. Sorting Options
    let sortOptions = { postedAt: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { postedAt: 1, createdAt: 1 };
    } else if (sort === 'company') {
      sortOptions = { company: 1, title: 1 };
    }

    // 5. Execute DB Query & Count
    const total = await Opportunity.countDocuments(filter);
    const opportunities = await Opportunity.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

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
 * Fetch detailed metadata for a single opportunity by ID.
 * @route GET /api/opportunities/:id
 * @access Public
 */
const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate Mongoose ObjectId format
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
      opportunity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpportunities,
  getOpportunityById
};
