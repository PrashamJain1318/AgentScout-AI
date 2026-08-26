const mongoose = require('mongoose');
const crypto = require('crypto');
const CareerAgentAction = require('../models/CareerAgentAction.model');
const CareerAgentWorkflow = require('../models/CareerAgentWorkflow.model');
const CareerAgentActionPackage = require('../models/CareerAgentActionPackage.model');
const CareerAgentActivity = require('../models/CareerAgentActivity.model');
const { processLearningFromRejection } = require('./careerAgentLearning.service');

/**
 * Validate External Destination URL safety.
 */
const validateExternalDestination = (targetUrl) => {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { valid: true, host: 'Internal Execution' };
  }

  const trimmed = targetUrl.trim().toLowerCase();

  // Reject unsafe schemes
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('http://')
  ) {
    const err = new Error('Security Error: Only secure HTTPS URLs are permitted for external action execution');
    err.statusCode = 400;
    throw err;
  }

  // Reject localhost and private IP addresses
  if (
    trimmed.includes('localhost') ||
    trimmed.includes('127.0.0.1') ||
    trimmed.includes('0.0.0.0') ||
    trimmed.includes('192.168.') ||
    trimmed.includes('10.0.')
  ) {
    const err = new Error('Security Error: Private or local IP destinations are forbidden for external actions');
    err.statusCode = 400;
    throw err;
  }

  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'https:') {
      const err = new Error('Security Error: Protocol must be HTTPS');
      err.statusCode = 400;
      throw err;
    }
    return { valid: true, host: parsed.hostname };
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error('Security Error: Invalid target URL formatting');
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Get aggregated items requiring human approval.
 */
const getApprovalCenterData = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [pendingActions, waitingWorkflows, pendingPackages] = await Promise.all([
    CareerAgentAction.find({ user: userObjectId, status: { $in: ['PENDING', 'PENDING_APPROVAL'] } })
      .populate('opportunity')
      .populate('application')
      .sort({ priorityScore: -1 }),
    CareerAgentWorkflow.find({ user: userObjectId, status: 'WAITING_APPROVAL' })
      .populate('opportunity')
      .populate('application')
      .sort({ updatedAt: -1 }),
    CareerAgentActionPackage.find({
      user: userObjectId,
      approvalState: { $in: ['PENDING', 'EDITED'] }
    })
      .populate('opportunity')
      .populate('application')
      .sort({ updatedAt: -1 })
  ]);

  return {
    pendingActionsCount: pendingActions.length,
    waitingWorkflowsCount: waitingWorkflows.length,
    pendingPackagesCount: pendingPackages.length,
    totalPendingCount: pendingActions.length + waitingWorkflows.length + pendingPackages.length,
    pendingActions,
    waitingWorkflows,
    pendingPackages
  };
};

/**
 * Generate Action Preview for a pending action or workflow step.
 */
const generateActionPreview = async (userId, actionId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let action = await CareerAgentAction.findOne({ user: userObjectId, actionId }).populate('opportunity');
  
  if (!action && mongoose.Types.ObjectId.isValid(actionId)) {
    action = await CareerAgentAction.findOne({ user: userObjectId, _id: actionId }).populate('opportunity');
  }

  if (!action) {
    const err = new Error('Action not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  const destCheck = validateExternalDestination(action.payload?.targetUrl || action.payload?.applyUrl);

  return {
    actionId: action.actionId || action._id,
    title: action.title,
    description: action.description,
    riskLevel: action.riskLevel,
    category: action.category,
    reasoning: action.reasoning || 'Agent recommended this action based on candidate career context and match score.',
    informationUsed: action.payload?.dataUsed || [
      'Candidate Profile & Skills',
      'Resume Summary',
      'Opportunity Match Score'
    ],
    destinationHost: destCheck.host,
    expectedImpact: action.impactDescription || 'Advances candidate career pipeline momentum.',
    isCancellable: true,
    action
  };
};

/**
 * Approve Action with safety safeguards and idempotency key.
 */
const approveAction = async (userId, actionId, candidateNotes = '') => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let action = await CareerAgentAction.findOne({ user: userObjectId, actionId });
  
  if (!action && mongoose.Types.ObjectId.isValid(actionId)) {
    action = await CareerAgentAction.findOne({ user: userObjectId, _id: actionId });
  }

  if (!action) {
    const err = new Error('Action not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  if (action.status === 'APPROVED' || action.status === 'EXECUTED') {
    return { success: true, message: 'Action already approved', action };
  }

  // Validate security destination if external
  if (action.riskLevel === 'EXTERNAL_ACTION' || action.category === 'EXTERNAL_ACTION') {
    const payloadObj = action.inputPayload || action.payload || {};
    validateExternalDestination(payloadObj.targetUrl || payloadObj.applyUrl);
  }

  action.status = 'APPROVED';
  if (Array.isArray(action.approvalHistory)) {
    action.approvalHistory.push({
      action: 'APPROVED',
      timestamp: new Date(),
      userNotes: candidateNotes
    });
  }

  const idempotencyKey = `idemp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  action.inputPayload = { ...(action.inputPayload || action.payload || {}), idempotencyKey };

  await action.save();

  // Record audit log activity
  await CareerAgentActivity.create({
    user: userObjectId,
    activityType: 'ACTION_APPROVED',
    title: `Approved Action: ${action.title}`,
    description: `Candidate approved ${action.riskLevel} action.`,
    metadata: { actionId: action._id, riskLevel: action.riskLevel, idempotencyKey }
  }).catch(() => {});

  return {
    success: true,
    message: 'Action approved successfully',
    idempotencyKey,
    action
  };
};

/**
 * Reject Action with learning feedback.
 */
const rejectAction = async (userId, actionId, rejectionReason = '') => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let action = await CareerAgentAction.findOne({ user: userObjectId, actionId });
  
  if (!action && mongoose.Types.ObjectId.isValid(actionId)) {
    action = await CareerAgentAction.findOne({ user: userObjectId, _id: actionId });
  }

  if (!action) {
    const err = new Error('Action not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  action.status = 'REJECTED';
  if (Array.isArray(action.approvalHistory)) {
    action.approvalHistory.push({
      action: 'REJECTED',
      timestamp: new Date(),
      userNotes: rejectionReason
    });
  }
  await action.save();

  // Audit activity
  await CareerAgentActivity.create({
    user: userObjectId,
    activityType: 'ACTION_REJECTED',
    title: `Rejected Action: ${action.title}`,
    description: `Candidate rejected action. Reason: ${rejectionReason || 'No reason provided'}`,
    metadata: { actionId: action._id, rejectionReason }
  }).catch(() => {});

  // Trigger agent learning
  await processLearningFromRejection(userId, action.type || action.category || 'ACTION', rejectionReason).catch(() => {});

  return {
    success: true,
    message: 'Action rejected successfully',
    action
  };
};

module.exports = {
  validateExternalDestination,
  getApprovalCenterData,
  generateActionPreview,
  approveAction,
  rejectAction
};
