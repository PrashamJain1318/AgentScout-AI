const mongoose = require('mongoose');
const Match = require('../models/Match.model');
const User = require('../models/User.model');
const aiProvider = require('./ai/aiProvider');

/**
 * Generate or retrieve cached AI explanation for a match document.
 * @param {string} matchId - Match ObjectId
 * @param {string} userId - Authenticated user ObjectId
 * @param {boolean} refresh - Force fresh AI API call
 * @returns {Promise<Object>} Match explanation payload
 */
const generateExplanationForMatch = async (matchId, userId, refresh = false) => {
  if (!mongoose.Types.ObjectId.isValid(matchId)) {
    const err = new Error('Invalid match ID');
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const match = await Match.findOne({ _id: matchId, user: userId })
    .populate('opportunity', 'title company location type remote description requirements salary applicationUrl source sourceUrl postedAt');

  if (!match) {
    const err = new Error('Match not found');
    err.statusCode = 404;
    throw err;
  }

  // 1. Caching Check
  if (
    !refresh &&
    match.explanation &&
    match.explanation.summary &&
    match.explanation.summary.trim() !== '' &&
    match.explanationGeneratedAt
  ) {
    return match.explanation;
  }

  // 2. Fetch user profile
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const opp = match.opportunity || {};
  const profile = user.profile || {};

  const prompt = `Analyze this job opportunity match for candidate ${user.firstName || 'Candidate'}:
  CANDIDATE TARGET ROLE: ${profile.targetRole || profile.headline || 'Software Engineer'}
  CONFIRMED SKILLS: ${(profile.skills || []).join(', ')}
  JOB TITLE: ${opp.title} at ${opp.company}
  JOB DESCRIPTION: ${(opp.description || '').slice(0, 1500)}
  REQUIREMENTS: ${(opp.requirements || []).join(', ')}
  DETERMINISTIC MATCH SCORE: ${match.score}%

  Return strictly a JSON object matching this schema:
  {
    "summary": "Concise 2-sentence explanation of why the candidate fits this role",
    "whyYouMatch": ["string (key strength points)"],
    "skillGaps": ["string (missing skills or requirements)"],
    "recommendation": "Actionable application recommendation",
    "interviewTips": ["string (key interview preparation tips)"],
    "confidence": 0.90
  }`;

  try {
    const parsed = await aiProvider.generateJSON(prompt, {
      temperature: 0.2,
      systemPrompt: "You are AgentScout AI Job Match Analysis Engine."
    });

    const explanation = {
      summary: parsed.summary ? String(parsed.summary).trim() : `You have a ${match.score}% match for ${opp.title} at ${opp.company}.`,
      whyYouMatch: Array.isArray(parsed.whyYouMatch) ? parsed.whyYouMatch.map(String) : (match.matchedSkills || []),
      skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps.map(String) : (match.missingSkills || []),
      recommendation: parsed.recommendation ? String(parsed.recommendation).trim() : 'Apply with tailored cover letter highlighting primary skills.',
      interviewTips: Array.isArray(parsed.interviewTips) ? parsed.interviewTips.map(String) : ['Focus on role-aligned projects.'],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.88
    };

    match.explanation = explanation;
    match.explanationGeneratedAt = new Date();
    await match.save();

    return match.explanation;
  } catch (err) {
    console.warn('AI Match Explanation fallback:', err.message);
    return {
      summary: `You have a ${match.score}% match for ${opp.title} at ${opp.company}.`,
      whyYouMatch: match.matchedSkills || [],
      skillGaps: match.missingSkills || [],
      recommendation: 'Tailor your application assets for this role.',
      interviewTips: ['Review job description requirements.'],
      confidence: 0.75
    };
  }
};

module.exports = {
  generateExplanationForMatch
};
