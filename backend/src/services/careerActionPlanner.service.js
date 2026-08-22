const mongoose = require('mongoose');
const CareerActionPlan = require('../models/CareerActionPlan.model');
const User = require('../models/User.model');
const Opportunity = require('../models/Opportunity.model');
const Match = require('../models/Match.model');
const Resume = require('../models/Resume.model');
const Application = require('../models/Application.model');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');
const InterviewSession = require('../models/InterviewSession.model');
const settingsService = require('./settings.service');
const notificationService = require('./notification.service');
const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

/**
 * Build complete Candidate Execution Context from all system modules.
 */
const buildCandidateExecutionContext = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [
    user,
    resume,
    matches,
    applications,
    opportunities,
    assistants,
    interviews,
    settingsData
  ] = await Promise.all([
    User.findById(userId),
    Resume.findOne({ user: userObjectId }),
    Match.find({ user: userObjectId }).populate('opportunity', 'title company location requirements type'),
    Application.find({ user: userObjectId }),
    Opportunity.find({ isActive: true }).sort({ postedAt: -1 }).limit(20),
    ApplicationAssistant.find({ user: userObjectId }),
    InterviewSession.find({ user: userObjectId, status: 'completed' }).sort({ createdAt: -1 }),
    settingsService.getSettings(userId).catch(() => null)
  ]);

  const profile = user ? (user.profile || {}) : {};
  const candidateSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const resumeSkills = Array.isArray(resume?.extractedData?.skills) ? resume.extractedData.skills : [];
  const allSkills = Array.from(new Set([...candidateSkills, ...resumeSkills]));

  // Profile completion score
  let profileScore = 0;
  if (user?.firstName) profileScore += 15;
  if (user?.lastName) profileScore += 15;
  if (user?.email) profileScore += 20;
  if (profile.headline || profile.targetRole) profileScore += 20;
  if (candidateSkills.length > 0) profileScore += 15;
  if (profile.location) profileScore += 15;
  profileScore = Math.min(100, profileScore);

  // Resume ATS metrics
  const atsScore = resume?.scores?.ats || 0;

  // Match metrics
  const totalMatches = matches.length;
  const excellentMatches = matches.filter(m => (m.score >= 90 || m.matchLevel === 'excellent'));
  const strongMatches = matches.filter(m => (m.score >= 75 && m.score < 90));
  const avgMatchScore = totalMatches > 0 ? Math.round(matches.reduce((a, m) => a + (m.score || 0), 0) / totalMatches) : 0;

  // Unapplied opportunities
  const appliedOppIds = new Set(applications.map(a => String(a.opportunity?._id || a.opportunity)));
  const unappliedMatches = matches.filter(m => m.opportunity && !appliedOppIds.has(String(m.opportunity._id || m.opportunity)));

  // Missing skills count
  const missingSkillCounts = {};
  matches.forEach(m => {
    if (Array.isArray(m.missingSkills)) {
      m.missingSkills.forEach(s => {
        const clean = String(s).trim();
        if (clean) missingSkillCounts[clean] = (missingSkillCounts[clean] || 0) + 1;
      });
    }
  });
  const sortedMissingSkills = Object.keys(missingSkillCounts).sort((a, b) => missingSkillCounts[b] - missingSkillCounts[a]);

  // Application Pipeline stats
  const totalApps = applications.length;
  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;
  const offerCount = applications.filter(a => a.status === 'offer').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;
  const rejectionRate = totalApps > 0 ? Math.round((rejectedCount / totalApps) * 100) : 0;

  // Interview Readiness stats
  const completedMocks = interviews.length;
  const latestMockScore = completedMocks > 0 ? (interviews[0].overallScore || 0) : 0;
  const avgInterviewReadiness = completedMocks > 0
    ? Math.round(interviews.reduce((a, s) => a + (s.readinessScore || 0), 0) / completedMocks)
    : 75;

  return {
    user,
    profile: {
      completionScore: profileScore,
      headline: profile.headline || 'Software Engineer',
      skills: allSkills,
      hasPortfolio: Boolean(profile.portfolioUrl || resume?.portfolio?.portfolioUrl),
      hasGithub: Boolean(profile.githubUrl || resume?.portfolio?.githubUrl)
    },
    resume: {
      exists: Boolean(resume),
      atsScore,
      completeness: resume?.scores?.completeness || 0,
      skillsCoverage: resume?.scores?.skillsCoverage || 0,
      missingSkills: resume?.gaps || []
    },
    matches: {
      total: totalMatches,
      avgScore: avgMatchScore,
      excellentMatches,
      strongMatches,
      unappliedMatches,
      missingSkills: sortedMissingSkills
    },
    applications: {
      total: totalApps,
      applied: appliedCount,
      interview: interviewCount,
      offer: offerCount,
      rejected: rejectedCount,
      rejectionRate
    },
    interview: {
      completedMocks,
      latestScore: latestMockScore,
      readinessScore: avgInterviewReadiness
    },
    opportunities: opportunities.filter(o => !appliedOppIds.has(String(o._id))),
    settings: settingsData
  };
};

