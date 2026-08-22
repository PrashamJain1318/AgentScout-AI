const mongoose = require('mongoose');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');
const User = require('../models/User.model');
const Opportunity = require('../models/Opportunity.model');
const Match = require('../models/Match.model');
const Resume = require('../models/Resume.model');
const Application = require('../models/Application.model');
const notificationService = require('./notification.service');
const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

const DEFAULT_CHECKLIST_ITEMS = [
  { id: 'resume_rev', label: 'Resume reviewed', completed: false },
  { id: 'resume_tail', label: 'Resume tailored for position', completed: false },
  { id: 'port_rev', label: 'Portfolio & code links reviewed', completed: false },
  { id: 'gh_rev', label: 'GitHub projects verified', completed: false },
  { id: 'cover_prep', label: 'Cover letter prepared', completed: false },
  { id: 'answers_prep', label: 'Application answers prepared', completed: false },
  { id: 'skills_rev', label: 'Required skills reviewed', completed: false },
  { id: 'reqs_rev', label: 'Opportunity requirements reviewed', completed: false },
  { id: 'strat_rev', label: 'Application strategy reviewed', completed: false },
  { id: 'ready_apply', label: 'Ready to submit application', completed: false }
];

/**
 * Calculate deterministic Application Readiness Score and Breakdown.
 */
