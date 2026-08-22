const mongoose = require('mongoose');
const applicationService = require('../services/application.service');
const applicationAnalyticsService = require('../services/applicationAnalytics.service');
const notificationService = require('../services/notification.service');

const allowedStatuses = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'accepted',
  'rejected',
  'withdrawn'
];

const checkNoMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) {
      const error = new Error(
        `Invalid request parameter: Mongo operators (${key}) are forbidden`
      );

      error.statusCode = 400;
      throw error;
    }
  }
};

const createApplication = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);

    const userId = req.user.id || req.user._id;

    const {
      opportunity,
      jobTitle,
      company,
      location,
      jobType,
      workMode,
      jobUrl,
      matchScore,
      status = 'saved',
      appliedAt = null,
      applicationUrl = '',
      notes = ''
    } = req.body || {};

    if (opportunity && !mongoose.Types.ObjectId.isValid(opportunity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID format'
      });
    }

    if (!opportunity && (!jobTitle || !company)) {
      return res.status(400).json({
        success: false,
        message: 'Job Title and Company are required for custom applications'
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    if (notes && typeof notes !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'notes must be a string'
      });
    }

    const application = await applicationService.createApplication(
      userId,
      {
        opportunity,
        jobTitle,
        company,
        location,
        jobType,
        workMode,
        jobUrl,
        matchScore,
        status,
        appliedAt,
        applicationUrl: applicationUrl || jobUrl || '',
        notes
      }
    );

    // Dispatch automatic application creation notification
    const job = application.jobTitle || 'Opportunity';
    const companyName = application.company || 'Employer';
    notificationService.createNotification({
      user: userId,
      type: 'application_created',
      title: 'Application Added',
      message: `Your application for ${job} at ${companyName} has been added to your career pipeline.`,
      link: `/dashboard/applications/${application._id}`
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      application
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);

    const userId = req.user.id || req.user._id;

    const { status, jobType, search, sort } = req.query;

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const applications =
      await applicationService.getUserApplications(
        userId,
        { status, jobType, search, sort }
      );

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

const getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }

    const userId = req.user.id || req.user._id;

    const application =
      await applicationService.getApplicationById(
        id,
        userId
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationAnalytics = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.query);

    const userId = req.user.id || req.user._id;

    const analytics =
      await applicationAnalyticsService.getApplicationAnalytics(userId);

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }

    const userId = req.user.id || req.user._id;

    const allowedFields = [
      'status',
      'appliedAt',
      'applicationUrl',
      'jobUrl',
      'notes',
      'jobTitle',
      'company',
      'location',
      'jobType',
      'workMode',
      'matchScore'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.status &&
      !allowedStatuses.includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const application =
      await applicationService.updateApplication(
        id,
        userId,
        updates
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Dispatch status update notification if status changed
    if (updates.status) {
      const job = application.jobTitle || 'Opportunity';
      const companyName = application.company || 'Employer';
      const status = updates.status;

      let notifType = 'application_status';
      let title = 'Application Status Updated';
      let message = `Your application for ${job} at ${companyName} moved to ${status}.`;

      if (status === 'screening') {
        notifType = 'application_status';
        title = 'Application Moved to Screening';
        message = `Your application for ${job} at ${companyName} moved to screening.`;
      } else if (status === 'interview') {
        notifType = 'interview';
        title = 'Interview Scheduled';
        message = `Your application for ${job} at ${companyName} moved to interview.`;
      } else if (status === 'offer' || status === 'accepted') {
        notifType = 'offer';
        title = 'Job Offer Received';
        message = `Congratulations! Your application for ${job} at ${companyName} received an offer.`;
      } else if (status === 'rejected') {
        notifType = 'application_status';
        title = 'Application Status Updated';
        message = `Your application for ${job} at ${companyName} was marked as rejected.`;
      } else if (status === 'withdrawn') {
        notifType = 'application_status';
        title = 'Application Withdrawn';
        message = `Your application for ${job} at ${companyName} was withdrawn.`;
      }

      notificationService.createNotification({
        user: userId,
        type: notifType,
        title,
        message,
        link: `/dashboard/applications/${application._id}`
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }

    const userId = req.user.id || req.user._id;

    const deleted =
      await applicationService.deleteApplication(
        id,
        userId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplication,
  getApplicationAnalytics,
  updateApplication,
  deleteApplication
};
