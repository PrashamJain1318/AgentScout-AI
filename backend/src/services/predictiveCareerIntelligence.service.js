const crypto = require('crypto');
const { buildUnifiedContext } = require('./careerAgentContext.service');
const { analyzeSkillGaps } = require('./skillGapIntelligence.service');
const { detectCareerBottlenecks } = require('./careerBottleneck.service');
const { generateCareerForecasts } = require('./careerForecast.service');
const { evaluateOpportunityPriorities } = require('./opportunityPriority.service');
const { evaluateActionROI } = require('./actionROI.service');
const { detectCareerRisks } = require('./careerRisk.service');

const CareerIntelligenceProfile = require('../models/CareerIntelligenceProfile.model');
const CareerInsight = require('../models/CareerInsight.model');

/**
 * Calculate 7-Dimension Weighted Career Health Score
 */
const calculateCareerHealthScore = (unifiedContext) => {
  const user = unifiedContext.user || {};
  const resume = unifiedContext.resume || {};
  const applications = Array.isArray(unifiedContext.applications) ? unifiedContext.applications : (unifiedContext.rawApplications || []);
  const matches = Array.isArray(unifiedContext.matches) ? unifiedContext.matches : (unifiedContext.rawMatches || []);
  const interviewSessions = Array.isArray(unifiedContext.interviewSessions) ? unifiedContext.interviewSessions : (unifiedContext.rawInterviewSessions || []);

  // 1. Profile Quality (15%)
  const profile = user.profile || {};
  let profileScore = 40;
  if (profile.headline) profileScore += 20;
  if (Array.isArray(profile.skills) && profile.skills.length > 0) profileScore += 20;
  if (profile.location) profileScore += 10;
  if (Array.isArray(profile.experience) && profile.experience.length > 0) profileScore += 10;
  profileScore = Math.min(100, profileScore);

  // 2. Resume Readiness (20%)
  const resumeScore = resume.atsScore ?? resume.score ?? (resume.content ? 65 : 30);

  // 3. Market Alignment (20%)
  const topMatches = matches.filter(m => (m.matchScore || 0) >= 75);
  const marketAlignmentScore = Math.min(100, Math.max(40, topMatches.length * 20 + 40));

  // 4. Skill Readiness (15%)
  const skillCount = (profile.skills || []).length + (resume.skills || []).length;
  const skillReadinessScore = Math.min(100, Math.max(50, skillCount * 8));

  // 5. Application Effectiveness (15%)
  const appCount = applications.length;
  const appEffectivenessScore = Math.min(100, Math.max(30, appCount * 15 + 30));

  // 6. Interview Readiness (10%)
  const interviewCount = interviewSessions.length;
  const interviewReadinessScore = Math.min(100, Math.max(40, interviewCount * 25 + 40));

  // 7. Career Momentum (5%)
  const momentumScore = Math.min(100, Math.max(40, (appCount + interviewCount) * 10 + 40));

  // Overall Weighted Score
  const overallScore = Math.round(
    profileScore * 0.15 +
    resumeScore * 0.20 +
    marketAlignmentScore * 0.20 +
    skillReadinessScore * 0.15 +
    appEffectivenessScore * 0.15 +
    interviewReadinessScore * 0.10 +
    momentumScore * 0.05
  );

  let category = 'STRONG';
  if (overallScore >= 90) category = 'EXCELLENT';
  else if (overallScore >= 75) category = 'STRONG';
  else if (overallScore >= 60) category = 'DEVELOPING';
  else if (overallScore >= 40) category = 'AT_RISK';
  else category = 'CRITICAL';

  const strengths = [];
  const weaknesses = [];

  if (resumeScore >= 75) strengths.push('Strong ATS Resume Optimization');
  else weaknesses.push('Resume ATS Score needs keyword tuning');

  if (marketAlignmentScore >= 75) strengths.push('High market demand alignment');
  else weaknesses.push('Market match alignment can be expanded');

  if (appCount >= 3) strengths.push('Active application pipeline');
  else weaknesses.push('Low application submission volume');

  return {
    score: overallScore,
    category,
    breakdown: {
      profileQuality: profileScore,
      resumeReadiness: resumeScore,
      marketAlignment: marketAlignmentScore,
      skillReadiness: skillReadinessScore,
      applicationEffectiveness: appEffectivenessScore,
      interviewReadiness: interviewReadinessScore,
      careerMomentum: momentumScore
    },
    strengths,
    weaknesses,
    topPriority: weaknesses[0] || 'Maintain active momentum'
  };
};

/**
 * Generate Deduplicated AI Career Insights
 */
