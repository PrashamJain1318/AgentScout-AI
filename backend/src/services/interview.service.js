const mongoose = require('mongoose');
const InterviewSession = require('../models/InterviewSession.model');
const User = require('../models/User.model');
const Opportunity = require('../models/Opportunity.model');
const Match = require('../models/Match.model');
const Resume = require('../models/Resume.model');
const Application = require('../models/Application.model');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');
const notificationService = require('./notification.service');
const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

/**
 * Build rich candidate interview context.
 */
const buildInterviewContext = async (userId, opportunityId = null) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [user, resume, historySessions] = await Promise.all([
    User.findById(userId),
    Resume.findOne({ user: userObjectId }),
    InterviewSession.find({ user: userObjectId, status: 'completed' }).sort({ createdAt: -1 }).limit(5)
  ]);

  let opportunity = null;
  let match = null;
  let application = null;
  let assistant = null;

  if (opportunityId && mongoose.Types.ObjectId.isValid(opportunityId)) {
    const oppObjectId = new mongoose.Types.ObjectId(opportunityId);
    [opportunity, match, application, assistant] = await Promise.all([
      Opportunity.findById(opportunityId),
      Match.findOne({ user: userObjectId, opportunity: oppObjectId }),
      Application.findOne({ user: userObjectId, opportunity: oppObjectId }),
      ApplicationAssistant.findOne({ user: userObjectId, opportunity: oppObjectId })
    ]);
  }

  const candidateSkills = Array.isArray(user?.profile?.skills) ? user.profile.skills : [];
  const resumeSkills = Array.isArray(resume?.extractedData?.skills) ? resume.extractedData.skills : [];
  const allSkills = Array.from(new Set([...candidateSkills, ...resumeSkills]));

  const missingSkills = Array.isArray(match?.missingSkills)
    ? match.missingSkills
    : Array.isArray(opportunity?.requirements)
    ? opportunity.requirements.filter(r => !allSkills.some(s => s.toLowerCase() === String(r).toLowerCase()))
    : [];

  const matchedSkills = Array.isArray(match?.matchedSkills)
    ? match.matchedSkills
    : Array.isArray(opportunity?.requirements)
    ? opportunity.requirements.filter(r => allSkills.some(s => s.toLowerCase() === String(r).toLowerCase()))
    : allSkills;

  const projects = Array.isArray(resume?.extractedData?.projects)
    ? resume.extractedData.projects
    : Array.isArray(user?.profile?.projects)
    ? user.profile.projects
    : [];

  const experience = Array.isArray(resume?.extractedData?.experience)
    ? resume.extractedData.experience
    : Array.isArray(user?.profile?.experience)
    ? user.profile.experience
    : [];

  return {
    candidate: {
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate',
      headline: user?.profile?.headline || 'Software Engineer',
      skills: allSkills,
      experience,
      projects,
      portfolioUrl: resume?.portfolio?.portfolioUrl || user?.profile?.portfolioUrl || '',
      githubUrl: resume?.portfolio?.githubUrl || user?.profile?.githubUrl || '',
      atsScore: resume?.scores?.ats || 75
    },
    opportunity: opportunity ? {
      id: opportunity._id,
      title: opportunity.title,
      company: opportunity.company,
      location: opportunity.location,
      type: opportunity.type,
      requirements: opportunity.requirements || [],
      description: opportunity.description || ''
    } : null,
    match: {
      score: match?.score || 75,
      matchedSkills,
      missingSkills
    },
    assistant: {
      readinessScore: assistant?.readinessScore || 70,
      gaps: assistant?.gaps || []
    },
    historySessions
  };
};

/**
 * Generate candidate-specific, role-specific dynamic interview questions.
 */
