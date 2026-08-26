const mongoose = require('mongoose');
const crypto = require('crypto');
const CareerAgentActionPackage = require('../models/CareerAgentActionPackage.model');

/**
 * Create Action Package for a workflow.
 */
const createActionPackage = async (userId, data = {}) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const packageId = `pkg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const pkg = new CareerAgentActionPackage({
    packageId,
    user: userObjectId,
    workflow: data.workflowId ? new mongoose.Types.ObjectId(data.workflowId) : null,
    opportunity: data.opportunityId ? new mongoose.Types.ObjectId(data.opportunityId) : null,
    application: data.applicationId ? new mongoose.Types.ObjectId(data.applicationId) : null,
    type: data.type || 'APPLICATION_PACKAGE',
    title: data.title || 'Career Action Package',
    matchAnalysis: data.matchAnalysis || {},
    resumeRecommendations: data.resumeRecommendations || {},
    coverLetter: {
      original: data.coverLetterText || '',
      edited: null,
      approved: null,
      version: 1
    },
    applicationAnswers: data.applicationAnswers || {},
    applicationStrategy: data.applicationStrategy || {},
    outreachMessage: {
      original: data.outreachText || '',
      edited: null,
      approved: null,
      version: 1
    },
    readinessScore: data.readinessScore || 85,
    risks: data.risks || [],
    approvalState: 'PENDING'
  });

  await pkg.save();
  return pkg;
};

/**
 * Get Action Package by packageId or ID with ownership check.
 */
const getActionPackage = async (userId, packageId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  let pkg = await CareerAgentActionPackage.findOne({ user: userObjectId, packageId })
    .populate('opportunity')
    .populate('application');

  if (!pkg && mongoose.Types.ObjectId.isValid(packageId)) {
    pkg = await CareerAgentActionPackage.findOne({ user: userObjectId, _id: packageId })
      .populate('opportunity')
      .populate('application');
  }

  if (!pkg) {
    const err = new Error('Action Package not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  return pkg;
};

/**
 * Update candidate edited content without overwriting original AI version.
 */
const updatePackageContent = async (userId, packageId, field, editedContent) => {
  const pkg = await getActionPackage(userId, packageId);

  if (!['coverLetter', 'outreachMessage', 'applicationAnswers'].includes(field)) {
    const err = new Error(`Invalid editable field: ${field}`);
    err.statusCode = 400;
    throw err;
  }

  if (field === 'coverLetter' || field === 'outreachMessage') {
    pkg[field].edited = editedContent;
    pkg[field].version = (pkg[field].version || 1) + 1;
  } else {
    pkg.applicationAnswers = editedContent;
  }

  pkg.approvalState = 'EDITED';
  await pkg.save();
  return pkg;
};

/**
 * Mark Action Package as approved.
 */
const approvePackage = async (userId, packageId) => {
  const pkg = await getActionPackage(userId, packageId);

  pkg.approvalState = 'APPROVED';
  pkg.approvedAt = new Date();

  if (pkg.coverLetter?.original) {
    pkg.coverLetter.approved = pkg.coverLetter.edited || pkg.coverLetter.original;
  }
  if (pkg.outreachMessage?.original) {
    pkg.outreachMessage.approved = pkg.outreachMessage.edited || pkg.outreachMessage.original;
  }

  await pkg.save();
  return pkg;
};

module.exports = {
  createActionPackage,
  getActionPackage,
  updatePackageContent,
  approvePackage
};