const generateAndSyncInsights = async (userId, healthData, bottlenecksData, roiData, risksData) => {
  const insightsToCreate = [];

  // Insight 1: Primary Bottleneck Insight
  if (bottlenecksData.primaryBottleneck) {
    const pb = bottlenecksData.primaryBottleneck;
    insightsToCreate.push({
      type: 'WARNING',
      category: 'CAREER_RISK',
      priority: pb.severity === 'CRITICAL' || pb.severity === 'HIGH' ? 'CRITICAL' : 'HIGH',
      title: `Action Required: ${pb.bottleneck.replace(/_/g, ' ')}`,
      description: pb.evidence,
      evidence: pb.evidence,
      confidence: pb.confidence || 90,
      recommendedAction: {
        title: pb.recommendedAction,
        deepLink: pb.bottleneck === 'LOW_ATS_SCORE' ? '/resume-studio' : '/dashboard',
        actionLabel: 'Resolve Bottleneck',
        impact: 'High Impact',
        effort: 'LOW',
        roi: 'HIGH'
      }
    });
  }

  // Insight 2: Highest ROI Action Insight
  if (roiData.highestROIAction) {
    const act = roiData.highestROIAction;
    insightsToCreate.push({
      type: 'RECOMMENDATION',
      category: 'CAREER_GROWTH',
      priority: 'HIGH',
      title: act.title,
      description: act.description,
      evidence: act.reason,
      confidence: 88,
      recommendedAction: {
        title: act.title,
        deepLink: act.deepLink,
        actionLabel: act.actionLabel,
        impact: act.impact,
        effort: act.effort,
        roi: act.roiCategory
      }
    });
  }

  // Save/Deduplicate Insights in DB
  const createdInsights = [];
  for (const item of insightsToCreate) {
    const hash = crypto.createHash('sha256').update(`${userId}-${item.title}-${item.category}`).digest('hex');
    try {
      const insight = await CareerInsight.findOneAndUpdate(
        { user: userId, insightHash: hash },
        {
          $set: {
            ...item,
            user: userId,
            insightHash: hash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdInsights.push(insight);
    } catch (e) {
      // Safe fallback if duplicate key
    }
  }

  return createdInsights;
};

/**
 * Master Predictive Intelligence Orchestrator
 */
const getPredictiveIntelligence = async (userId, forceRefresh = false) => {
  try {
    let profileDoc = await CareerIntelligenceProfile.findOne({ user: userId });
    const isStale = !profileDoc || forceRefresh || (Date.now() - new Date(profileDoc.lastAnalyzedAt).getTime() > 30 * 60 * 1000);

    const unifiedContext = await buildUnifiedContext(userId);

    const health = calculateCareerHealthScore(unifiedContext);
    const skillGaps = analyzeSkillGaps(unifiedContext);
    const bottlenecks = detectCareerBottlenecks(unifiedContext);
    const forecasts = generateCareerForecasts(unifiedContext);
    const opportunityPriority = evaluateOpportunityPriorities(unifiedContext);
    const roiActions = evaluateActionROI(unifiedContext);
    const risks = detectCareerRisks(unifiedContext);

    // Sync insights
    const insights = await generateAndSyncInsights(userId, health, bottlenecks, roiActions, risks);

    const updatePayload = {
      user: userId,
      targetRole: unifiedContext.user?.targetRole || 'Software Engineer',
      experienceLevel: unifiedContext.user?.profile?.experienceLevel || 'Mid-Level',
      primarySkills: skillGaps.skillStrengths,
      skillGaps: skillGaps.skillGaps,
      readinessScore: health.breakdown.resumeReadiness,
      marketAlignmentScore: health.breakdown.marketAlignment,
      careerMomentumScore: health.breakdown.careerMomentum,
      applicationEffectivenessScore: health.breakdown.applicationEffectiveness,
      interviewReadinessScore: health.breakdown.interviewReadiness,
      careerRiskScore: 100 - health.score,
      overallCareerHealthScore: health.score,
      healthCategory: health.category,
      primaryBottleneck: bottlenecks.primaryBottleneck,
      lastAnalyzedAt: new Date()
    };

    profileDoc = await CareerIntelligenceProfile.findOneAndUpdate(
      { user: userId },
      { $set: updatePayload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
      profile: profileDoc,
      careerHealth: health,
      skillGaps,
      bottlenecks,
      forecasts,
      opportunityPriority,
      roiActions,
      risks,
      insights
    };
  } catch (error) {
    console.error('Error generating predictive career intelligence:', error);
    throw error;
  }
};

module.exports = {
  calculateCareerHealthScore,
  getPredictiveIntelligence
};