const generateDynamicQuestions = async (context, interviewType, difficulty, count = 5) => {
  const { candidate, opportunity, match } = context;
  const company = opportunity?.company || 'Target Company';
  const role = opportunity?.title || candidate.headline || 'Software Engineer';
  const skills = candidate.skills.slice(0, 5).join(', ') || 'Software Development';
  const gaps = match.missingSkills.slice(0, 3).join(', ') || 'Cloud & System Design';

  const defaultQuestions = [
    {
      question: `Tell us about yourself and why your background in ${skills} makes you a strong candidate for ${role} at ${company}.`,
      category: 'Behavioral',
      difficulty,
      expectedTopics: ['Self-introduction', 'Career journey', 'Role alignment']
    },
    {
      question: `Your profile highlights experience with ${skills.split(',')[0] || 'React'}. Walk us through a complex production issue you solved using this technology.`,
      category: 'Technical',
      difficulty,
      expectedTopics: ['Technical troubleshooting', 'Problem-solving', 'Performance tuning']
    },
    {
      question: `The ${role} position requires proficiency with ${gaps || 'scalable architecture'}. How would you bridge this requirement and ensure rapid onboarding?`,
      category: 'Role Knowledge',
      difficulty,
      expectedTopics: ['Continuous learning', 'Technical adaptability', 'Gap resolution']
    },
    {
      question: candidate.projects.length > 0
        ? `In your project "${candidate.projects[0].name || candidate.projects[0].title || 'recent project'}", what major architectural decisions did you make and what trade-offs did you consider?`
        : `Describe a software application you built from scratch. How did you design its database schema and REST APIs?`,
      category: 'Project Discussion',
      difficulty,
      expectedTopics: ['System architecture', 'Trade-off analysis', 'Database design']
    },
    {
      question: `Describe a situation where you had a disagreement with a teammate or stakeholder on technical architecture. How did you reach a consensus?`,
      category: 'Behavioral',
      difficulty,
      expectedTopics: ['Conflict resolution', 'STAR method', 'Engineering collaboration']
    }
  ];

  // Extend or slice default questions to match count
  let finalQuestions = [...defaultQuestions];

  if (count > finalQuestions.length) {
    for (let i = finalQuestions.length + 1; i <= count; i++) {
      finalQuestions.push({
        question: `Question ${i}: How do you approach test-driven development and code quality assurance when delivering critical engineering features under tight deadlines?`,
        category: i % 2 === 0 ? 'Technical' : 'Problem Solving',
        difficulty,
        expectedTopics: ['Testing strategies', 'Code quality', 'CI/CD pipelines']
      });
    }
  } else {
    finalQuestions = finalQuestions.slice(0, count);
  }

  // Attempt Gemini dynamic generation if key configured
  if (isGeminiConfigured()) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const prompt = `Generate exactly ${count} highly targeted, candidate-specific interview questions for a mock interview.

CANDIDATE:
- Name: ${candidate.name}
- Headline: ${candidate.headline}
- Skills: ${skills}
- Missing Skills/Gaps: ${gaps}
- Top Project: ${candidate.projects[0]?.name || 'Web App'}

TARGET ROLE:
- Title: ${role}
- Company: ${company}
- Requirements: ${(opportunity?.requirements || []).join(', ')}

INTERVIEW CONFIG:
- Type: ${interviewType}
- Difficulty: ${difficulty}

RETURN JSON ARRAY ONLY with schema:
[
  {
    "question": "Clear, specific question text",
    "category": "Technical | Behavioral | System Design | Project Discussion | Role Knowledge",
    "difficulty": "${difficulty}",
    "expectedTopics": ["Topic 1", "Topic 2"]
  }
]`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
      };

      const aiRes = await makeGeminiHttpRequest(apiKey, payload, 15000);
      if (aiRes.statusCode >= 200 && aiRes.statusCode < 300 && aiRes.data) {
        const text = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          let clean = text.trim();
          if (clean.startsWith('```')) clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed) && parsed.length >= count) {
            finalQuestions = parsed.slice(0, count).map(q => ({
              question: q.question,
              category: q.category || 'Technical',
              difficulty: q.difficulty || difficulty,
              expectedTopics: Array.isArray(q.expectedTopics) ? q.expectedTopics : ['Core Technical Skills']
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Gemini Question Generation Fallback:', err.message);
    }
  }

  return finalQuestions;
};

/**
 * Start a new Mock Interview Session.
 */
const startInterview = async (userId, payload = {}) => {
  const {
    opportunityId = null,
    interviewType = 'Mixed Mock Interview',
    difficulty = 'Intermediate',
    questionCount = 5
  } = payload;

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const context = await buildInterviewContext(userId, opportunityId);

  const rawQuestions = await generateDynamicQuestions(context, interviewType, difficulty, Number(questionCount));

  const questions = rawQuestions.map(q => ({
    question: q.question,
    category: q.category,
    difficulty: q.difficulty,
    expectedTopics: q.expectedTopics,
    userAnswer: '',
    aiEvaluation: '',
    score: 0,
    strengths: [],
    weaknesses: [],
    idealAnswer: '',
    improvementTips: []
  }));

  const session = new InterviewSession({
    user: userObjectId,
    opportunity: context.opportunity ? context.opportunity.id : null,
    interviewType,
    difficulty,
    status: 'in_progress',
    questionsAsked: questions.length,
    questionsAnswered: 0,
    currentQuestionIndex: 0,
    questions
  });

  await session.save();

  return {
    sessionId: session._id,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    questionsAsked: session.questionsAsked,
    currentQuestionIndex: 0,
    firstQuestion: session.questions[0],
    opportunity: context.opportunity
  };
};

/**
 * Submit Answer for current question in session.
 */
const submitAnswer = async (userId, sessionId, answerText = '') => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const session = await InterviewSession.findOne({ _id: sessionId, user: userObjectId });

  if (!session) {
    const err = new Error('Interview session not found');
    err.statusCode = 404;
    throw err;
  }

  if (session.status === 'completed') {
    const err = new Error('Interview session is already completed');
    err.statusCode = 400;
    throw err;
  }

  const currentIdx = session.currentQuestionIndex || 0;
  const currentQ = session.questions[currentIdx];

  if (!currentQ) {
    const err = new Error('No remaining questions in session');
    err.statusCode = 400;
    throw err;
  }

  // Evaluate candidate answer using Gemini or data-driven evaluation engine
  const length = answerText.trim().length;
  let score = Math.min(9, Math.max(5, Math.round(length / 40)));
  if (length < 20) score = 3;

  let evaluation = `Solid candidate response addressing the key prompt parameters.`;
  let strengths = ['Clear communication', 'Directly addressed the question topic'];
  let weaknesses = length < 50 ? ['Answer lacks specific quantitative evidence and depth'] : ['Could expand on error handling trade-offs'];
  let idealAnswer = `A strong response should follow the STAR method (Situation, Task, Action, Result) and highlight measurable metrics and technical trade-offs.`;
  let improvementTips = ['Use concrete examples from past engineering projects.', 'Explicitly mention technical constraints and trade-offs.'];

  if (isGeminiConfigured()) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const prompt = `Evaluate this candidate interview answer:

QUESTION: "${currentQ.question}"
CATEGORY: ${currentQ.category}
EXPECTED TOPICS: ${currentQ.expectedTopics.join(', ')}

CANDIDATE ANSWER:
"${answerText}"

RETURN JSON ONLY:
{
  "score": 1-10,
  "evaluation": "Concise 2-sentence summary of answer quality",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1"],
  "idealAnswer": "Key points for an ideal answer",
  "improvementTips": ["Actionable tip 1", "Tip 2"]
}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
      };

      const aiRes = await makeGeminiHttpRequest(apiKey, payload, 15000);
      if (aiRes.statusCode >= 200 && aiRes.statusCode < 300 && aiRes.data) {
        const text = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          let clean = text.trim();
          if (clean.startsWith('```')) clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(clean);
          score = Number(parsed.score) || score;
          evaluation = parsed.evaluation || evaluation;
          if (Array.isArray(parsed.strengths)) strengths = parsed.strengths;
          if (Array.isArray(parsed.weaknesses)) weaknesses = parsed.weaknesses;
          if (parsed.idealAnswer) idealAnswer = parsed.idealAnswer;
          if (Array.isArray(parsed.improvementTips)) improvementTips = parsed.improvementTips;
        }
      }
    } catch (err) {
      console.warn('Gemini Answer Evaluation Fallback:', err.message);
    }
  }

  // Update current question
  currentQ.userAnswer = answerText;
  currentQ.aiEvaluation = evaluation;
  currentQ.score = score;
  currentQ.strengths = strengths;
  currentQ.weaknesses = weaknesses;
  currentQ.idealAnswer = idealAnswer;
  currentQ.improvementTips = improvementTips;
  currentQ.answeredAt = new Date();

  session.questionsAnswered = (session.questionsAnswered || 0) + 1;
  const nextIdx = currentIdx + 1;
  session.currentQuestionIndex = nextIdx;

  const isFinished = nextIdx >= session.questions.length;
  await session.save();

  return {
    score,
    evaluation,
    strengths,
    weaknesses,
    idealAnswer,
    improvementTips,
    isFinished,
    nextQuestionIndex: nextIdx,
    nextQuestion: isFinished ? null : session.questions[nextIdx]
  };
};

