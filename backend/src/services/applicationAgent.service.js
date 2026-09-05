const ApplicationAgent = require('../models/ApplicationAgent.model');
const ApplicationAgentTask = require('../models/ApplicationAgentTask.model');
const ApplicationDraft = require('../models/ApplicationDraft.model');
const ApplicationAgentMemory = require('../models/ApplicationAgentMemory.model');
const Opportunity = require('../models/Opportunity.model');
const { buildApplicationAgentContext } = require('./applicationAgentContext.service');
const { evaluateApplicationDecision } = require('./applicationAgentDecision.service');

/**
 * Core Application Agent Orchestrator
 */
const getOrCreateAgent = async (userId) => {
  let agent = await ApplicationAgent.findOne({ user: userId });
  if (!agent) {
    agent = await ApplicationAgent.create({
      user: userId,
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
      }
    });
  }
  return agent;
};

const updateAgentMode = async (userId, mode) => {
  const agent = await getOrCreateAgent(userId);
  agent.mode = mode;
  await agent.save();
  return agent;
};

const setAgentStatus = async (userId, status) => {
  const agent = await getOrCreateAgent(userId);
  agent.status = status;
  await agent.save();
  return agent;
};

const analyzeOpportunity = async (userId, opportunityId) => {
  const agent = await getOrCreateAgent(userId);
  agent.status = 'ANALYZING';
  if (opportunityId) {
    agent.currentOpportunity = opportunityId;
  }
  await agent.save();

  const context = await buildApplicationAgentContext(userId, opportunityId || agent.currentOpportunity);
  const decision = evaluateApplicationDecision(context);

  agent.readinessMetrics = context.readinessMetrics;
  agent.status = 'IDLE';
  agent.statistics.applicationsAnalyzed += 1;
  agent.lastAnalyzedAt = new Date();
  await agent.save();

  // Create audit task
  await ApplicationAgentTask.create({
    user: userId,
    agent: agent._id,
    opportunity: opportunityId || agent.currentOpportunity,
    taskType: 'ANALYZE_OPPORTUNITY',
    title: `Analyzed ${context.opportunity?.title || 'Target Opportunity'}`,
    description: `Analyzed role requirements for ${context.opportunity?.company || 'Company'}. Match Score: ${context.match.score}%, Readiness: ${context.readinessMetrics.overall}%.`,
    status: 'COMPLETED',
    priority: decision.priority,
    riskLevel: 'SAFE_INTERNAL_ACTION',
    result: decision
  });

  return {
    agent,
    context,
    decision
  };
};

const runApplicationAgent = async (userId, opportunityId = null) => {
  const agent = await getOrCreateAgent(userId);
  const targetOppId = opportunityId || agent.currentOpportunity;
  
  agent.status = 'PREPARING';
  await agent.save();

  const context = await buildApplicationAgentContext(userId, targetOppId);
  const decision = evaluateApplicationDecision(context);

  // Generate tailored drafts if decision allows
  let draft = null;
  if (context.opportunity && ['IMPROVE_APPLICATION', 'PREPARE_FOR_REVIEW', 'PROGRESS_PREPARATION'].includes(decision.decisionCode)) {
    const draftContent = {
      coverLetter: `Dear Hiring Manager at ${context.opportunity.company},\n\nI am excited to submit my application for the ${context.opportunity.title} role. With a strong background in ${context.candidate.skills.slice(0, 3).join(', ')}, I am confident in delivering immediate value to your team.\n\nSincerely,\n${context.candidate.name}`,
      screeningAnswers: [
        { question: 'Years of relevant experience?', answer: `${context.candidate.experience.length || 3}+ years in software engineering and modern web stacks.` },
        { question: 'Notice period / Start date?', answer: 'Available to start within 2 weeks of offer.' }
      ]
    };

    draft = await ApplicationDraft.create({
      user: userId,
      opportunity: context.opportunity.id,
      type: 'COVER_LETTER',
      title: `Cover Letter for ${context.opportunity.company} — ${context.opportunity.title}`,
      content: draftContent,
      version: 1,
      status: 'DRAFT',
      generatedBy: 'AI'
    });

    agent.statistics.applicationsPrepared += 1;
    agent.lastPreparedAt = new Date();
  }

  // Record Task Timeline
  const task = await ApplicationAgentTask.create({
    user: userId,
    agent: agent._id,
    opportunity: targetOppId,
    taskType: decision.nextAction === 'OPTIMIZE_RESUME' ? 'OPTIMIZE_RESUME' : 'GENERATE_COVER_LETTER',
    title: decision.title,
    description: decision.description,
    status: 'COMPLETED',
    priority: decision.priority,
    riskLevel: decision.riskLevel,
    result: { decision, draftId: draft?._id }
  });

  // Store behavioral memory
  await ApplicationAgentMemory.create({
    user: userId,
    category: 'BEHAVIOR',
    key: `PREFERRED_MATCH_THRESHOLD_${context.opportunity?.company || 'GENERAL'}`,
    value: `Candidate ran Application Agent for ${context.opportunity?.title || 'Role'} (Match: ${context.match.score}%)`,
    confidence: 0.85,
    source: 'AGENT_RUN'
  });

  agent.status = decision.riskLevel === 'HIGH_IMPACT' || decision.riskLevel === 'EXTERNAL_ACTION' ? 'WAITING_FOR_APPROVAL' : 'IDLE';
  await agent.save();

  return {
    agent,
    context,
    decision,
    draft,
    task
  };
};

const getAgentTasks = async (userId) => {
  return ApplicationAgentTask.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean();
};

const getAgentMemories = async (userId) => {
  return ApplicationAgentMemory.find({ user: userId }).sort({ createdAt: -1 }).lean();
};

const deleteAgentMemory = async (userId, memoryId) => {
  const memory = await ApplicationAgentMemory.findOneAndDelete({ _id: memoryId, user: userId });
  if (!memory) {
    const err = new Error('Memory record not found or access denied');
    err.statusCode = 404;
    throw err;
  }
  return { success: true, message: 'Memory record deleted successfully' };
};

const getAgentDrafts = async (userId, opportunityId = null) => {
  const query = { user: userId };
  if (opportunityId) {
    query.opportunity = opportunityId;
  }
  return ApplicationDraft.find(query).sort({ createdAt: -1 }).lean();
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
