const Application = require('../models/Application.model');
const Opportunity = require('../models/Opportunity.model');

const createApplication = async (userId, payload) => {
  const {
    opportunity,
    jobTitle = '',
    company = '',
    location = 'Remote',
    jobType = 'job',
    workMode = 'remote',
    jobUrl = '',
    matchScore = 0,
    status = 'saved',
    appliedAt = null,
    applicationUrl = '',
    notes = ''
  } = payload;

  let opportunityExists = null;
  if (opportunity) {
    opportunityExists = await Opportunity.findById(opportunity);
    if (!opportunityExists) {
      const error = new Error('Opportunity not found');
      error.statusCode = 404;
      throw error;
    }
  }

  const initialTimeline = [
    {
      status,
      date: new Date(),
      note: 'Application created'
    }
  ];

  if (opportunity) {
    const existingApp = await Application.findOne({ user: userId, opportunity });

    let finalAppliedAt = appliedAt;
    if (!finalAppliedAt && existingApp && existingApp.appliedAt) {
      finalAppliedAt = existingApp.appliedAt;
    } else if (!finalAppliedAt && status === 'applied') {
      finalAppliedAt = new Date();
    }

    const application = await Application.findOneAndUpdate(
      {
        user: userId,
        opportunity
      },
      {
        $set: {
          status,
          appliedAt: finalAppliedAt,
          applicationUrl: applicationUrl || (existingApp ? existingApp.applicationUrl : (opportunityExists.applicationUrl || '')),
          notes
        },
        $setOnInsert: {
          user: userId,
          opportunity,
          timeline: initialTimeline
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    ).populate(
      'opportunity',
      'title company location type remote description requirements applicationUrl source postedAt'
    );

    return application;
  }

  // Custom application creation (without linked opportunity ref)
  let finalAppliedAt = appliedAt;
  if (!finalAppliedAt && (status === 'applied' || status === 'screening' || status === 'interview' || status === 'offer')) {
    finalAppliedAt = new Date();
  }

  const newApp = await Application.create({
    user: userId,
    opportunity: null,
    jobTitle: jobTitle.trim(),
    company: company.trim(),
    location: location || 'Remote',
    jobType,
    workMode,
    jobUrl: jobUrl || applicationUrl || '',
    matchScore,
    status,
    appliedAt: finalAppliedAt,
    applicationUrl: applicationUrl || jobUrl || '',
    notes,
    timeline: initialTimeline
  });

  return newApp;
};

const getUserApplications = async (userId, filters = {}) => {
  const query = {
    user: userId
  };

  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }

  let apps = await Application.find(query)
    .populate(
      'opportunity',
      'title company location type remote description requirements applicationUrl source postedAt'
    )
    .sort({
      updatedAt: -1,
      createdAt: -1
    });

  // Search filter
  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase();
    apps = apps.filter(app => {
      const title = (app.jobTitle || app.opportunity?.title || '').toLowerCase();
      const comp = (app.company || app.opportunity?.company || '').toLowerCase();
      const loc = (app.location || app.opportunity?.location || '').toLowerCase();
      return title.includes(s) || comp.includes(s) || loc.includes(s);
    });
  }

  // Sorting
  if (filters.sort === 'oldest') {
    apps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (filters.sort === 'company-az') {
    apps.sort((a, b) => {
      const compA = (a.company || a.opportunity?.company || '').toLowerCase();
      const compB = (b.company || b.opportunity?.company || '').toLowerCase();
      return compA.localeCompare(compB);
    });
  } else if (filters.sort === 'company-za') {
    apps.sort((a, b) => {
      const compA = (a.company || a.opportunity?.company || '').toLowerCase();
      const compB = (b.company || b.opportunity?.company || '').toLowerCase();
      return compB.localeCompare(compA);
    });
  }

  return apps;
};

const getApplicationById = async (applicationId, userId) => {
  return Application.findOne({
    _id: applicationId,
    user: userId
  }).populate(
    'opportunity',
    'title company location type remote description requirements applicationUrl source postedAt'
  );
};

const updateApplication = async (applicationId, userId, updates = {}) => {
  const existingApp = await Application.findOne({
    _id: applicationId,
    user: userId
  });

  if (!existingApp) {
    return null;
  }

  const { status, appliedAt, applicationUrl, jobUrl, notes, jobTitle, company, location, jobType, workMode, matchScore } = updates;

  if (status && status !== existingApp.status) {
    existingApp.status = status;
    existingApp.timeline.push({
      status,
      date: new Date(),
      note: notes || `Status updated to ${status}`
    });
  }

  if (appliedAt !== undefined) existingApp.appliedAt = appliedAt;
  if (!existingApp.appliedAt && (status === 'applied' || status === 'screening' || status === 'interview' || status === 'offer')) {
    existingApp.appliedAt = new Date();
  }
  if (applicationUrl !== undefined) existingApp.applicationUrl = applicationUrl;
  if (jobUrl !== undefined) existingApp.jobUrl = jobUrl;
  if (notes !== undefined) existingApp.notes = notes;
  if (jobTitle !== undefined) existingApp.jobTitle = jobTitle;
  if (company !== undefined) existingApp.company = company;
  if (location !== undefined) existingApp.location = location;
  if (jobType !== undefined) existingApp.jobType = jobType;
  if (workMode !== undefined) existingApp.workMode = workMode;
  if (matchScore !== undefined) existingApp.matchScore = matchScore;

  await existingApp.save();

  return Application.findById(existingApp._id).populate(
    'opportunity',
    'title company location type remote description requirements applicationUrl source postedAt'
  );
};

const deleteApplication = async (applicationId, userId) => {
  const result = await Application.deleteOne({
    _id: applicationId,
    user: userId
  });

  return result.deletedCount === 1;
};

module.exports = {
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplication,
  deleteApplication
};
