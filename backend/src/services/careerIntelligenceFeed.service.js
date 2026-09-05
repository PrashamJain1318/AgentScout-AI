const { buildUnifiedContext } = require('./careerAgentContext.service');
const { getCareerEvents } = require('./careerEvent.service');

/**
 * Priority weighting constants for ranking intelligence items
 */
const PRIORITY_WEIGHTS = { CRITICAL: 100, HIGH: 75, MEDIUM: 50, LOW: 25 };
const IMPACT_WEIGHTS = { VERY_HIGH: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
const URGENCY_WEIGHTS = { IMMEDIATE: 30, HIGH: 20, MODERATE: 10, LOW: 5 };

/**
 * Generate prioritized, ranked AI Intelligence Feed items
 */
const generateIntelligenceFeed = async (userId, options = {}) => {
  const { limit = 10, category, priority } = options;

  const [unifiedContext, eventsResult] = await Promise.all([
    buildUnifiedContext(userId),
    getCareerEvents(userId, { limit: 15, includeArchived: false })
  ]);

  const user = unifiedContext.user || {};
  const resume = unifiedContext.resume || {};
  const applications = Array.isArray(unifiedContext.applications) ? unifiedContext.applications : (unifiedContext.rawApplications || []);
  const matches = Array.isArray(unifiedContext.matches) ? unifiedContext.matches : (unifiedContext.rawMatches || []);
  const interviewSessions = Array.isArray(unifiedContext.interviewSessions) ? unifiedContext.interviewSessions : (unifiedContext.rawInterviewSessions || []);
  const recentEvents = eventsResult.events || [];

  const rawFeedItems = [];

  // 1. High Match Discovery Feed Item
  const topMatch = matches.find(m => (m.matchScore || m.score || 0) >= 85);
  if (topMatch) {
    rawFeedItems.push({
      id: `feed-match-${topMatch._id || topMatch.id}`,
      title: '🔥 Excellent Opportunity Found',
      description: `You have a ${topMatch.matchScore || topMatch.score || 92}% match with ${topMatch.opportunity?.title || 'Target Role'} at ${topMatch.opportunity?.company || 'Target Company'}.`,
      priority: 'CRITICAL',
      impact: 'VERY_HIGH',
      urgency: 'HIGH',
      confidence: 94,
      category: 'OPPORTUNITY',
      reasoning: 'Strong experience and skill alignment detected with active job posting.',
      recommendedAction: 'Review job requirements and prepare application collateral.',
      deepLink: `/opportunities/${topMatch.opportunity?._id || topMatch.opportunity?.id || ''}`,
      actionLabel: 'View Opportunity',
      createdAt: new Date()
    });
  }

  // 2. Resume ATS Alert Feed Item
  const atsScore = resume.atsScore ?? resume.score ?? 0;
  if (!resume.exists || atsScore < 70) {
    rawFeedItems.push({
      id: 'feed-resume-ats',
      title: '⚠️ Resume Needs Attention',
      description: atsScore === 0 ? 'Upload or build an optimized ATS resume to unlock automated matching.' : `Your ATS score is ${atsScore}/100, which is below the recommended target of 70%.`,
      priority: atsScore === 0 ? 'CRITICAL' : 'HIGH',
      impact: 'HIGH',
      urgency: 'IMMEDIATE',
      confidence: 90,
      category: 'RESUME',
      reasoning: 'Automated candidate screeners filter out resumes below standard ATS thresholds.',
      recommendedAction: 'Optimize technical keywords and structural formatting in Resume Studio.',
      deepLink: '/dashboard/resume',
      actionLabel: 'Improve Resume',
      createdAt: new Date()
    });
  }

  // 3. Interview Readiness Alert
  const completedMocks = interviewSessions.filter(s => s.status === 'completed' || s.status === 'COMPLETED');
  if (applications.length > 0 && completedMocks.length === 0) {
    rawFeedItems.push({
      id: 'feed-interview-practice',
      title: '🎤 Interview Readiness Alert',
      description: 'You have active job applications submitted but 0 mock interview sessions completed.',
      priority: 'HIGH',
      impact: 'HIGH',
      urgency: 'HIGH',
      confidence: 85,
      category: 'INTERVIEW',
      reasoning: 'Candidates who complete AI interview simulations double their interview callback success.',
      recommendedAction: 'Practice STAR method responses with AI Interview Coach.',
      deepLink: '/dashboard/interview-coach',
      actionLabel: 'Practice Interview',
      createdAt: new Date()
    });
  }

  // 4. Skill Opportunity Item
  const candidateSkills = new Set(((user.profile?.skills || []).concat(resume.skills || [])).map(s => String(s).toLowerCase()));
  if (!candidateSkills.has('typescript')) {
    rawFeedItems.push({
      id: 'feed-skill-ts',
      title: '📚 Skill Opportunity: TypeScript',
      description: 'TypeScript appears frequently across your strongest fullstack job matches.',
      priority: 'MEDIUM',
      impact: 'HIGH',
      urgency: 'MODERATE',
      confidence: 88,
      category: 'SKILL',
      reasoning: 'Adding in-demand technologies directly improves role match scores by up to 15%.',
      recommendedAction: 'Explore suggested skill targets in Career Planner.',
      deepLink: '/dashboard/career-planner',
      actionLabel: 'View Learning Plan',
      createdAt: new Date()
    });
  }

  // 5. Unapplied High Match Alert
  if (matches.length > 0 && applications.length === 0) {
    rawFeedItems.push({
      id: 'feed-unapplied-match',
      title: '🎯 High Priority Action Required',
      description: 'You have high-match opportunities available, but 0 active job applications logged.',
      priority: 'CRITICAL',
      impact: 'VERY_HIGH',
      urgency: 'IMMEDIATE',
      confidence: 92,
      category: 'APPLICATION',
      reasoning: 'Applying early to high-match roles dramatically increases recruiter response rates.',
      recommendedAction: 'Select a top matching role and submit your application package.',
      deepLink: '/opportunities',
      actionLabel: 'Prepare Application',
      createdAt: new Date()
    });
  }

  // Convert Recent Events into Timeline Feed Insights
  recentEvents.slice(0, 3).forEach((ev) => {
    rawFeedItems.push({
      id: `feed-event-${ev._id}`,
      title: `⚡ ${ev.title}`,
      description: ev.description,
      priority: ev.priority || 'MEDIUM',
      impact: ev.impact || 'MEDIUM',
      urgency: 'MODERATE',
      confidence: 95,
      category: ev.category || 'CAREER_ACTION',
      reasoning: `Logged from ${ev.sourceModule || 'system'} activity timeline.`,
      recommendedAction: 'View timeline history details.',
      deepLink: '/dashboard/intelligence',
      actionLabel: 'View Timeline',
      createdAt: ev.occurredAt || ev.createdAt
    });
  });

  // Optional Filtering
  let filteredItems = rawFeedItems;
  if (category) {
    filteredItems = filteredItems.filter(item => item.category.toUpperCase() === category.toUpperCase());
  }
  if (priority) {
    filteredItems = filteredItems.filter(item => item.priority.toUpperCase() === priority.toUpperCase());
  }

  // Ranking Algorithm (Priority + Impact + Urgency + Confidence)
  filteredItems.sort((a, b) => {
    const scoreA = (PRIORITY_WEIGHTS[a.priority] || 50) + (IMPACT_WEIGHTS[a.impact] || 20) + (URGENCY_WEIGHTS[a.urgency] || 10) + (a.confidence * 0.2);
    const scoreB = (PRIORITY_WEIGHTS[b.priority] || 50) + (IMPACT_WEIGHTS[b.impact] || 20) + (URGENCY_WEIGHTS[b.urgency] || 10) + (b.confidence * 0.2);
    return scoreB - scoreA;
  });

  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  return filteredItems.slice(0, parsedLimit);
};

module.exports = {
  generateIntelligenceFeed
};
