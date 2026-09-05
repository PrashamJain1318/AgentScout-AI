const User = require('../models/User.model');
const Opportunity = require('../models/Opportunity.model');
const Match = require('../models/Match.model');
const Application = require('../models/Application.model');
const Resume = require('../models/Resume.model');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');
const InterviewSession = require('../models/InterviewSession.model');
const CareerActionPlan = require('../models/CareerActionPlan.model');
const OpportunityMonitor = require('../models/OpportunityMonitor.model');
const OpportunityObservation = require('../models/OpportunityObservation.model');
const CareerOSSnapshot = require('../models/CareerOSSnapshot.model');
const CareerAgent = require('../models/CareerAgent.model');
const CareerAgentExecution = require('../models/CareerAgentExecution.model');
const CareerAgentWorkflow = require('../models/CareerAgentWorkflow.model');
const CareerAgentActionPackage = require('../models/CareerAgentActionPackage.model');
const CareerAgentMemory = require('../models/CareerAgentMemory.model');
const CareerHealth = require('../models/CareerHealth.model');
const CareerEvent = require('../models/CareerEvent.model');

const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

/**
 * Build rich candidate career context for AI Copilot reasoning.
 */
const buildUserCareerContext = async (userId) => {
  const [
    user,
    opportunities,
    matches,
    applications,
    resume,
    assistantRecords,
    interviewSessions,
    actionPlan,
    monitor,
    observations,
    osSnapshot,
    careerAgent,
    recentExecutions,
    activeWorkflows,
    pendingPackages,
    agentMemories,
    latestCareerHealth,
    recentCareerEvents
  ] = await Promise.all([
    User.findById(userId),
    Opportunity.find({ isActive: true }).sort({ postedAt: -1 }).limit(10),
    Match.find({ user: userId }).populate('opportunity', 'title company location requirements'),
    Application.find({ user: userId }).sort({ updatedAt: -1 }).limit(10),
    Resume.findOne({ user: userId }),
    ApplicationAssistant.find({ user: userId }).sort({ updatedAt: -1 }).limit(5),
    InterviewSession.find({ user: userId, status: 'completed' }).sort({ createdAt: -1 }).limit(5),
    CareerActionPlan.findOne({ user: userId }).sort({ createdAt: -1 }),
    OpportunityMonitor.findOne({ user: userId }),
    OpportunityObservation.find({ user: userId, dismissed: false }).populate('opportunity').limit(10),
    CareerOSSnapshot.findOne({ user: userId }).sort({ generatedAt: -1 }),
    CareerAgent.findOne({ user: userId }),
    CareerAgentExecution.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
    CareerAgentWorkflow.find({ user: userId, status: { $ne: 'COMPLETED' } }).limit(5),
    CareerAgentActionPackage.find({ user: userId, approvalState: { $in: ['PENDING', 'EDITED'] } }).limit(5),
    CareerAgentMemory.find({ user: userId }).limit(10),
    CareerHealth.findOne({ user: userId }).sort({ createdAt: -1 }),
    CareerEvent.find({ user: userId, isArchived: false }).sort({ occurredAt: -1 }).limit(5)
  ]);

  const profile = user ? (user.profile || {}) : {};
  const candidateSkills = Array.isArray(profile.skills) ? profile.skills : (Array.isArray(user?.skills) ? user.skills : []);
  const headline = profile.headline || 'Software Engineer Candidate';
  const bio = profile.bio || profile.biography || '';
  const location = profile.location || 'Remote';
  const preferences = profile.preferences || {};

  // Missing skills aggregation
  const missingSkillCounts = {};
  matches.forEach(m => {
    if (Array.isArray(m.missingSkills)) {
      m.missingSkills.forEach(s => {
        const clean = String(s).trim();
        if (clean) missingSkillCounts[clean] = (missingSkillCounts[clean] || 0) + 1;
      });
    }
  });
  const topMissingSkills = Object.keys(missingSkillCounts).sort((a, b) => missingSkillCounts[b] - missingSkillCounts[a]).slice(0, 8);

  // Application Pipeline Counts
  const appStats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview' || a.status === 'screening').length,
    offer: applications.filter(a => a.status === 'offer' || a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  // Match Scores Summary
  const matchScores = matches.map(m => m.score || 0);
  const avgMatchScore = matchScores.length > 0 ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length) : 0;

  const assistantList = Array.isArray(assistantRecords) ? assistantRecords : [];
  const avgReadiness = assistantList.length > 0
    ? Math.round(assistantList.reduce((a, b) => a + (b.readinessScore || 0), 0) / assistantList.length)
    : 0;

  const sessionsList = Array.isArray(interviewSessions) ? interviewSessions : [];
  const totalInterviews = sessionsList.length;
  const latestInterviewScore = totalInterviews > 0 ? (sessionsList[0].overallScore || 0) : 0;
  const avgInterviewReadiness = totalInterviews > 0
    ? Math.round(sessionsList.reduce((a, s) => a + (s.readinessScore || 0), 0) / totalInterviews)
    : 75;

  const obsList = Array.isArray(observations) ? observations.filter(o => o.opportunity) : [];
  const excellentObs = obsList.filter(o => o.highestMatchScore >= 90);

  return {
    candidate: {
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate',
      headline,
      bio,
      location,
      skills: candidateSkills,
      preferences,
      experience: Array.isArray(profile.experience) ? profile.experience : []
    },
    careerOS: osSnapshot ? {
      careerScore: osSnapshot.careerScore,
      careerStage: osSnapshot.careerStage,
      readiness: osSnapshot.readiness,
      nextBestAction: osSnapshot.actionState?.nextBestAction,
      risks: (osSnapshot.riskState || []).map(r => ({ title: r.title, severity: r.severity, explanation: r.explanation })),
      momentum: osSnapshot.momentum,
      aiSummary: osSnapshot.aiSummary
    } : null,
    resume: resume ? {
      originalName: resume.originalName,
      uploadedAt: resume.uploadedAt,
      scores: resume.scores,
      extractedData: resume.extractedData,
      gaps: resume.gaps,
      suggestions: resume.suggestions
    } : null,
    opportunityMonitor: {
      enabled: monitor ? monitor.enabled : true,
      lastRunAt: monitor ? monitor.lastRunAt : null,
      opportunitiesFound: monitor ? monitor.opportunitiesFound : obsList.length,
      excellentMatchesCount: excellentObs.length,
      topDiscoveredOpportunities: obsList.slice(0, 3).map(o => ({
        title: o.opportunity?.title,
        company: o.opportunity?.company,
        matchScore: o.highestMatchScore
      }))
    },
    careerActionPlan: actionPlan ? {
      completionPercentage: actionPlan.completionPercentage,
      nextBestAction: actionPlan.nextBestAction ? {
        title: actionPlan.nextBestAction.title,
        priority: actionPlan.nextBestAction.priority,
        reasoning: actionPlan.aiReasoning
      } : null,
      todayActions: (actionPlan.dailyActions || []).map(a => ({ title: a.title, status: a.status, priority: a.priority })),
      milestones: actionPlan.careerMilestones || []
    } : null,
    applicationAssistant: {
      totalPrepared: assistantList.length,
      averageReadinessScore: avgReadiness,
      recentPrepared: assistantList.map(a => ({
        readinessScore: a.readinessScore,
        hasCoverLetter: Boolean(a.coverLetter?.content),
        strategyRecommendation: a.applicationStrategy?.recommendation
      }))
    },
    interviewIntelligence: {
      totalCompleted: totalInterviews,
      latestScore: latestInterviewScore,
      averageReadinessScore: avgInterviewReadiness,
      recentSessions: sessionsList.map(s => ({
        type: s.interviewType,
        difficulty: s.difficulty,
        overallScore: s.overallScore,
        weaknesses: s.weaknesses
      }))
    },
    opportunities: opportunities.map(o => ({
      title: o.title,
      company: o.company,
      location: o.location,
      requirements: o.requirements || []
    })),
    matches: {
      total: matches.length,
      averageScore: avgMatchScore,
      topMissingSkills,
      sampleMatches: matches.slice(0, 5).map(m => ({
        role: m.opportunity?.title,
        company: m.opportunity?.company,
        score: m.score,
        matchedSkills: m.matchedSkills,
        missingSkills: m.missingSkills
      }))
    },
    applications: {
      stats: appStats,
      recent: applications.slice(0, 3).map(a => ({
        title: a.jobTitle || a.opportunity?.title,
        company: a.company || a.opportunity?.company,
        status: a.status
      }))
    },
    careerAgentAutomation: {
      enabled: careerAgent ? careerAgent.enabled : true,
      mode: careerAgent ? (careerAgent.mode || 'AUTONOMOUS') : 'AUTONOMOUS',
      status: careerAgent ? careerAgent.status : 'IDLE',
      statistics: careerAgent ? (careerAgent.statistics || {}) : {},
      recentExecutions: Array.isArray(recentExecutions) ? recentExecutions.map(e => ({
        actionType: e.actionType,
        status: e.status,
        durationMs: e.durationMs,
        completedAt: e.completedAt
      })) : [],
      activeWorkflowsCount: (activeWorkflows || []).length,
      pendingPackagesCount: (pendingPackages || []).length,
      activeWorkflows: (activeWorkflows || []).map(w => ({ id: w._id, title: w.title, type: w.type, status: w.status, progress: w.progress })),
      pendingPackages: (pendingPackages || []).map(p => ({ id: p._id, title: p.title, type: p.type, state: p.approvalState })),
      agentMemories: (agentMemories || []).map(m => ({ key: m.key, value: m.value, category: m.category }))
    },
    careerHealth: latestCareerHealth ? {
      overallScore: latestCareerHealth.overallScore,
      previousScore: latestCareerHealth.previousScore,
      change: latestCareerHealth.change,
      trend: latestCareerHealth.trend,
      strengths: latestCareerHealth.strengths,
      concerns: latestCareerHealth.concerns
    } : null,
    recentEvents: (recentCareerEvents || []).map(e => ({
      title: e.title,
      description: e.description,
      priority: e.priority,
      occurredAt: e.occurredAt
    }))
  };
};

