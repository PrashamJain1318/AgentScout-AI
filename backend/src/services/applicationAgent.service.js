const ApplicationAgent = require('../models/ApplicationAgent.model');
const ApplicationAgentTask = require('../models/ApplicationAgentTask.model');
const ApplicationDraft = require('../models/ApplicationDraft.model');
const ApplicationAgentMemory = require('../models/ApplicationAgentMemory.model');
const Opportunity = require('../models/Opportunity.model');
const { buildApplicationAgentContext } = require('./applicationAgentContext.service');
const { evaluateApplicationDecision } = require('./applicationAgentDecision.service');
const mongoose = require('mongoose');

/**
 * Core Application Agent Service
 */
const getOrCreateAgent = async (userId) => {
  if (!userId) throw new Error('UserId is required');

  let agent = await ApplicationAgent.findOne({ user: userId });
  if (!agent) {
    agent = await ApplicationAgent.create({
      user: userId,
      enabled: true,
      status: 'IDLE',
      mode: 'ASSISTED',
      readinessMetrics: {
        overall: 70,
        resume: 75,
        skills: 80,
        experience: 70,
        projects: 65,
        ats: 75,
        interview: 70
      },
      preferences: {
        minimumMatchScore: 75,
        autoPrepareSafeActions: true,
        preferredTone: 'PROFESSIONAL',
        preferredResumeStyle: 'MODERN_ATS'
      }
    });
  }
  return agent;
};

const updateAgentMode = async (userId, mode) => {
  const validModes = ['MANUAL', 'ASSISTED', 'AUTONOMOUS'];
  if (!validModes.includes(mode)) {
    const err = new Error(`Invalid agent mode: ${mode}`);
    err.statusCode = 400;
    throw err;
  }

  const agent = await getOrCreateAgent(userId);
  agent.mode = mode;
  agent.enabled = true;
  if (agent.status === 'PAUSED') {
    agent.status = 'IDLE';
  }
  await agent.save();
  return agent;
};

