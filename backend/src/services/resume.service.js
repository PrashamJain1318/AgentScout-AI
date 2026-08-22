const mongoose = require('mongoose');
const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const Opportunity = require('../models/Opportunity.model');
const notificationService = require('./notification.service');
const storageService = require('./resumeStorage.service');
const parserService = require('./resumeParser.service');
const extractionService = require('./resumeExtraction.service');
const scoringService = require('./resumeScoring.service');
const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

/**
 * Get candidate resume metadata and analysis by User ID.
 */
const getResumeByUser = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const resume = await Resume.findOne({ user: userObjectId });
  return resume;
};

/**
 * Upload and process resume file.
 */
const uploadResume = async (userId, fileBuffer, originalName, mimeType, size) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const user = await User.findById(userId);

  // 1. Save file to storage abstraction
  const { storageKey } = await storageService.saveFile(userId, fileBuffer, originalName);

  // 2. Parse text from buffer
  const parsed = await parserService.parseResumeText(fileBuffer, mimeType);

  // 3. Extract structured candidate details
  const extractedData = await extractionService.extractStructuredResumeData(parsed.text, user || {});

  // 4. Calculate ATS and completeness scores
  const scoreResult = await scoringService.calculateResumeScores(extractedData, parsed.text);

  // 5. Update or create Resume document
  let resume = await Resume.findOne({ user: userObjectId });

  if (resume) {
    // Delete previous storage file if key changed
    if (resume.storageKey && resume.storageKey !== storageKey) {
      await storageService.deleteFile(resume.storageKey);
    }

    resume.originalName = originalName;
    resume.storageKey = storageKey;
    resume.mimeType = mimeType;
    resume.size = size;
    resume.uploadedAt = new Date();
    resume.analyzedAt = new Date();
    resume.extractedText = parsed.text;
    resume.extractedData = extractedData;
    resume.scores = scoreResult.scores;
    resume.gaps = scoreResult.gaps;
    resume.suggestions = scoreResult.suggestions;
  } else {
    resume = new Resume({
      user: userObjectId,
      originalName,
      storageKey,
      mimeType,
      size,
      uploadedAt: new Date(),
      analyzedAt: new Date(),
      extractedText: parsed.text,
      extractedData,
      scores: scoreResult.scores,
      gaps: scoreResult.gaps,
      suggestions: scoreResult.suggestions
    });
  }

  await resume.save();

  // Also update user profile skills if candidate profile has no skills listed
  if (user && Array.isArray(extractedData.skills) && extractedData.skills.length > 0) {
    if (!user.profile) user.profile = {};
    if (!Array.isArray(user.profile.skills) || user.profile.skills.length === 0) {
      user.profile.skills = extractedData.skills;
      user.markModified('profile');
      await user.save();
    }
  }

  // Trigger notification for successful analysis
  notificationService.createNotification({
    user: userId,
    type: 'profile',
    title: 'Resume Analyzed Successfully',
    message: `Your resume "${originalName}" was parsed and scored. AgentScout ATS Score: ${scoreResult.scores.ats}%.`,
    link: '/dashboard/resume'
  }).catch(() => {});

  return resume;
};

/**
 * Reanalyze currently uploaded resume.
 */
const analyzeResume = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const resume = await Resume.findOne({ user: userObjectId });

  if (!resume) {
    const err = new Error('No resume uploaded to analyze');
    err.statusCode = 404;
    throw err;
  }

  const user = await User.findById(userId);
  const extractedData = await extractionService.extractStructuredResumeData(resume.extractedText || '', user || {});
  const scoreResult = await scoringService.calculateResumeScores(extractedData, resume.extractedText || '');

  resume.analyzedAt = new Date();
  resume.extractedData = extractedData;
  resume.scores = scoreResult.scores;
  resume.gaps = scoreResult.gaps;
  resume.suggestions = scoreResult.suggestions;

  await resume.save();
  return resume;
};

/**
 * Delete uploaded resume.
 */
const deleteResume = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const resume = await Resume.findOne({ user: userObjectId });

  if (!resume) {
    const err = new Error('Resume not found');
    err.statusCode = 404;
    throw err;
  }

  if (resume.storageKey) {
    await storageService.deleteFile(resume.storageKey);
  }

  await Resume.findOneAndDelete({ user: userObjectId });
  return { success: true, message: 'Resume deleted successfully' };
};