const SYSTEM_PROMPT_BASE = `You are AgentScout AI Career Copilot, an expert AI career advisor and technical recruiter for AgentScout AI.
Your job is to provide personalized, practical, and evidence-based career guidance using the candidate's actual profile, skills, opportunities, matches, resume score, application readiness, mock interview readiness, action planner priorities, career OS status, and application history.

Strict Rules:
- Never invent candidate information or job facts.
- Prioritize actionable, evidence-based recommendations.
- When asked "What should I do now?": reference candidate's actual Career OS single highest-impact next best action.
- When asked "Why is my career score low?": explain the weighted breakdown of Profile, Resume, Opportunity Fit, Applications, Interview, Skills, and Portfolio.
- When discussing opportunity monitor or new jobs: reference candidate's actual monitored opportunities and excellent matches.
- When discussing skill gaps: identify existing skills, identify missing skills, explain why they matter, and recommend what to learn first.
- Keep responses professional, clear, markdown-formatted, and concise.`;

/**
 * Process Career Copilot conversational chat.
 */
const processCopilotChat = async (userId, userMessage) => {
  const context = await buildUserCareerContext(userId);

  if (!isGeminiConfigured()) {
    return generateLocalChatFallback(userMessage, context);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const promptText = `${SYSTEM_PROMPT_BASE}

CANDIDATE CAREER CONTEXT:
${JSON.stringify(context, null, 2)}

USER CANDIDATE QUESTION:
"${userMessage}"

Answer the user's question directly using the candidate's context data above. Provide concrete advice and markdown formatting:`;

  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: { temperature: 0.3 }
  };

  try {
    const res = await makeGeminiHttpRequest(apiKey, payload, 12000);
    if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
      const candidates = res.data.candidates;
      if (Array.isArray(candidates) && candidates.length > 0) {
        const text = candidates[0].content?.parts[0]?.text;
        if (text) return text.trim();
      }
    }
  } catch (err) {
    console.warn(`Gemini Chat Warning: ${err.message}. Using safe context fallback.`);
  }

  return generateLocalChatFallback(userMessage, context);
};