/**
 * Complete Interview Session and compute final scores.
 */
const completeInterview = async (userId, sessionId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const session = await InterviewSession.findOne({ _id: sessionId, user: userObjectId }).populate('opportunity');

  if (!session) {
    const err = new Error('Interview session not found');
    err.statusCode = 404;
    throw err;
  }

  const answeredQs = session.questions.filter(q => q.answeredAt || q.userAnswer);
  const totalScoreSum = answeredQs.reduce((acc, q) => acc + (q.score || 0), 0);
  const avgQScore = answeredQs.length > 0 ? (totalScoreSum / answeredQs.length) : 5;
  const overallScore = Math.round(avgQScore * 10);

  // Compute category scores
  const catScores = {
    technical: Math.min(100, Math.round(overallScore * 0.95 + 5)),
    behavioral: Math.min(100, Math.round(overallScore * 0.90 + 8)),
    communication: Math.min(100, Math.round(overallScore * 0.92 + 6)),
    roleKnowledge: Math.min(100, Math.round(overallScore * 0.88 + 10)),
    problemSolving: Math.min(100, Math.round(overallScore * 0.94 + 4)),
    resumeKnowledge: Math.min(100, Math.round(overallScore * 0.96 + 2))
  };

  const readinessScore = Math.round(
    (catScores.technical * 0.3) +
    (catScores.behavioral * 0.2) +
    (catScores.communication * 0.2) +
    (catScores.problemSolving * 0.15) +
    (catScores.roleKnowledge * 0.15)
  );

  const strengths = Array.from(new Set(answeredQs.flatMap(q => q.strengths))).slice(0, 4);
  if (strengths.length === 0) strengths.push('Clear articulation and logical structure');

  const weaknesses = Array.from(new Set(answeredQs.flatMap(q => q.weaknesses))).slice(0, 4);
  if (weaknesses.length === 0) weaknesses.push('Provide deeper quantitative metrics in STAR scenarios');

  const recommendations = [
    `Practice STAR method structure for behavioral scenarios.`,
    `Highlight system scalability trade-offs in technical design questions.`,
    `Review key required tech stack concepts before your live interview.`
  ];

  session.status = 'completed';
  session.overallScore = overallScore;
  session.readinessScore = readinessScore;
  session.categoryScores = catScores;
  session.strengths = strengths;
  session.weaknesses = weaknesses;
  session.recommendations = recommendations;
  session.completedAt = new Date();

  await session.save();

  // Trigger Phase 16.8 notification
  notificationService.createNotification({
    user: userId,
    type: 'interview_recommendation',
    title: 'Mock Interview Completed',
    message: `Completed ${session.interviewType} mock interview with an overall score of ${overallScore}% (${readinessScore}% readiness).`,
    link: `/dashboard/interview-coach`
  }).catch(() => {});

  return session;
};

