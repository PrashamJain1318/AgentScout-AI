const mongoose = require('mongoose');
const User = require('../models/User.model');
const Resume = require('../models/Resume.model');
const Match = require('../models/Match.model');
const ApplicationAssistant = require('../models/ApplicationAssistant.model');
const InterviewSession = require('../models/InterviewSession.model');
const { isGeminiConfigured } = require('../config/gemini');
const { makeGeminiHttpRequest } = require('./gemini.service');

/**
 * Evaluate Candidate Fit & Intelligence for a Target Opportunity.
 */
const evaluateOpportunityFit = async (userId, opportunity) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const oppId = opportunity._id || opportunity.id;

  const [user, resume, matchDoc, assistantDoc, interviewSessions] = await Promise.all([
    User.findById(userId),
    Resume.findOne({ user: userObjectId }),
    Match.findOne({ user: userObjectId, opportunity: oppId }),
    ApplicationAssistant.findOne({ user: userObjectId, opportunity: oppId }),
    InterviewSession.find({ user: userObjectId, status: 'completed' }).sort({ createdAt: -1 }).limit(3)
  ]);

  const candidateSkills = Array.isArray(user?.profile?.skills) ? user.profile.skills : [];
  const resumeSkills = Array.isArray(resume?.extractedData?.skills) ? resume.extractedData.skills : [];
  const allSkills = Array.from(new Set([...candidateSkills, ...resumeSkills]));

  const requirements = Array.isArray(opportunity.requirements) ? opportunity.requirements : [];

  // 1. Skill Alignment
  const matchedSkills = requirements.filter(req =>
    allSkills.some(s => s.toLowerCase() === String(req).toLowerCase())
  );
  const missingSkills = requirements.filter(req =>
    !matchedSkills.some(m => m.toLowerCase() === String(req).toLowerCase())
  );

  // 2. Score calculation (reuse matchDoc score if available, or compute deterministic fit)
  let score = matchDoc?.score || 0;
  if (!score) {
    if (requirements.length > 0) {
      const matchPct = Math.round((matchedSkills.length / requirements.length) * 100);
      score = Math.max(50, Math.min(95, matchPct + (resume?.scores?.ats ? 10 : 0)));
    } else {
      score = 75;
    }
  }

  // 3. Score Category
  let category = 'LOW';
  if (score >= 90) category = 'EXCELLENT';
  else if (score >= 75) category = 'STRONG';
  else if (score >= 60) category = 'MODERATE';

  // 4. Application Readiness (Phase 16.12 Integration)
  const readinessScore = assistantDoc?.readinessScore || Math.round((score * 0.7) + ((resume?.scores?.ats || 70) * 0.3));

  // 5. Data-driven Match Reasons
  const reasons = [];
  if (matchedSkills.length > 0) {
    reasons.push(`Your experience with ${matchedSkills.slice(0, 3).join(', ')} matches ${matchedSkills.length} of ${requirements.length || 1} core technical requirements.`);
  }
  if (missingSkills.length > 0) {
    reasons.push(`Your profile currently lacks evidence for ${missingSkills.slice(0, 2).join(', ')}, which affects your skill coverage.`);
  } else {
    reasons.push(`Your profile covers 100% of the stated technical skills for this position.`);
  }

  if (resume?.scores?.ats) {
    reasons.push(`Your candidate resume has an ATS compatibility score of ${resume.scores.ats}%.`);
  }

  // 6. Action Recommendation
  let recommendedAction = 'Review Opportunity';
  let actionTitle = 'Review Match Details';
  let deepLink = `/opportunities/${oppId}`;

  if (score >= 90 && readinessScore >= 70) {
    recommendedAction = 'Apply Now';
    actionTitle = 'Apply to High Match Role';
    deepLink = `/dashboard/application-assistant?opportunity=${oppId}`;
  } else if (score >= 75 && readinessScore < 70) {
    recommendedAction = 'Prepare Application First';
    actionTitle = 'Tailor Resume & Generate Cover Letter';
    deepLink = `/dashboard/application-assistant?opportunity=${oppId}`;
  } else if (score >= 75) {
    recommendedAction = 'Prepare Application';
    actionTitle = 'Prepare Application Assets';
    deepLink = `/dashboard/application-assistant?opportunity=${oppId}`;
  } else if (missingSkills.length > 0) {
    recommendedAction = 'Close Skill Gap';
    actionTitle = `Study ${missingSkills[0]}`;
    deepLink = `/dashboard/career-copilot`;
  }

  // 7. Structured AI Explanation
  let aiExplanation = `Your profile aligns ${score}% with ${opportunity.title} at ${opportunity.company}. ${reasons.join(' ')}`;

  if (isGeminiConfigured()) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const prompt = `Provide a concise 2-sentence evidence-based explanation for why candidate ${user?.firstName || 'Candidate'} matches ${opportunity.title} at ${opportunity.company}.

MATCH SCORE: ${score}% (${category})
MATCHED SKILLS: ${matchedSkills.join(', ') || 'General Engineering'}
MISSING SKILLS: ${missingSkills.join(', ') || 'None'}
RESUME ATS: ${resume?.scores?.ats || 75}%

Strict Rules: Reference only actual skills above. Keep text professional and markdown formatted.`;

      const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } };
      const aiRes = await makeGeminiHttpRequest(apiKey, payload, 8000);
      if (aiRes.statusCode >= 200 && aiRes.statusCode < 300 && aiRes.data) {
        const text = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) aiExplanation = text.trim();
      }
    } catch (err) {
      // Fallback to data-driven explanation
    }
  }

  return {
    score,
    category,
    reasons,
    matchedSkills,
    missingSkills,
    readinessScore,
    recommendedAction,
    actionTitle,
    deepLink,
    aiExplanation
  };
};

module.exports = {
  evaluateOpportunityFit
};
