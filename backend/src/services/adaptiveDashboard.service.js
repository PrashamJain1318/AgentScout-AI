const Resume = require('../models/Resume.model');
const Application = require('../models/Application.model');
const InterviewSession = require('../models/InterviewSession.model');

/**
 * Adaptive Dashboard Service - Builds dynamic journey roadmap, AI insights, and widget priorities
 */

const getJourneyRoadmap = async (userId) => {
  try {
    const [resumeRes, appsCountRes, offerCountRes, interviewRes] = await Promise.allSettled([
      Resume ? Resume.findOne({ user: userId }).select('atsScore score').lean() : Promise.resolve(null),
      Application ? Application.countDocuments({ user: userId }) : Promise.resolve(0),
      Application ? Application.countDocuments({ user: userId, status: { $in: ['OFFER', 'OFFER_ACCEPTED', 'HIRED'] } }) : Promise.resolve(0),
      InterviewSession ? InterviewSession.countDocuments({ user: userId }) : Promise.resolve(0)
    ]);

    const resume = resumeRes.status === 'fulfilled' ? resumeRes.value : null;
    const appsCount = appsCountRes.status === 'fulfilled' ? appsCountRes.value : 0;
    const offerCount = offerCountRes.status === 'fulfilled' ? offerCountRes.value : 0;
    const interviewCount = interviewRes.status === 'fulfilled' ? interviewRes.value : 0;

    const atsScore = resume?.atsScore ?? resume?.score ?? 0;

    const phases = [
      {
        id: 'phase-profile',
        label: 'Profile Setup',
        description: 'Complete core career preferences & target roles',
        status: 'completed',
        progress: 100,
        deepLink: '/settings'
      },
      {
        id: 'phase-resume',
        label: 'Resume Optimization',
        description: atsScore >= 75 ? `ATS Score ${atsScore}% (Optimized)` : `Current ATS Score: ${atsScore}%`,
        status: atsScore >= 75 ? 'completed' : resume ? 'active' : 'upcoming',
        progress: Math.min(100, atsScore),
        deepLink: '/resume-studio'
      },
      {
        id: 'phase-opportunities',
        label: 'Job Discovery & AI Match',
        description: 'Discover & analyze high-match job postings',
        status: atsScore >= 70 ? 'active' : 'upcoming',
        progress: atsScore >= 70 ? 85 : 30,
        deepLink: '/opportunity-discovery'
      },
      {
        id: 'phase-applications',
        label: 'Application Pipeline',
        description: appsCount > 0 ? `${appsCount} application(s) tracked` : 'Prepare & submit tailored applications',
        status: appsCount > 0 ? (offerCount > 0 ? 'completed' : 'active') : 'upcoming',
        progress: Math.min(100, appsCount * 25),
        deepLink: '/applications'
      },
      {
        id: 'phase-interviews',
        label: 'Interview Practice',
        description: interviewCount > 0 ? `${interviewCount} session(s) completed` : 'AI mock interviews & behavioral prep',
        status: interviewCount > 0 ? 'completed' : (appsCount > 0 ? 'active' : 'upcoming'),
        progress: Math.min(100, interviewCount * 33 + (appsCount > 0 ? 30 : 0)),
        deepLink: '/interview-prep'
      },
      {
        id: 'phase-growth',
        label: 'Offer & Career OS',
        description: offerCount > 0 ? 'Offer received! Manage career growth' : 'Offer negotiation & acceleration',
        status: offerCount > 0 ? 'completed' : 'upcoming',
        progress: offerCount > 0 ? 100 : 15,
        deepLink: '/career-os'
      }
    ];

    return phases;
  } catch (error) {
    console.error('Error generating journey roadmap:', error);
    return [
      { id: 'phase-profile', label: 'Profile Setup', status: 'completed', progress: 100, deepLink: '/settings' },
      { id: 'phase-resume', label: 'Resume Optimization', status: 'active', progress: 60, deepLink: '/resume-studio' },
      { id: 'phase-opportunities', label: 'Job Discovery', status: 'upcoming', progress: 20, deepLink: '/opportunity-discovery' },
      { id: 'phase-applications', label: 'Applications', status: 'upcoming', progress: 0, deepLink: '/applications' },
      { id: 'phase-interviews', label: 'Interviews', status: 'upcoming', progress: 0, deepLink: '/interview-prep' },
      { id: 'phase-growth', label: 'Career OS', status: 'upcoming', progress: 0, deepLink: '/career-os' }
    ];
  }
};