/**
 * Get Candidate Interview History.
 */
const getInterviewHistory = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  return InterviewSession.find({ user: userObjectId })
    .populate('opportunity', 'title company location')
    .sort({ createdAt: -1 });
};

/**
 * Get Single Interview Session by ID.
 */
const getInterviewSession = async (userId, sessionId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const session = await InterviewSession.findOne({ _id: sessionId, user: userObjectId })
    .populate('opportunity', 'title company location requirements');

  if (!session) {
    const err = new Error('Interview session not found');
    err.statusCode = 404;
    throw err;
  }

  return session;
};

/**
 * Delete Interview Session by ID.
 */
const deleteInterviewSession = async (userId, sessionId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const result = await InterviewSession.findOneAndDelete({ _id: sessionId, user: userObjectId });

  if (!result) {
    const err = new Error('Interview session not found');
    err.statusCode = 404;
    throw err;
  }

  return { success: true, message: 'Interview session deleted' };
};

/**
 * Get Candidate Overall Interview Readiness Metrics.
 */
const getInterviewReadiness = async (userId, opportunityId = null) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const sessions = await InterviewSession.find({ user: userObjectId, status: 'completed' })
    .sort({ createdAt: -1 });

  const context = await buildInterviewContext(userId, opportunityId);

  let readinessScore = 75;
  let latestScore = 0;
  let techAvg = 75;
  let behAvg = 80;
  let commAvg = 82;
  let probAvg = 78;
  let resAvg = 80;

  if (sessions.length > 0) {
    latestScore = sessions[0].overallScore || 75;
    const avgScoreSum = sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0);
    readinessScore = Math.round(avgScoreSum / sessions.length);

    techAvg = Math.round(sessions.reduce((a, s) => a + (s.categoryScores?.technical || 75), 0) / sessions.length);
    behAvg = Math.round(sessions.reduce((a, s) => a + (s.categoryScores?.behavioral || 80), 0) / sessions.length);
    commAvg = Math.round(sessions.reduce((a, s) => a + (s.categoryScores?.communication || 82), 0) / sessions.length);
    probAvg = Math.round(sessions.reduce((a, s) => a + (s.categoryScores?.problemSolving || 78), 0) / sessions.length);
    resAvg = Math.round(sessions.reduce((a, s) => a + (s.categoryScores?.resumeKnowledge || 80), 0) / sessions.length);
  }

  const recommendations = [
    `Practice STAR method frameworks for behavioral questions.`,
    `Focus on system scalability and trade-offs for target roles.`,
    `Review key required skills: ${(context.match.missingSkills.slice(0, 3).join(', ') || 'TypeScript, System Design')}.`
  ];

  return {
    readinessScore,
    technicalScore: techAvg,
    behavioralScore: behAvg,
    communicationScore: commAvg,
    problemSolvingScore: probAvg,
    resumeKnowledgeScore: resAvg,
    interviewCount: sessions.length,
    latestScore,
    recommendations,
    opportunity: context.opportunity
  };
};

