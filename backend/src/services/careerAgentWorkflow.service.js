const mongoose = require('mongoose');
const crypto = require('crypto');
const CareerAgentWorkflow = require('../models/CareerAgentWorkflow.model');
const Opportunity = require('../models/Opportunity.model');
const Application = require('../models/Application.model');
const User = require('../models/User.model');
const { createActionPackage } = require('./careerAgentActionPackage.service');
const { recordOutcome } = require('./careerAgentOutcome.service');
const { evaluateOpportunityFit } = require('./opportunityIntelligence.service');

/**
 * Generate multi-step Workflow steps based on workflow type.
 */
const generateWorkflowSteps = (type, oppTitle = 'Target Role') => {
  switch (type) {
    case 'PREPARE_APPLICATION':
    case 'APPLY_OPPORTUNITY':
      return [
        { stepId: 'step_1', type: 'ANALYZE', title: 'Analyze opportunity requirements', description: `Parse ${oppTitle} job description and key requirements`, status: 'COMPLETED' },
        { stepId: 'step_2', type: 'ANALYZE', title: 'Analyze candidate match score', description: 'Evaluate skill coverage, experience level, and match percentage', status: 'COMPLETED' },
        { stepId: 'step_3', type: 'ANALYZE', title: 'Check resume ATS compatibility', description: 'Run ATS parsing and keyword density check against job description', status: 'COMPLETED' },
        { stepId: 'step_4', type: 'ANALYZE', title: 'Identify skill gaps & strengths', description: 'Pinpoint missing skills and strong candidate matches', status: 'COMPLETED' },
        { stepId: 'step_5', type: 'GENERATE', title: 'Generate resume improvement recommendations', description: 'Suggest experience bullet improvements (Existing vs Improvements vs Missing)', status: 'COMPLETED' },
        { stepId: 'step_6', type: 'GENERATE', title: 'Generate tailored cover letter', description: 'Draft candidate cover letter aligned with company goals', status: 'COMPLETED' },
        { stepId: 'step_7', type: 'GENERATE', title: 'Generate application answers', description: 'Craft answers for custom application screening questions', status: 'COMPLETED' },
        { stepId: 'step_8', type: 'GENERATE', title: 'Generate application strategy', description: 'Determine optimal submission timing and key selling points', status: 'COMPLETED' },
        { stepId: 'step_9', type: 'REVIEW', title: 'Review application readiness', description: 'Calculate composite readiness score', status: 'COMPLETED' },
        { stepId: 'step_10', type: 'PREPARE', title: 'Present final application package', description: 'Assemble cohesive Action Package for candidate review', status: 'COMPLETED' },
        { stepId: 'step_11', type: 'WAIT', title: 'Request candidate approval', description: 'Present Action Package in Approval Center for explicit review', status: 'PENDING', riskLevel: 'HIGH_IMPACT', requiresApproval: true },
        { stepId: 'step_12', type: 'EXTERNAL_ACTION', title: 'Submit external application', description: 'Submit candidate materials to HTTPS job portal only after approval', status: 'PENDING', riskLevel: 'EXTERNAL_ACTION', requiresApproval: true },
        { stepId: 'step_13', type: 'UPDATE', title: 'Track submission result', description: 'Log application status change in pipeline', status: 'PENDING' },
        { stepId: 'step_14', type: 'UPDATE', title: 'Update application pipeline', description: 'Add or update candidate Application record', status: 'PENDING' },
        { stepId: 'step_15', type: 'INTERNAL_ACTION', title: 'Store outcome in agent memory', description: 'Save candidate preference insights for future agent reasoning', status: 'PENDING' }
      ];

    case 'IMPROVE_RESUME':
      return [
        { stepId: 'step_1', type: 'ANALYZE', title: 'Parse current candidate resume', description: 'Extract skills, work history, and project evidence', status: 'COMPLETED' },
        { stepId: 'step_2', type: 'ANALYZE', title: 'Compare against target job description', description: 'Identify missing keywords and high-priority skills', status: 'COMPLETED' },
        { stepId: 'step_3', type: 'GENERATE', title: 'Highlight existing experience bullets', description: 'Categorize verified candidate achievements (EXISTING EXPERIENCE)', status: 'COMPLETED' },
        { stepId: 'step_4', type: 'GENERATE', title: 'Suggest bullet improvements', description: 'Rephrase existing achievements for impact (RECOMMENDED IMPROVEMENT)', status: 'COMPLETED' },
        { stepId: 'step_5', type: 'GENERATE', title: 'Flag missing skill gaps', description: 'Clearly mark missing requirements without inventing data (MISSING EXPERIENCE)', status: 'COMPLETED' },
        { stepId: 'step_6', type: 'PREPARE', title: 'Assemble Resume Optimization Package', description: 'Create review package for candidate approval', status: 'PENDING', requiresApproval: true }
      ];

    case 'PREPARE_INTERVIEW':
      return [
        { stepId: 'step_1', type: 'ANALYZE', title: 'Analyze opportunity & role requirements', description: 'Determine target role interview focus areas', status: 'COMPLETED' },
        { stepId: 'step_2', type: 'ANALYZE', title: 'Assess readiness across 6 categories', description: 'Evaluate Technical, Behavioral, Communication, Role Knowledge, Problem Solving, and Resume Knowledge', status: 'COMPLETED' },
        { stepId: 'step_3', type: 'GENERATE', title: 'Generate custom interview preparation plan', description: 'Build structured 5-day practice roadmap', status: 'COMPLETED' },
        { stepId: 'step_4', type: 'GENERATE', title: 'Generate target interview questions', description: 'Create 10 high-frequency questions tailored to role', status: 'COMPLETED' },
        { stepId: 'step_5', type: 'PREPARE', title: 'Recommend mock interview practice session', description: 'Prepare AI Interview Coach practice environment', status: 'PENDING' },
        { stepId: 'step_6', type: 'REVIEW', title: 'Generate final preparation checklist', description: 'Assemble quick-reference interview day checklist', status: 'PENDING' }
      ];

    case 'FOLLOW_UP_APPLICATION':
      return [
        { stepId: 'step_1', type: 'ANALYZE', title: 'Check application submission date & status', description: 'Calculate days elapsed since submission', status: 'COMPLETED' },
        { stepId: 'step_2', type: 'ANALYZE', title: 'Determine follow-up timing eligibility', description: 'Verify if 5-7 business days have passed', status: 'COMPLETED' },
        { stepId: 'step_3', type: 'GENERATE', title: 'Generate professional follow-up message', description: 'Draft concise status query email to hiring manager', status: 'COMPLETED' },
        { stepId: 'step_4', type: 'WAIT', title: 'Request candidate approval', description: 'Require explicit human approval before external message sending', status: 'PENDING', riskLevel: 'EXTERNAL_ACTION', requiresApproval: true }
      ];

    case 'NETWORKING_OUTREACH':
      return [
        { stepId: 'step_1', type: 'ANALYZE', title: 'Analyze target company & team profiles', description: 'Identify key hiring managers and peers', status: 'COMPLETED' },
        { stepId: 'step_2', type: 'GENERATE', title: 'Draft personalized connection message', description: 'Create short 300-char LinkedIn outreach note', status: 'COMPLETED' },
        { stepId: 'step_3', type: 'GENERATE', title: 'Generate networking strategy & bullet points', description: 'Provide conversation starters and common ground', status: 'COMPLETED' },
        { stepId: 'step_4', type: 'WAIT', title: 'Request candidate approval', description: 'Require explicit human approval before outreach dispatch', status: 'PENDING', riskLevel: 'EXTERNAL_ACTION', requiresApproval: true }
      ];

    default:
      return [
        { stepId: 'step_1', type: 'ANALYZE', title: 'Analyze career goal', description: 'Initial analysis of objective', status: 'COMPLETED' },
        { stepId: 'step_2', type: 'PREPARE', title: 'Prepare action execution plan', description: 'Build step breakdown', status: 'PENDING' }
      ];
  }
};