/**
 * Data-driven fallback chat response engine.
 */
const generateLocalChatFallback = (message = '', context = {}) => {
  const msg = message.toLowerCase();
  const c = context.candidate || {};
  const cos = context.careerOS || {};
  const r = context.resume;
  const cap = context.careerActionPlan;
  const om = context.opportunityMonitor || {};
  const aa = context.applicationAssistant || {};
  const ii = context.interviewIntelligence || {};
  const m = context.matches || {};
  const a = context.applications || {};

  const skillsStr = (c.skills || []).join(', ') || 'software development skills';
  const missingStr = (m.topMissingSkills || []).slice(0, 4).join(', ') || 'cloud architecture and system design';

  if (msg.includes('career score') || msg.includes('score low') || msg.includes('os')) {
    const breakdown = cos.readiness || {};
    return `### AgentScout Career Operating System Intelligence\n\n- **Composite Career Health Score:** **${cos.careerScore || 75}/100**\n- **Current Career Stage:** **${(cos.careerStage || 'APPLICATION_READY').replace(/_/g, ' ')}**\n- **Momentum:** **${cos.momentum?.score || 50}/100 (${cos.momentum?.trend || 'STABLE'})**\n\n### Score Breakdown:\n- Profile: **${breakdown.profile || 80}%** | Resume: **${breakdown.resume || 75}%**\n- Opportunity Fit: **${breakdown.opportunityFit || 85}%** | Applications: **${breakdown.applications || 50}%**\n- Interview: **${breakdown.interview || 75}%** | Skills: **${breakdown.skills || 70}%**\n\nView complete strategic command center on [Career OS](/dashboard/career-os).`;
  }

  if (msg.includes('new job') || msg.includes('find') || msg.includes('monitor') || msg.includes('discovered')) {
    const topDiscovered = (om.topDiscoveredOpportunities || []).map(o => `- **${o.title}** at **${o.company}** (${o.matchScore}% Match)`).join('\n');
    return `### AgentScout AI Opportunity Monitor Status\n\n- **Monitoring Status:** **${om.enabled ? 'Active ●' : 'Paused ⏸'}**\n- **Total Opportunities Found:** **${om.opportunitiesFound || 0}**\n- **90%+ Excellent Matches:** **${om.excellentMatchesCount || 0}**\n\n### Top Discovered Roles:\n${topDiscovered || '- No new opportunities detected in last scan.'}\n\nExplore your full candidate job monitoring dashboard on the [AI Opportunity Monitor](/dashboard/opportunity-monitor).`;
  }

  if (msg.includes('today') || msg.includes('do next') || msg.includes('planner') || msg.includes('action') || msg.includes('what should i do')) {
    const nextAction = cos.nextBestAction?.title || cap.nextBestAction?.title || 'Review priorities';
    return `### AgentScout Highest-Impact Priority\n\n- **Single Highest Impact Action:** **${nextAction}**\n- **Current Stage:** **${(cos.careerStage || 'APPLICATION_READY').replace(/_/g, ' ')}**\n\nExecute this priority directly on the [AI Career Operating System](/dashboard/career-os).`;
  }

  if (msg.includes('interview') || msg.includes('ready')) {
    return `### AgentScout AI Interview Readiness Intelligence\n\n- **Completed Mock Sessions:** **${ii.totalCompleted || 0}**\n- **Latest Mock Score:** **${ii.latestScore || 0}%**\n- **Interview Readiness Score:** **${ii.averageReadinessScore || 75}%**\n\n### Recommendation:\nUse the [AI Interview Coach](/dashboard/interview-coach) to practice role-specific technical and STAR behavioral questions before your upcoming interviews.`;
  }

  if (msg.includes('apply') || msg.includes('readiness') || msg.includes('cover letter')) {
    return `### AgentScout Application Readiness Intelligence\n\n- **Prepared Applications:** **${aa.totalPrepared || 0}**\n- **Average Readiness Score:** **${aa.averageReadinessScore || 80}%**\n\n### Recommendation:\nUse the [AI Application Assistant](/dashboard/application-assistant) to generate company-specific cover letters, answer custom job questions, and review your application readiness score before applying.`;
  }

  if (msg.includes('resume') || msg.includes('ats')) {
    if (!r) {
      return `Upload your resume first on your [Resume Dashboard](/dashboard/resume) so I can analyze its structure, ATS compatibility, and skills coverage.`;
    }
    return `### AgentScout Resume Intelligence Audit for ${r.originalName}\n\n- **AgentScout ATS Score:** **${r.scores?.ats || 0}%**\n- **Completeness Score:** **${r.scores?.completeness || 0}%**\n- **Skills Coverage:** **${r.scores?.skillsCoverage || 0}%**\n\n### Top Resume Recommendations:\n1. **${r.suggestions?.[0]?.title || 'Add Quantifiable Metrics'}**: ${r.suggestions?.[0]?.explanation || 'Include measurable impact in your work experience bullet points.'}\n2. **Skill Coverage**: Add missing target market skills (**${missingStr}**) to boost your ATS compatibility score.`;
  }

  if (msg.includes('skill') || msg.includes('learn')) {
    return `Based on your profile skills (${skillsStr}) and market demand across your matched opportunities, your top recommended skills to learn next are **${missingStr}**.\n\n### Learning Action Plan:\n1. **Focus Skill:** Learn ${m.topMissingSkills?.[0] || 'TypeScript'} to increase your high-match role eligibility.\n2. **Hands-on Practice:** Build a full-stack project incorporating ${c.skills?.[0] || 'React'} with ${m.topMissingSkills?.[0] || 'cloud deployment'}.\n3. **Portfolio Alignment:** Update your AgentScout profile once completed to automatically boost your AI match scores.`;
  }

  return `Hello ${c.name}! I am your AgentScout AI Career Copilot.\n\nBased on your profile (**${c.headline}**) with skills in **${skillsStr}**, your composite Career Health Score is **${cos.careerScore || 75}/100**. You currently have **${m.total || 0} AI matches** with an average match score of **${m.averageScore || 70}%**.\n\nHow can I assist your career progression today? Try asking:\n- *"What should I do now?"*\n- *"Why is my career score low?"*\n- *"What new jobs did you find?"*\n- *"Am I ready for my interview?"*`;
};

