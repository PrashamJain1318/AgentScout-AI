const mongoose = require('mongoose');
const Application = require('../models/Application.model');

/**
 * Generate dashboard application analytics using MongoDB aggregation pipelines.
 * @param {string|mongoose.Types.ObjectId} userId - Authenticated user ObjectId
 * @returns {Promise<Object>} Aggregated analytics data
 */
const getApplicationAnalytics = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Overview counts by status using MongoDB Aggregation
  const statusAggregation = await Application.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const overview = {
    total: 0,
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0
  };

  statusAggregation.forEach(item => {
    const status = item._id;
    const count = item.count;
    overview.total += count;
    if (overview[status] !== undefined) {
      overview[status] = count;
    }
  });

  // 2. Calculate rates safely: (X / applied) * 100
  const appliedCount = overview.applied || 0;

  const interviewRate = appliedCount > 0
    ? Number(((overview.interview / appliedCount) * 100).toFixed(1))
    : 0;

  const offerRate = appliedCount > 0
    ? Number(((overview.offer / appliedCount) * 100).toFixed(1))
    : 0;

  const rejectionRate = appliedCount > 0
    ? Number(((overview.rejected / appliedCount) * 100).toFixed(1))
    : 0;

  const rates = {
    interviewRate,
    offerRate,
    rejectionRate
  };

  // 3. Recent applications (Top 5) with opportunity lookup
  const recentApplications = await Application.find({ user: userObjectId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(5)
    .populate('opportunity', 'title company location type remote description requirements applicationUrl source postedAt');

  // 4. Company stats aggregation
  const companyStats = await Application.aggregate([
    { $match: { user: userObjectId } },
    {
      $lookup: {
        from: 'opportunities',
        localField: 'opportunity',
        foreignField: '_id',
        as: 'opportunityDoc'
      }
    },
    { $unwind: '$opportunityDoc' },
    {
      $group: {
        _id: '$opportunityDoc.company',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        company: '$_id',
        count: 1
      }
    }
  ]);

  // 5. Location stats aggregation
  const locationStats = await Application.aggregate([
    { $match: { user: userObjectId } },
    {
      $lookup: {
        from: 'opportunities',
        localField: 'opportunity',
        foreignField: '_id',
        as: 'opportunityDoc'
      }
    },
    { $unwind: '$opportunityDoc' },
    {
      $group: {
        _id: '$opportunityDoc.location',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        location: '$_id',
        count: 1
      }
    }
  ]);

  return {
    overview,
    rates,
    recentApplications,
    companyStats,
    locationStats
  };
};

module.exports = {
  getApplicationAnalytics
};