const setAgentStatus = async (userId, status) => {
  const validStatuses = ['IDLE', 'ANALYZING', 'PREPARING', 'WAITING_FOR_APPROVAL', 'EXECUTING', 'VERIFYING', 'COMPLETED', 'FAILED', 'PAUSED'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid agent status: ${status}`);
    err.statusCode = 400;
    throw err;
  }

  const agent = await getOrCreateAgent(userId);
  
  // Prevent invalid state transitions
  if (agent.status === 'FAILED' && status === 'EXECUTING') {
    const err = new Error('Cannot transition directly from FAILED to EXECUTING. Reset agent status to IDLE first.');
    err.statusCode = 400;
    throw err;
  }

  agent.status = status;
  if (status === 'PAUSED') {
    agent.enabled = false;
  }
  await agent.save();
  return agent;
};

const analyzeOpportunity = async (userId, opportunityId) => {
  if (opportunityId && !mongoose.Types.ObjectId.isValid(opportunityId)) {
    const err = new Error('Invalid Opportunity ID format');
    err.statusCode = 400;
    throw err;
  }

  const agent = await getOrCreateAgent(userId);
  agent.status = 'ANALYZING';
  if (opportunityId) {
    agent.currentOpportunity = opportunityId;
  }
  agent.lastRunAt = new Date();
  await agent.save();

  const context = await buildApplicationAgentContext(userId, opportunityId || agent.currentOpportunity);
  const decision = evaluateApplicationDecision(context, agent.preferences?.minimumMatchScore || 75);

  agent.readinessMetrics = context.readinessMetrics;
  agent.status = 'IDLE';
  agent.statistics.applicationsAnalyzed += 1;
  await agent.save();

  // Create Task record
  await ApplicationAgentTask.create({
    user: userId,
    agent: agent._id,
    opportunity: opportunityId || agent.currentOpportunity,
    type: 'ANALYZE_OPPORTUNITY',
    title: `Analyzed ${context.opportunity?.title || 'Target Opportunity'}`,
    description: decision.description,
    priority: decision.priority,
    status: 'COMPLETED',
    riskLevel: decision.riskLevel,
    requiresApproval: decision.requiresApproval,
    metadata: { decision },
    completedAt: new Date()
  });

  return {
    agent,
    context,
    decision
  };
};

const runApplicationAgent = async (userId, opportunityId = null) => {
  if (opportunityId && !mongoose.Types.ObjectId.isValid(opportunityId)) {
    const err = new Error('Invalid Opportunity ID format');
    err.statusCode = 400;
    throw err;
  }

  const agent = await getOrCreateAgent(userId);
  const targetOppId = opportunityId || agent.currentOpportunity;
  
  agent.status = 'PREPARING';
  agent.lastRunAt = new Date();
  await agent.save();

  const context = await buildApplicationAgentContext(userId, targetOppId);
  const decision = evaluateApplicationDecision(context, agent.preferences?.minimumMatchScore || 75);

  let draft = null;
  if (context.opportunity && !context.applications.alreadyApplied) {
    // Determine latest draft version safely without overwriting
    const existingDrafts = await ApplicationDraft.find({
      user: userId,
      opportunity: context.opportunity.id,
      type: 'COVER_LETTER'
    }).sort({ version: -1 });

    const nextVersion = existingDrafts.length > 0 ? existingDrafts[0].version + 1 : 1;

    const draftContent = {
      coverLetter: `Dear Hiring Manager at ${context.opportunity.company},\n\nI am writing to express my enthusiasm for the ${context.opportunity.title} position. My background aligns closely with your team's key requirements, including ${context.candidate.skills.slice(0, 3).join(', ')}.\n\nBest regards,\n${context.candidate.name}`,
      screeningAnswers: [
        { question: 'Relevant experience?', answer: `${context.candidate.experience.length || 3}+ years of software development experience.` }
      ]
    };

    draft = await ApplicationDraft.create({
      user: userId,
      opportunity: context.opportunity.id,
      type: 'COVER_LETTER',
      title: `Cover Letter v${nextVersion} — ${context.opportunity.company} (${context.opportunity.title})`,
      content: draftContent,
      version: nextVersion,
      status: 'DRAFT',
      generatedBy: 'AI',
      approvedByUser: false
    });

    agent.statistics.applicationsPrepared += 1;
    agent.lastActionAt = new Date();
  }

  // Create Task Record
  const task = await ApplicationAgentTask.create({
    user: userId,
    agent: agent._id,
    opportunity: targetOppId,
    type: decision.actionType === 'OPTIMIZE_RESUME' ? 'OPTIMIZE_RESUME' : 'GENERATE_COVER_LETTER',
    title: decision.title,
    description: decision.description,
    priority: decision.priority,
    status: 'COMPLETED',
    riskLevel: decision.riskLevel,
    requiresApproval: decision.requiresApproval,
    metadata: { decision, draftId: draft?._id },
    completedAt: new Date()
  });

  // Store Memory
  await ApplicationAgentMemory.create({
    user: userId,
    agent: agent._id,
    type: 'BEHAVIOR',
    key: `APPLICATION_PREPARATION_${context.opportunity?.company || 'GENERAL'}`,
    value: `Executed Application Agent for ${context.opportunity?.title || 'Role'} (Match: ${context.match.score}%)`,
    confidence: 0.85,
    source: 'AGENT_EXECUTION'
  });

  agent.status = decision.requiresApproval ? 'WAITING_FOR_APPROVAL' : 'IDLE';
  await agent.save();

  return {
    agent,
    context,
    decision,
    draft,
    task
  };
};

const getAgentTasks = async (userId, filter = {}) => {
  const query = { user: userId };
  if (filter.status) query.status = filter.status;
  if (filter.opportunityId && mongoose.Types.ObjectId.isValid(filter.opportunityId)) {
    query.opportunity = filter.opportunityId;
  }

  return ApplicationAgentTask.find(query).sort({ createdAt: -1 }).limit(30).lean();
};

const getAgentMemories = async (userId) => {
  return ApplicationAgentMemory.find({ user: userId }).sort({ createdAt: -1 }).lean();
};

const deleteAgentMemory = async (userId, memoryId) => {
  if (!memoryId || !mongoose.Types.ObjectId.isValid(memoryId)) {
    const err = new Error('Invalid Memory ID format');
    err.statusCode = 400;
    throw err;
  }

  const memory = await ApplicationAgentMemory.findOneAndDelete({ _id: memoryId, user: userId });
  if (!memory) {
    const err = new Error('Memory record not found or access denied');
    err.statusCode = 404;
    throw err;
  }
  return { success: true, message: 'Candidate memory record deleted successfully' };
};

const getAgentDrafts = async (userId, opportunityId = null) => {
  const query = { user: userId };
  if (opportunityId && mongoose.Types.ObjectId.isValid(opportunityId)) {
    query.opportunity = opportunityId;
  }
  return ApplicationDraft.find(query).sort({ version: -1, createdAt: -1 }).lean();
};

module.exports = {
  getOrCreateAgent,
  updateAgentMode,
  setAgentStatus,
  analyzeOpportunity,
  runApplicationAgent,
  getAgentTasks,
  getAgentMemories,
  deleteAgentMemory,
  getAgentDrafts
};