/**
 * Deterministic Next-Best-Action & Action Intelligence Engine.
 */
const generateDeterministicActions = (context) => {
  const { profile, resume, matches, applications, interview, opportunities } = context;

  const actions = [];
  let nextBestAction = null;
  let aiReasoning = '';

  // 1. Profile Completion Rule
  if (profile.completionScore < 80) {
    const act = {
      id: 'act_profile_complete',
      title: 'Complete Candidate Profile Skills & Preferences',
      description: `Your profile completion is currently at ${profile.completionScore}%. Adding your target role and skills matrix unlocks higher AI match scores.`,
      category: 'profile',
      priority: 'high',
      impact: 'high',
      estimatedMinutes: 10,
      status: 'pending',
      deepLink: '/dashboard/profile',
      source: 'profile_engine'
    };
    actions.push(act);

    if (!nextBestAction) {
      nextBestAction = act;
      aiReasoning = `Completing your candidate profile establishes the baseline for AI job matching and resume alignment.`;
    }
  }

  // 2. Resume ATS Rule
  if (!resume.exists) {
    const act = {
      id: 'act_resume_upload',
      title: 'Upload Resume for ATS Score & Skill Extraction',
      description: 'Upload a PDF/DOCX resume to receive instant AgentScout ATS scoring, skills extraction, and tailoring recommendations.',
      category: 'resume',
      priority: 'critical',
      impact: 'high',
      estimatedMinutes: 5,
      status: 'pending',
      deepLink: '/dashboard/resume',
      source: 'resume_engine'
    };
    actions.push(act);

    nextBestAction = act;
    aiReasoning = `Uploading a resume is critical for ATS optimization and personalized application readiness scoring.`;
  } else if (resume.atsScore < 70) {
    const act = {
      id: 'act_resume_improve',
      title: `Improve Resume ATS Score (Current: ${resume.atsScore}%)`,
      description: `Your ATS score is below 70%. Add quantifiable achievement bullets and missing technical skills to pass ATS screeners.`,
      category: 'resume',
      priority: 'critical',
      impact: 'high',
      estimatedMinutes: 20,
      status: 'pending',
      deepLink: '/dashboard/resume',
      source: 'resume_engine'
    };
    actions.push(act);

    if (!nextBestAction || nextBestAction.priority !== 'critical') {
      nextBestAction = act;
      aiReasoning = `Your ATS score (${resume.atsScore}%) is below competitive threshold. Improving resume formatting directly increases recruiter response rates.`;
    }
  }

  // 3. Excellent Unapplied Match Rule
  if (matches.unappliedMatches.length > 0) {
    const topMatch = matches.unappliedMatches[0];
    const opp = topMatch.opportunity || {};
    const act = {
      id: `act_apply_match_${opp._id || 'top'}`,
      title: `Apply to ${opp.title || 'High Match Role'} at ${opp.company || 'Company'} (${topMatch.score || 90}% Match)`,
      description: `You have an unapplied ${topMatch.score || 90}% AI match for ${opp.title} at ${opp.company}. Prepare application and submit today.`,
      category: 'job_search',
      priority: 'critical',
      impact: 'high',
      estimatedMinutes: 25,
      status: 'pending',
      deepLink: `/dashboard/application-assistant?opportunity=${opp._id || ''}`,
      source: 'match_engine',
      metadata: { opportunityId: opp._id }
    };
    actions.push(act);

    if (!nextBestAction) {
      nextBestAction = act;
      aiReasoning = `Applying to your highest-quality AI match (${topMatch.score}%) gives you the highest mathematical probability of receiving an interview invite.`;
    }
  }

  // 4. Skill Gap Improvement Rule
  if (matches.missingSkills.length > 0) {
    const topSkill = matches.missingSkills[0];
    const act = {
      id: `act_skill_${topSkill.toLowerCase().replace(/\s+/g, '_')}`,
      title: `Study & Feature High-Demand Skill: ${topSkill}`,
      description: `${topSkill} is required by multiple active target opportunities. Learn core fundamentals to boost your match scores.`,
      category: 'skill',
      priority: 'high',
      impact: 'high',
      estimatedMinutes: 45,
      status: 'pending',
      deepLink: '/dashboard/career-copilot',
      source: 'skill_engine'
    };
    actions.push(act);

    if (!nextBestAction) {
      nextBestAction = act;
      aiReasoning = `${topSkill} is the single most frequently missing requirement across your target opportunity pool.`;
    }
  }

  // 5. Mock Interview Practice Rule
  if (interview.completedMocks === 0 || interview.readinessScore < 70) {
    const act = {
      id: 'act_interview_mock',
      title: `Complete AI Technical & Behavioral Mock Interview`,
      description: `Your interview readiness score is ${interview.readinessScore}%. Practice role-specific technical questions to build live interview confidence.`,
      category: 'interview',
      priority: 'high',
      impact: 'high',
      estimatedMinutes: 30,
      status: 'pending',
      deepLink: '/dashboard/interview-coach',
      source: 'interview_engine'
    };
    actions.push(act);

    if (!nextBestAction && applications.applied > 0) {
      nextBestAction = act;
      aiReasoning = `You have submitted active applications. Practicing mock interviews ensures you convert upcoming recruiter screenings into offers.`;
    }
  }

  // 6. Application Volume Velocity Rule
  if (applications.total < 3) {
    const act = {
      id: 'act_pipeline_build',
      title: 'Build Application Pipeline (Submit 3 Active Applications)',
      description: 'You currently have under 3 submitted applications. Expand your pipeline to maintain active job search momentum.',
      category: 'application',
      priority: 'medium',
      impact: 'high',
      estimatedMinutes: 30,
      status: 'pending',
      deepLink: '/opportunities',
      source: 'pipeline_engine'
    };
    actions.push(act);
  }

  // Fallback nextBestAction if none matched
  if (!nextBestAction && actions.length > 0) {
    nextBestAction = actions[0];
    aiReasoning = `Action selected based on active candidate progress metrics.`;
  }

  // Milestones tracking
  const milestones = [
    { id: 'm_profile', title: 'Profile 100% Complete', target: 100, current: profile.completionScore, unit: '%', percentage: profile.completionScore, completed: profile.completionScore >= 100 },
    { id: 'm_resume', title: 'Resume ATS Score > 80%', target: 80, current: resume.atsScore, unit: '%', percentage: Math.min(100, Math.round((resume.atsScore / 80) * 100)), completed: resume.atsScore >= 80 },
    { id: 'm_apps', title: '5+ Applications Submitted', target: 5, current: applications.total, unit: 'apps', percentage: Math.min(100, Math.round((applications.total / 5) * 100)), completed: applications.total >= 5 },
    { id: 'm_interview', title: 'Interview Readiness > 80%', target: 80, current: interview.readinessScore, unit: '%', percentage: Math.min(100, Math.round((interview.readinessScore / 80) * 100)), completed: interview.readinessScore >= 80 }
  ];

  return {
    actions,
    nextBestAction,
    aiReasoning,
    milestones
  };
};