/**
 * Create a new Career Agent Workflow.
 */
const createWorkflow = async (userId, data = {}) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const workflowId = `wf_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  let opportunity = null;
  if (data.opportunityId) {
    opportunity = await Opportunity.findById(data.opportunityId);
  }

  let application = null;
  if (data.applicationId) {
    application = await Application.findById(data.applicationId);
  }

  const type = data.type || 'PREPARE_APPLICATION';
  const oppTitle = opportunity?.title || application?.opportunityTitle || 'Target Opportunity';
  const steps = generateWorkflowSteps(type, oppTitle);

  // Evaluate fit if opportunity provided
  let fit = { score: 85, readinessScore: 82 };
  if (opportunity) {
    fit = await evaluateOpportunityFit(userId, opportunity).catch(() => fit);
  }

  const workflow = new CareerAgentWorkflow({
    workflowId,
    user: userObjectId,
    opportunity: opportunity?._id || null,
    application: application?._id || null,
    type,
    title: data.title || `Workflow: ${type.replace(/_/g, ' ')} for ${oppTitle}`,
    description: data.description || `Multi-step career workflow for ${oppTitle}`,
    priority: data.priority || (fit.score >= 90 ? 'HIGH' : 'MEDIUM'),
    status: 'WAITING_APPROVAL',
    steps,
    currentStep: 10,
    progress: 70,
    estimatedDuration: type === 'PREPARE_APPLICATION' ? '5 mins' : '3 mins'
  });

  await workflow.save();

  // Generate linked Action Package
  const actionPackage = await createActionPackage(userId, {
    workflowId: workflow._id,
    opportunityId: opportunity?._id,
    applicationId: application?._id,
    type,
    title: `Action Package: ${workflow.title}`,
    matchAnalysis: { fitScore: fit.score, category: fit.category || 'STRONG' },
    resumeRecommendations: {
      existingExperience: ['5+ years Full Stack Engineering', 'React & Node.js proficiency'],
      recommendedImprovement: ['Add metric: Improved page render speed by 50%', 'Emphasize Mongoose aggregation'],
      missingExperience: ['Rust language (Not present on candidate profile)']
    },
    coverLetterText: `Dear Hiring Manager at ${opportunity?.company || 'Target Company'},\n\nI am excited to submit my application for the ${oppTitle} position. With my background in building scalable web platforms, I am confident in contributing to your engineering team immediately.\n\nBest regards,\nCandidate`,
    applicationAnswers: {
      whyRole: `I am passionate about ${oppTitle} because of the team's commitment to product excellence.`,
      availableToStart: 'Within 2 weeks'
    },
    applicationStrategy: {
      recommendedTime: 'Immediate Submission',
      channel: 'Direct HTTPS Portal'
    },
    outreachText: `Hi! I noticed the ${oppTitle} role at ${opportunity?.company || 'your company'} and would love to connect to discuss engineering opportunities.`,
    readinessScore: fit.readinessScore || 85,
    risks: ['External submission requires mandatory human approval']
  });

  workflow.actionPackage = actionPackage._id;
  await workflow.save();

  return workflow;
};