const calculateReadinessScores = (user, resume, opportunity, match) => {
  const candidateSkills = Array.isArray(user?.profile?.skills) ? user.profile.skills : [];
  const resumeSkills = Array.isArray(resume?.extractedData?.skills) ? resume.extractedData.skills : [];
  const allSkills = Array.from(new Set([...candidateSkills, ...resumeSkills]));

  const reqs = Array.isArray(opportunity.requirements) ? opportunity.requirements : [];
  
  // 1. Skill Coverage (0-100)
  const matchedSkills = [];
  const missingSkills = [];
  const partialSkills = [];

  reqs.forEach(req => {
    const norm = String(req).trim().toLowerCase();
    const exact = allSkills.some(s => String(s).trim().toLowerCase() === norm);
    const partial = !exact && allSkills.some(s => String(s).toLowerCase().includes(norm) || norm.includes(String(s).toLowerCase()));

    if (exact) {
      matchedSkills.push(req);
    } else if (partial) {
      partialSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const totalReqs = Math.max(1, reqs.length);
  const skillCoverage = Math.min(100, Math.round(((matchedSkills.length + (partialSkills.length * 0.5)) / totalReqs) * 100));

  // 2. Resume Alignment (0-100)
  const atsScore = resume?.scores?.ats || 70;
  const resumeAlignment = Math.min(100, Math.round((atsScore * 0.6) + (skillCoverage * 0.4)));

  // 3. Experience Alignment (0-100)
  const expCount = (resume?.extractedData?.experience?.length || 0) + (user?.profile?.experience?.length || 0);
  let experienceAlignment = 50;
  if (expCount >= 3) experienceAlignment = 90;
  else if (expCount === 2) experienceAlignment = 80;
  else if (expCount === 1) experienceAlignment = 70;

  // 4. Portfolio Strength (0-100)
  let portfolioStrength = 40;
  if (resume?.portfolio?.portfolioUrl || user?.profile?.portfolioUrl) portfolioStrength += 25;
  if (resume?.portfolio?.githubUrl || user?.profile?.githubUrl) portfolioStrength += 20;
  if (resume?.portfolio?.linkedinUrl || user?.profile?.linkedinUrl) portfolioStrength += 15;
  portfolioStrength = Math.min(100, portfolioStrength);

  // 5. Profile Alignment (0-100)
  let profileAlignment = 60;
  if (user?.profile?.headline) profileAlignment += 15;
  if (user?.profile?.bio) profileAlignment += 15;
  if (user?.profile?.location) profileAlignment += 10;
  profileAlignment = Math.min(100, profileAlignment);

  // Composite Readiness Score
  const readinessScore = Math.round(
    (resumeAlignment * 0.3) +
    (skillCoverage * 0.3) +
    (experienceAlignment * 0.2) +
    (portfolioStrength * 0.1) +
    (profileAlignment * 0.1)
  );

  const strengths = [];
  if (matchedSkills.length > 0) strengths.push(`Strong overlap in core required skills: ${matchedSkills.slice(0, 3).join(', ')}.`);
  if (atsScore >= 75) strengths.push(`High AgentScout ATS resume compatibility (${atsScore}%).`);
  if (expCount > 0) strengths.push(`Demonstrated hands-on experience across target engineering roles.`);

  const gaps = [];
  if (missingSkills.length > 0) gaps.push(`Missing key job requirements: ${missingSkills.slice(0, 3).join(', ')}.`);
  if (!resume) gaps.push('No uploaded resume found. Upload a resume to boost readiness accuracy.');
  if (portfolioStrength < 60) gaps.push('Online portfolio or GitHub profile links missing.');

  const resumeRecommendations = [
    {
      type: 'Skill Highlight',
      priority: missingSkills.length > 0 ? 'high' : 'medium',
      reason: missingSkills.length > 0 ? `Target role requires ${missingSkills[0]}.` : 'Enhance skill visibility.',
      suggestedAction: missingSkills.length > 0 ? `Incorporate experience or project evidence for ${missingSkills[0]} if applicable.` : 'Feature primary skills at top of resume.'
    },
    {
      type: 'Experience Focus',
      priority: 'medium',
      reason: `Align bullet points with ${opportunity.company || 'hiring manager'} expectations.`,
      suggestedAction: `Emphasize quantitative metrics and achievements matching ${opportunity.title}.`
    }
  ];

  return {
    readinessScore,
    scoreBreakdown: {
      resumeAlignment,
      skillCoverage,
      experienceAlignment,
      portfolioStrength,
      profileAlignment
    },
    resumeAnalysis: {
      matchedSkills,
      missingSkills,
      partialSkills,
      recommended: missingSkills.slice(0, 4)
    },
    strengths,
    gaps,
    resumeRecommendations
  };
};

/**
 * Analyze or retrieve Application Assistant for candidate & opportunity.
 */
const analyzeOpportunityReadiness = async (userId, opportunityId) => {
  if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
    const err = new Error('Invalid opportunity ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oppObjectId = new mongoose.Types.ObjectId(opportunityId);

  const [user, opportunity, resume, match, application] = await Promise.all([
    User.findById(userId),
    Opportunity.findById(opportunityId),
    Resume.findOne({ user: userObjectId }),
    Match.findOne({ user: userObjectId, opportunity: oppObjectId }),
    Application.findOne({ user: userObjectId, opportunity: oppObjectId })
  ]);

  if (!opportunity) {
    const err = new Error('Opportunity not found');
    err.statusCode = 404;
    throw err;
  }

  const computed = calculateReadinessScores(user, resume, opportunity, match);

  let assistant = await ApplicationAssistant.findOne({ user: userObjectId, opportunity: oppObjectId });

  if (!assistant) {
    assistant = new ApplicationAssistant({
      user: userObjectId,
      opportunity: oppObjectId,
      application: application ? application._id : null,
      readinessScore: computed.readinessScore,
      scoreBreakdown: computed.scoreBreakdown,
      resumeAnalysis: computed.resumeAnalysis,
      strengths: computed.strengths,
      gaps: computed.gaps,
      resumeRecommendations: computed.resumeRecommendations,
      checklist: DEFAULT_CHECKLIST_ITEMS
    });
  } else {
    assistant.readinessScore = computed.readinessScore;
    assistant.scoreBreakdown = computed.scoreBreakdown;
    assistant.resumeAnalysis = computed.resumeAnalysis;
    assistant.strengths = computed.strengths;
    assistant.gaps = computed.gaps;
    assistant.resumeRecommendations = computed.resumeRecommendations;
    if (application) assistant.application = application._id;
  }

  await assistant.save();

  // Create notification
  notificationService.createNotification({
    user: userId,
    type: 'application_readiness',
    title: 'Application Readiness Analyzed',
    message: `Your application readiness for ${opportunity.title} at ${opportunity.company} is ${computed.readinessScore}%.`,
    link: `/dashboard/application-assistant?opportunity=${opportunityId}`
  }).catch(() => {});

  return assistant.populate(['opportunity', 'application']);
};

/**
 * Get Assistant state by opportunity.
 */
const getAssistantByOpportunity = async (userId, opportunityId) => {
  if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
    const err = new Error('Invalid opportunity ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oppObjectId = new mongoose.Types.ObjectId(opportunityId);

  let assistant = await ApplicationAssistant.findOne({ user: userObjectId, opportunity: oppObjectId })
    .populate(['opportunity', 'application']);

  if (!assistant) {
    assistant = await analyzeOpportunityReadiness(userId, opportunityId);
  }

  return assistant;
};

/**
 * Generate tailored Cover Letter using Gemini or safe fallback.
 */
const generateCoverLetter = async (userId, opportunityId, tone = 'Professional', length = 'Medium') => {
  const assistant = await getAssistantByOpportunity(userId, opportunityId);
  const user = await User.findById(userId);
  const resume = await Resume.findOne({ user: new mongoose.Types.ObjectId(userId) });
  const opportunity = assistant.opportunity;

  const candidateName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate';
  const candidateSkills = (resume?.extractedData?.skills || user?.profile?.skills || []).join(', ') || 'Software Development';
  const company = opportunity.company || 'Hiring Team';
  const title = opportunity.title || 'Software Engineer';

  let content = `Dear Hiring Manager at ${company},

I am writing to express my enthusiastic interest in the ${title} position. With my background in ${candidateSkills}, I am confident in my ability to contribute effectively to your engineering team.

In my previous projects and professional experience, I have developed a proven track record of delivering clean, scalable software solutions. Your team's work aligns strongly with my technical background and career goals.

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience align with the goals of ${company}.

Sincerely,
${candidateName}`;

  if (isGeminiConfigured()) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const prompt = `Write a personalized, highly professional cover letter for a candidate applying to a job.
      
      CANDIDATE DETAILS:
      Name: ${candidateName}
      Skills: ${candidateSkills}
      Headline: ${user?.profile?.headline || 'Software Engineer'}
      
      JOB DETAILS:
      Title: ${title}
      Company: ${company}
      Location: ${opportunity.location || 'Remote'}
      Requirements: ${(opportunity.requirements || []).join(', ')}
      
      PREFERENCES:
      Tone: ${tone}
      Length: ${length}
      
      STRICT RULES:
      - Do NOT invent companies, degrees, metrics, or work experiences not provided.
      - Keep text clear, professional, and candidate-specific.
      - Return ONLY the raw cover letter text.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      };

      const aiRes = await makeGeminiHttpRequest(apiKey, payload, 15000);
      if (aiRes.statusCode >= 200 && aiRes.statusCode < 300 && aiRes.data) {
        const candidates = aiRes.data.candidates;
        if (Array.isArray(candidates) && candidates.length > 0) {
          const text = candidates[0].content?.parts[0]?.text;
          if (text) content = text.trim();
        }
      }
    } catch (err) {
      console.warn('Gemini Cover Letter Fallback:', err.message);
    }
  }

  assistant.coverLetter = {
    content,
    tone,
    length,
    generatedAt: new Date()
  };

  await assistant.save();

  // Trigger notification
  notificationService.createNotification({
    user: userId,
    type: 'cover_letter',
    title: 'Cover Letter Generated',
    message: `Generated a tailored ${tone} cover letter for ${title} at ${company}.`,
    link: `/dashboard/application-assistant?opportunity=${opportunityId}`
  }).catch(() => {});

  return assistant.coverLetter;
};

/**
 * Generate Application Question Answers.
 */
const generateApplicationAnswers = async (userId, opportunityId, customQuestions = []) => {
  const assistant = await getAssistantByOpportunity(userId, opportunityId);
  const user = await User.findById(userId);
  const resume = await Resume.findOne({ user: new mongoose.Types.ObjectId(userId) });
  const opportunity = assistant.opportunity;

  const candidateName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate';
  const candidateSkills = (resume?.extractedData?.skills || user?.profile?.skills || []).join(', ') || 'Software Development';
  const company = opportunity.company || 'Company';
  const title = opportunity.title || 'Software Engineer';

  const defaultQuestions = [
    'Why do you want to work here?',
    'Why are you a good fit for this role?',
    'Tell us about a relevant project you built.'
  ];

  const questionsToAnswer = Array.isArray(customQuestions) && customQuestions.length > 0
    ? customQuestions
    : defaultQuestions;

  const answers = [];

  for (const q of questionsToAnswer) {
    let ans = `As a software engineer skilled in ${candidateSkills}, I am drawn to ${company}'s culture of engineering excellence. My background directly matches the core technical requirements for ${title}.`;

    if (q.toLowerCase().includes('fit')) {
      ans = `My experience with ${candidateSkills} directly matches your required tech stack. I have a track record of building production applications and resolving complex technical challenges.`;
    } else if (q.toLowerCase().includes('project')) {
      ans = `I built an end-to-end web application incorporating ${candidateSkills.split(',')[0] || 'React'}, implementing responsive interfaces and REST APIs to optimize user experience.`;
    }

    if (isGeminiConfigured()) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const prompt = `Answer this application question for a candidate:
        QUESTION: "${q}"
        CANDIDATE SKILLS: ${candidateSkills}
        JOB TITLE: ${title} at ${company}
        
        STRICT RULE: Do not invent false experience. Keep answer concise (2-4 sentences).`;

        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        };

        const aiRes = await makeGeminiHttpRequest(apiKey, payload, 15000);
        if (aiRes.statusCode >= 200 && aiRes.statusCode < 300 && aiRes.data) {
          const candidates = aiRes.data.candidates;
          if (Array.isArray(candidates) && candidates.length > 0) {
            const text = candidates[0].content?.parts[0]?.text;
            if (text) ans = text.trim();
          }
        }
      } catch (err) {
        // Fallback
      }
    }

    answers.push({
      question: q,
      answer: ans,
      generatedAt: new Date()
    });
  }

  assistant.applicationAnswers = answers;
  await assistant.save();
  return assistant.applicationAnswers;
};

/**
 * Generate Application Strategy.
 */
const generateApplicationStrategy = async (userId, opportunityId) => {
  const assistant = await getAssistantByOpportunity(userId, opportunityId);
  const score = assistant.readinessScore || 70;

  let recommendation = 'Apply now';
  let priority = 'High';

  if (score < 50) {
    recommendation = 'Improve resume first';
    priority = 'Low';
  } else if (score < 75) {
    recommendation = 'Strengthen profile first';
    priority = 'Medium';
  }

  const keyActionSteps = [
    `Lead with your top matching skills in your resume summary.`,
    `Highlight relevant project work matching ${assistant.opportunity?.title || 'the target role'}.`,
    `Review key required keywords before submitting your application.`,
    `Use the AI-generated tailored cover letter to stand out to recruiters.`
  ];

  assistant.applicationStrategy = {
    recommendation,
    priority,
    keyActionSteps,
    generatedAt: new Date()
  };

  await assistant.save();
  return assistant.applicationStrategy;
};

/**
 * Update candidate checklist items.
 */
const updateChecklist = async (userId, opportunityId, checklist = []) => {
  const assistant = await getAssistantByOpportunity(userId, opportunityId);
  if (Array.isArray(checklist)) {
    assistant.checklist = checklist;
    await assistant.save();
  }
  return assistant.checklist;
};

/**
 * Delete Assistant record for opportunity.
 */
const deleteAssistant = async (userId, opportunityId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oppObjectId = new mongoose.Types.ObjectId(opportunityId);

  await ApplicationAssistant.findOneAndDelete({ user: userObjectId, opportunity: oppObjectId });
  return { success: true, message: 'Application Assistant state reset' };
};

/**
 * Get candidate's history of saved application assets across opportunities.
 */
const getAssetHistory = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const list = await ApplicationAssistant.find({ user: userObjectId })
    .populate('opportunity', 'title company location')
    .sort({ updatedAt: -1 });

  return list;
};

module.exports = {
  analyzeOpportunityReadiness,
  getAssistantByOpportunity,
  generateCoverLetter,
  generateApplicationAnswers,
  generateApplicationStrategy,
  updateChecklist,
  deleteAssistant,
  getAssetHistory
};