/**
 * Generate or retrieve current Career Action Plan for user.
 */
const generatePlan = async (userId, refresh = false) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const context = await buildCandidateExecutionContext(userId);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let plan = await CareerActionPlan.findOne({ user: userObjectId, planDate: { $gte: startOfToday } });

  if (!plan || refresh) {
    const computed = generateDeterministicActions(context);

    // Group actions into categorised buckets
    const dailyActions = computed.actions.slice(0, 5);
    const priorityActions = computed.actions.filter(a => a.priority === 'critical' || a.priority === 'high');
    const jobSearchActions = computed.actions.filter(a => a.category === 'job_search');
    const applicationActions = computed.actions.filter(a => a.category === 'application');
    const skillActions = computed.actions.filter(a => a.category === 'skill');
    const resumeActions = computed.actions.filter(a => a.category === 'resume');
    const interviewActions = computed.actions.filter(a => a.category === 'interview');
    const networkingActions = computed.actions.filter(a => a.category === 'networking');

    let aiSummary = `Focus today on applying to high-match opportunities and strengthening your technical resume ATS alignment.`;

    if (isGeminiConfigured()) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const prompt = `Write a concise 2-sentence daily career action plan summary for candidate ${context.user?.firstName || 'Candidate'}.
        CANDIDATE HEADLINE: ${context.profile.headline}
        ATS SCORE: ${context.resume.atsScore}%
        NEXT BEST ACTION: ${computed.nextBestAction?.title || 'Apply to roles'}
        
        Keep text practical and encouraging.`;

        const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3 } };
        const aiRes = await makeGeminiHttpRequest(apiKey, payload, 10000);
        if (aiRes.statusCode >= 200 && aiRes.statusCode < 300 && aiRes.data) {
          const text = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) aiSummary = text.trim();
        }
      } catch (err) {
        // Fallback
      }
    }

    if (!plan) {
      plan = new CareerActionPlan({
        user: userObjectId,
        planDate: new Date(),
        weekStart: startOfToday,
        status: 'active',
        dailyActions,
        priorityActions,
        jobSearchActions,
        applicationActions,
        skillActions,
        resumeActions,
        interviewActions,
        networkingActions,
        careerMilestones: computed.milestones,
        completionPercentage: 0,
        aiSummary,
        aiReasoning: computed.aiReasoning,
        nextBestAction: computed.nextBestAction,
        lastGeneratedAt: new Date()
      });
    } else {
      plan.dailyActions = dailyActions;
      plan.priorityActions = priorityActions;
      plan.jobSearchActions = jobSearchActions;
      plan.applicationActions = applicationActions;
      plan.skillActions = skillActions;
      plan.resumeActions = resumeActions;
      plan.interviewActions = interviewActions;
      plan.networkingActions = networkingActions;
      plan.careerMilestones = computed.milestones;
      plan.aiSummary = aiSummary;
      plan.aiReasoning = computed.aiReasoning;
      plan.nextBestAction = computed.nextBestAction;
      plan.lastGeneratedAt = new Date();
    }

    await plan.save();

    // Trigger Notification for Critical Action if notification settings allow
    const allowNotifs = context.settings?.notificationPreferences?.careerCopilot !== false;
    if (allowNotifs && computed.nextBestAction && computed.nextBestAction.priority === 'critical') {
      notificationService.createNotification({
        user: userId,
        type: 'copilot_recommendation',
        title: 'Critical Career Action Recommended',
        message: computed.nextBestAction.title,
        link: '/dashboard/career-planner'
      }).catch(() => {});
    }
  }

  return plan;
};