const getSkillGapAnalysis = async (userId) => {
  const context = await buildUserCareerContext(userId);
  const m = context.matches || {};

  const skillGaps = (m.topMissingSkills || ['TypeScript', 'Docker', 'AWS', 'GraphQL']).map((skill, idx) => ({
    skill,
    importance: idx < 2 ? 'high' : 'medium',
    reason: `Required by multiple active opportunities matching your target role (${context.candidate.headline}).`,
    relatedRoles: (m.sampleMatches || []).map(sm => sm.role).filter(Boolean)
  }));

  return skillGaps;
};

const generateRoadmap = async (userId, duration = 30) => {
  const context = await buildUserCareerContext(userId);
  const candidate = context.candidate;
  const missing = context.matches.topMissingSkills || ['TypeScript', 'System Design'];

  return {
    title: `${duration}-Day AI Career Acceleration Plan`,
    duration,
    candidateHeadline: candidate.headline,
    weeks: [
      {
        week: 1,
        focus: `Skill Acquisition: ${missing[0] || 'TypeScript'} & Core Fundamentals`,
        tasks: [
          `Complete hands-on tutorials on ${missing[0] || 'TypeScript'}.`,
          `Refactor an existing ${candidate.skills[0] || 'React'} component using strict type safety.`,
          `Audit profile headline and skills matrix on AgentScout.`
        ],
        outcome: `Demonstrable proficiency in ${missing[0] || 'TypeScript'}.`
      },
      {
        week: 2,
        focus: `Secondary Skill & Project Building: ${missing[1] || 'Docker'}`,
        tasks: [
          `Build a mini microservice incorporating ${candidate.skills[1] || 'Node.js'} and ${missing[1] || 'Docker'}.`,
          `Write unit tests and setup CI/CD pipeline.`,
          `Publish project repository to GitHub.`
        ],
        outcome: `Production-ready portfolio project.`
      },
      {
        week: 3,
        focus: 'Active Application Strategy & Pipeline Execution',
        tasks: [
          `Apply to top 5 AI-matched opportunities on AgentScout.`,
          `Update application tracker status to "Applied" for submitted roles.`,
          `Reach out to 3 recruiters or engineering managers.`
        ],
        outcome: `Active application pipeline with 5+ submitted applications.`
      },
      {
        week: 4,
        focus: 'Interview Prep & Live Technical Mock Practice',
        tasks: [
          `Practice 10 LeetCode / System Design interview questions.`,
          `Review STAR method behavioral stories for previous work at ${candidate.experience[0]?.company || 'past roles'}.`,
          `Conduct full mock interview.`
        ],
        outcome: `High interview readiness for target role: ${candidate.headline}.`
      }
    ]
  };
};