/**
 * Get file buffer for downloading authenticated candidate's own resume.
 */
const getFileForDownload = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const resume = await Resume.findOne({ user: userObjectId });

  if (!resume || !resume.storageKey) {
    const err = new Error('Resume file not found');
    err.statusCode = 404;
    throw err;
  }

  const fileBuffer = await storageService.getFile(resume.storageKey);
  if (!fileBuffer) {
    const err = new Error('File buffer missing on server');
    err.statusCode = 404;
    throw err;
  }

  return {
    fileBuffer,
    mimeType: resume.mimeType,
    originalName: resume.originalName
  };
};

/**
 * Analyze Resume fit against target Opportunity.
 */
const matchResumeToOpportunity = async (userId, opportunityId) => {
  if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
    const err = new Error('Invalid opportunity ID');
    err.statusCode = 400;
    throw err;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const [resume, opportunity] = await Promise.all([
    Resume.findOne({ user: userObjectId }),
    Opportunity.findById(opportunityId)
  ]);

  if (!opportunity) {
    const err = new Error('Opportunity not found');
    err.statusCode = 404;
    throw err;
  }

  const resumeSkills = resume?.extractedData?.skills || [];
  const reqs = Array.isArray(opportunity.requirements) ? opportunity.requirements : [];

  const matchedSkills = [];
  const missingSkills = [];

  reqs.forEach(req => {
    const normReq = String(req).trim().toLowerCase();
    const found = resumeSkills.some(s => String(s).trim().toLowerCase() === normReq || String(s).toLowerCase().includes(normReq));
    if (found) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const totalReqs = Math.max(1, reqs.length);
  const matchPct = Math.round((matchedSkills.length / totalReqs) * 100);
  const resumeMatchScore = reqs.length === 0 ? (resume ? 85 : 50) : Math.min(100, Math.max(20, matchPct));

  const missingKeywords = missingSkills.slice(0, 5);

  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Incorporate key required terms: ${missingSkills.slice(0, 3).join(', ')} if supported by your background.`);
  }
  if (resume?.extractedData?.experience?.length === 0) {
    recommendations.push('Highlight relevant project work or internships matching the job description.');
  }
  recommendations.push(`Tailor your summary to emphasize alignment with ${opportunity.company || 'this role'}.`);

  return {
    opportunityId: opportunity._id,
    jobTitle: opportunity.title,
    company: opportunity.company,
    resumeMatchScore,
    matchedSkills,
    missingSkills,
    missingKeywords,
    recommendations,
    atsCompatibility: Math.min(100, resumeMatchScore + 5)
  };
};

/**
 * Update candidate portfolio URLs.
 */
const updatePortfolio = async (userId, portfolioData = {}) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let resume = await Resume.findOne({ user: userObjectId });

  if (!resume) {
    // Create empty resume shell to store portfolio URLs
    resume = new Resume({
      user: userObjectId,
      originalName: 'Candidate Portfolio',
      storageKey: 'none',
      mimeType: 'text/plain',
      size: 0
    });
  }

  if (!resume.portfolio) resume.portfolio = {};

  if (portfolioData.portfolioUrl !== undefined) resume.portfolio.portfolioUrl = String(portfolioData.portfolioUrl).trim();
  if (portfolioData.githubUrl !== undefined) resume.portfolio.githubUrl = String(portfolioData.githubUrl).trim();
  if (portfolioData.linkedinUrl !== undefined) resume.portfolio.linkedinUrl = String(portfolioData.linkedinUrl).trim();
  if (Array.isArray(portfolioData.projectUrls)) resume.portfolio.projectUrls = portfolioData.projectUrls.filter(u => typeof u === 'string').map(u => u.trim());

  resume.portfolio.analyzedAt = new Date();
  resume.markModified('portfolio');
  await resume.save();

  return resume;
};

module.exports = {
  getResumeByUser,
  uploadResume,
  analyzeResume,
  deleteResume,
  getFileForDownload,
  matchResumeToOpportunity,
  updatePortfolio
};
