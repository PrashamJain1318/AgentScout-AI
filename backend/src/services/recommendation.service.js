const Match = require('../models/Match.model');
const User = require('../models/User.model');

/**
 * Retrieve, rank, and paginate personalized opportunity recommendations for authenticated candidate user.
 * @param {string} userId - Authenticated user ObjectId
 * @param {Object} options - { page, limit }
 * @returns {Promise<Object>} { count, pagination, recommendations }
 */
const getRecommendedOpportunitiesForUser = async (userId, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // 1. Fetch user profile for secondary preference alignment
  const user = await User.findById(userId);
  const profile = user ? (user.profile || {}) : {};
  const preferences = profile.preferences || {};

  const candidateLocation = (profile.location || '').toLowerCase();
  const preferredLocations = Array.isArray(preferences.preferredLocations)
    ? preferences.preferredLocations.map(l => String(l).toLowerCase())
    : [];
  const remotePref = Boolean(preferences.remotePreference);
  const desiredRoles = Array.isArray(preferences.desiredRoles)
    ? preferences.desiredRoles.map(r => String(r).toLowerCase())
    : [];

  // 2. Query user's Match documents and populate active opportunities
  const matches = await Match.find({ user: userId })
    .populate('opportunity', 'title company location type remote description requirements salary applicationUrl source sourceUrl postedAt isActive');

  // 3. Filter out inactive or missing opportunities
  const activeMatches = matches.filter(m => m.opportunity && m.opportunity.isActive === true);

  if (activeMatches.length === 0) {
    return {
      count: 0,
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      },
      recommendations: []
    };
  }

  // 4. Calculate secondary preference alignment bonus & internal ranking score
  const ranked = activeMatches.map(m => {
    const opp = m.opportunity;
    const oppLocation = (opp.location || '').toLowerCase();
    const oppTitle = (opp.title || '').toLowerCase();

    let preferenceBonus = 0;

    // Location preference bonus
    if (
      (candidateLocation && oppLocation.includes(candidateLocation)) ||
      preferredLocations.some(loc => oppLocation.includes(loc))
    ) {
      preferenceBonus += 5;
    }

    // Remote preference bonus
    if (remotePref && opp.remote) {
      preferenceBonus += 5;
    }

    // Desired role title bonus
    if (desiredRoles.some(role => oppTitle.includes(role))) {
      preferenceBonus += 5;
    }

    const matchedSkillsCount = Array.isArray(m.matchedSkills) ? m.matchedSkills.length : 0;
    const postedAtTime = opp.postedAt ? new Date(opp.postedAt).getTime() : 0;

    // Internal ranking score formula
    const rankingScore = (m.score * 1000) + (preferenceBonus * 10) + (matchedSkillsCount * 2);

    return {
      matchDoc: m,
      rankingScore,
      postedAtTime
    };
  });

  // 5. Sort recommendations by ranking score descending, then by postedAt time descending
  ranked.sort((a, b) => {
    if (b.rankingScore !== a.rankingScore) {
      return b.rankingScore - a.rankingScore;
    }
    return b.postedAtTime - a.postedAtTime;
  });

  // 6. Paginate results
  const total = ranked.length;
  const pages = Math.ceil(total / limit) || 0;
  const paginatedSlice = ranked.slice(skip, skip + limit);

  // 7. Format clean recommendation output structure
  const recommendations = paginatedSlice.map(item => {
    const m = item.matchDoc;
    const opp = m.opportunity;

    return {
      opportunity: {
        _id: opp._id,
        title: opp.title,
        company: opp.company,
        location: opp.location,
        type: opp.type,
        remote: opp.remote,
        description: opp.description,
        requirements: opp.requirements,
        applicationUrl: opp.applicationUrl,
        source: opp.source,
        postedAt: opp.postedAt
      },
      match: {
        score: m.score,
        matchLevel: m.matchLevel,
        matchedSkills: m.matchedSkills,
        missingSkills: m.missingSkills,
        reasons: m.reasons,
        recommendation: m.recommendation
      }
    };
  });

  return {
    count: recommendations.length,
    pagination: {
      page,
      limit,
      total,
      pages
    },
    recommendations
  };
};

module.exports = {
  getRecommendedOpportunitiesForUser
};