const getAIDailyInsight = (primaryFocus) => {
  const insights = {
    WEAK_RESUME: {
      title: 'ATS Keyword Match Strategy',
      category: 'Resume Optimization',
      tip: 'Resumes with 80%+ exact keyword match to job descriptions are 4x more likely to clear automated ATS screeners.',
      deepLink: '/resume-studio',
      deepLinkLabel: 'Optimize in Resume Studio',
      rationale: 'Tailored for your current resume ATS score optimization.'
    },
    HIGH_MATCH_AVAILABLE: {
      title: 'High-Match Application Timing',
      category: 'Job Strategy',
      tip: 'Applying within the first 48 hours of job posting increases interview callback rates by up to 60%.',
      deepLink: '/match-analysis',
      deepLinkLabel: 'View Best Match Opportunities',
      rationale: 'Selected because you have 85%+ job matches waiting.'
    },
    INTERVIEW_SOON: {
      title: 'STAR Method Formatting',
      category: 'Interview Mastery',
      tip: 'Frame behavioral answers using Situation, Task, Action, and Result (quantified metrics boost candidate ranking).',
      deepLink: '/interview-prep',
      deepLinkLabel: 'Start Mock Interview',
      rationale: 'Suggested for active interview candidates.'
    },
    INACTIVE_MOMENTUM: {
      title: 'Daily Micro-Habits',
      category: 'Career Momentum',
      tip: 'Submitting just 2 high-quality tailored applications per week keeps your candidate pipeline active and predictable.',
      deepLink: '/opportunity-discovery',
      deepLinkLabel: 'Explore Jobs',
      rationale: 'Tailored to boost your weekly career momentum score.'
    },
    CAREER_GROWTH: {
      title: 'Proactive Career Intelligence',
      category: 'Career Growth',
      tip: 'Monitor market trends and keep 3 secondary target companies in your active watchlist at all times.',
      deepLink: '/career-os',
      deepLinkLabel: 'View Career OS',
      rationale: 'Generated for career growth and offer acceleration.'
    }
  };

  return insights[primaryFocus] || insights.CAREER_GROWTH;
};

const calculateWidgetPriority = (primaryFocus) => {
  switch (primaryFocus) {
    case 'WEAK_RESUME':
      return ['greeting', 'priority', 'journey', 'momentum', 'readiness', 'insight', 'opportunities', 'today_plan', 'agent', 'activity'];
    case 'HIGH_MATCH_AVAILABLE':
      return ['greeting', 'priority', 'opportunities', 'journey', 'momentum', 'readiness', 'insight', 'today_plan', 'agent', 'activity'];
    case 'INTERVIEW_SOON':
      return ['greeting', 'priority', 'today_plan', 'insight', 'journey', 'momentum', 'readiness', 'opportunities', 'agent', 'activity'];
    case 'INACTIVE_MOMENTUM':
      return ['greeting', 'priority', 'momentum', 'opportunities', 'journey', 'insight', 'readiness', 'today_plan', 'agent', 'activity'];
    default:
      return ['greeting', 'priority', 'journey', 'momentum', 'readiness', 'opportunities', 'insight', 'today_plan', 'agent', 'activity'];
  }
};

module.exports = {
  getJourneyRoadmap,
  getAIDailyInsight,
  calculateWidgetPriority
};