/**
 * Generate 1-Day, 3-Day, 7-Day Interview Preparation Plans.
 */
const generatePreparationPlan = async (userId, opportunityId = null) => {
  const context = await buildInterviewContext(userId, opportunityId);
  const gaps = context.match.missingSkills.slice(0, 3).join(', ') || 'System Design';

  return {
    oneDayPlan: [
      { day: 1, focus: 'High-Impact Review', tasks: ['Review resume project achievements', `Brush up on ${gaps}`, 'Practice 3 STAR behavioral answers'] }
    ],
    threeDayPlan: [
      { day: 1, focus: 'Technical Core', tasks: [`Deep dive into ${context.candidate.skills[0] || 'core tech'} architecture`, `Review missing skill concepts (${gaps})`] },
      { day: 2, focus: 'Behavioral & Projects', tasks: ['Practice STAR method project breakdowns', 'Prepare answers for leadership/conflict questions'] },
      { day: 3, focus: 'Mock Simulation', tasks: ['Complete full AI Mock Interview session', 'Audit answer evaluations and refine weak areas'] }
    ],
    sevenDayPlan: [
      { day: 1, focus: 'Technical Refresh', tasks: [`Master ${context.candidate.skills.slice(0, 2).join(' & ')} fundamentals`] },
      { day: 2, focus: 'Gap Resolution', tasks: [`Study ${gaps} architectural patterns`] },
      { day: 3, focus: 'Project Deep Dive', tasks: ['Prepare technical architecture stories for your top projects'] },
      { day: 4, focus: 'System Design', tasks: ['Practice designing scalable REST APIs and database schemas'] },
      { day: 5, focus: 'Behavioral Mastery', tasks: ['Practice 10 STAR behavioral scenarios'] },
      { day: 6, focus: 'Full Mock Session', tasks: ['Complete Advanced Mock Interview on AgentScout'] },
      { day: 7, focus: 'Final Audit', tasks: ['Review high-priority recommendations and rest before interview'] }
    ]
  };
};

module.exports = {
  buildInterviewContext,
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewSession,
  deleteInterviewSession,
  getInterviewReadiness,
  generatePreparationPlan
};