/**
 * Update state of a specific action in plan.
 */
const updateActionState = async (userId, actionId, newStatus = 'completed') => {
  const plan = await generatePlan(userId);

  let updated = false;

  const updateList = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach(a => {
      if (a.id === actionId) {
        a.status = newStatus;
        if (newStatus === 'completed') a.completedAt = new Date();
        updated = true;
      }
    });
  };

  updateList(plan.dailyActions);
  updateList(plan.priorityActions);
  updateList(plan.jobSearchActions);
  updateList(plan.applicationActions);
  updateList(plan.skillActions);
  updateList(plan.resumeActions);
  updateList(plan.interviewActions);

  if (plan.nextBestAction && plan.nextBestAction.id === actionId) {
    plan.nextBestAction.status = newStatus;
    if (newStatus === 'completed') plan.nextBestAction.completedAt = new Date();
  }

  // Calculate completion percentage
  const total = plan.dailyActions.length || 1;
  const completedCount = plan.dailyActions.filter(a => a.status === 'completed').length;
  plan.completionPercentage = Math.round((completedCount / total) * 100);

  if (updated) {
    await plan.save();
  }

  return plan;
};

/**
 * Get Today's Action Plan.
 */
const getTodayPlan = async (userId) => {
  return generatePlan(userId);
};

/**
 * Get 7-Day Weekly Execution Plan.
 */
const getWeeklyPlan = async (userId) => {
  const plan = await generatePlan(userId);
  const context = await buildCandidateExecutionContext(userId);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const focusAreas = [
    'Resume & ATS Optimization',
    'High-Match Job Applications',
    'Market Skill Gap Development',
    'Technical & Behavioral Mock Interview',
    'Application Follow-ups & Strategy',
    'Portfolio & Project Enhancement',
    'Weekly Execution Audit & Goal Review'
  ];

  const weeklySchedule = days.map((day, idx) => ({
    day,
    focus: focusAreas[idx],
    action: plan.dailyActions[idx % plan.dailyActions.length] || { title: `Review ${focusAreas[idx]}` }
  }));

  return {
    weekStart: plan.weekStart,
    weeklySchedule,
    completionPercentage: plan.completionPercentage
  };
};

/**
 * Get Planner Overview Metrics.
 */
const getPlannerOverview = async (userId) => {
  const plan = await generatePlan(userId);
  const total = plan.dailyActions.length;
  const completed = plan.dailyActions.filter(a => a.status === 'completed').length;
  const pending = plan.dailyActions.filter(a => a.status === 'pending').length;

  return {
    completionPercentage: plan.completionPercentage,
    actionsCompleted: completed,
    actionsPending: pending,
    totalActions: total,
    nextBestAction: plan.nextBestAction,
    milestones: plan.careerMilestones,
    aiSummary: plan.aiSummary
  };
};

module.exports = {
  buildCandidateExecutionContext,
  generatePlan,
  updateActionState,
  getTodayPlan,
  getWeeklyPlan,
  getPlannerOverview
};