const generateInterviewPrep = async (userId, opportunityId = null) => {
  const context = await buildUserCareerContext(userId);
  const candidate = context.candidate;

  let opp = null;
  if (opportunityId) {
    opp = await Opportunity.findById(opportunityId);
  }
  if (!opp) {
    opp = context.opportunities[0] || { title: candidate.headline || 'Software Engineer', company: 'Target Company', requirements: candidate.skills };
  }

  const matched = (opp.requirements || []).filter(req => candidate.skills.some(cs => cs.toLowerCase() === req.toLowerCase()));
  const missing = (opp.requirements || []).filter(req => !matched.includes(req));

  return {
    targetRole: opp.title,
    company: opp.company,
    topics: [
      `Deep dive into ${matched.slice(0, 2).join(' & ') || 'core stack'} architecture`,
      `Handling async operations, state management, and API design`,
      `System performance optimization and error monitoring`
    ],
    technicalQuestions: [
      `How would you structure a scalable application using ${matched[0] || candidate.skills[0] || 'React'} and ${matched[1] || candidate.skills[1] || 'Node.js'}?`,
      `How do you handle error boundaries and fallback UI states in high-traffic production environments?`,
      `Explain your experience with database indexing in MongoDB.`
    ],
    behavioralQuestions: [
      `Describe a complex technical challenge you solved at ${candidate.experience[0]?.company || 'a previous project'}.`,
      `How do you prioritize technical debt versus tight feature deadlines?`
    ],
    skillGapsToAddress: missing.length > 0 ? missing : ['Cloud Deployment & CI/CD'],
    tips: [
      `Frame your answers using the STAR method (Situation, Task, Action, Result).`,
      `Be transparent about skill gaps (${missing[0] || 'secondary tools'}) and explain your rapid learning framework.`
    ]
  };
};

const getProfileImprovement = async (userId) => {
  const context = await buildUserCareerContext(userId);
  const candidate = context.candidate;

  return {
    headline: candidate.headline || 'Senior Full Stack & AI Engineer',
    summary: candidate.bio || `Passionate software engineer specializing in ${candidate.skills.slice(0, 3).join(', ')} with a strong track record of building production AI systems.`,
    skills: candidate.skills,
    recommendations: [
      `Highlight recent work with ${candidate.skills[0] || 'React'} and ${candidate.skills[1] || 'Node.js'} in your headline.`,
      `Add 2 missing market skills (${context.matches.topMissingSkills?.slice(0, 2).join(', ') || 'TypeScript, Docker'}) to unlock 25% higher AI match scores.`,
      `Ensure work experience descriptions contain quantitative metrics (e.g. "improved speed by 40%").`
    ]
  };
};

module.exports = {
  buildUserCareerContext,
  processCopilotChat,
  getSkillGapAnalysis,
  generateRoadmap,
  generateInterviewPrep,
  getProfileImprovement
};