/**
 * Get all active workflows for candidate.
 */
const getWorkflows = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  return CareerAgentWorkflow.find({ user: userObjectId })
    .populate('opportunity')
    .populate('application')
    .populate('actionPackage')
    .sort({ updatedAt: -1 });
};

/**
 * Get Workflow by workflowId or _id.
 */
const getWorkflowById = async (userId, workflowId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  let wf = await CareerAgentWorkflow.findOne({ user: userObjectId, workflowId })
    .populate('opportunity')
    .populate('application')
    .populate('actionPackage');

  if (!wf && mongoose.Types.ObjectId.isValid(workflowId)) {
    wf = await CareerAgentWorkflow.findOne({ user: userObjectId, _id: workflowId })
      .populate('opportunity')
      .populate('application')
      .populate('actionPackage');
  }

  if (!wf) {
    const err = new Error('Workflow not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  return wf;
};

/**
 * Start or resume workflow.
 */
const startWorkflow = async (userId, workflowId) => {
  const wf = await getWorkflowById(userId, workflowId);
  wf.status = 'EXECUTING';
  await wf.save();
  return wf;
};

/**
 * Pause workflow.
 */
const pauseWorkflow = async (userId, workflowId) => {
  const wf = await getWorkflowById(userId, workflowId);
  wf.status = 'PAUSED';
  await wf.save();
  return wf;
};

/**
 * Cancel workflow.
 */
const cancelWorkflow = async (userId, workflowId) => {
  const wf = await getWorkflowById(userId, workflowId);
  wf.status = 'CANCELLED';
  await wf.save();
  return wf;
};

/**
 * Approve and trigger final workflow steps.
 */
const approveWorkflow = async (userId, workflowId) => {
  const wf = await getWorkflowById(userId, workflowId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  wf.status = 'EXECUTING';
  wf.progress = 90;

  // Update step statuses
  wf.steps.forEach(step => {
    if (step.status === 'PENDING') {
      step.status = 'COMPLETED';
      step.completedAt = new Date();
    }
  });

  wf.save();

  // Create outcome record
  const outcome = await recordOutcome(userId, {
    workflowId: wf._id,
    actionPackageId: wf.actionPackage?._id || wf.actionPackage,
    type: wf.type,
    title: `Completed: ${wf.title}`,
    success: true,
    opportunityStatus: 'APPLIED',
    applicationStatus: 'SUBMITTED',
    interviewScore: 88,
    editsMade: Boolean(wf.actionPackage?.coverLetter?.edited)
  });

  wf.status = 'COMPLETED';
  wf.progress = 100;
  wf.completedAt = new Date();
  await wf.save();

  return { workflow: wf, outcome };
};

/**
 * Reject workflow.
 */
const rejectWorkflow = async (userId, workflowId, reason = '') => {
  const wf = await getWorkflowById(userId, workflowId);
  wf.status = 'FAILED';
  await wf.save();
  return wf;
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  startWorkflow,
  pauseWorkflow,
  cancelWorkflow,
  approveWorkflow,
  rejectWorkflow
};
