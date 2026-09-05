const Resume = require('../models/Resume.model');
const Application = require('../models/Application.model');
const Opportunity = require('../models/Opportunity.model');
const InterviewSession = require('../models/InterviewSession.model');

/**
 * Smart Priority Service - Evaluates candidate state and determines dominant focus & priorities
 */

const evaluateSmartPriorities = async (userId) => {
  try {
    // 1. Fetch user data safely
    let resume = null;
    let applications = [];
    let topOpportunity = null;
    let upcomingInterview = null;

    try {
      if (Resume) {
        resume = await Resume.findOne({ user: userId }).sort({ updatedAt: -1 }).lean();
      }
    } catch (err) {
      // safe fallback
    }

    try {
      if (Application) {
        applications = await Application.find({ user: userId }).sort({ updatedAt: -1 }).limit(10).lean();
      }
    } catch (err) {
      // safe fallback
    }

    try {
      if (Opportunity) {
        topOpportunity = await Opportunity.findOne({ status: 'ACTIVE', matchScore: { $gte: 75 } })
          .sort({ matchScore: -1 })
          .lean();
      }
    } catch (err) {
      // safe fallback
    }

    try {
      if (InterviewSession) {
        upcomingInterview = await InterviewSession.findOne({
          user: userId,
          status: { $in: ['SCHEDULED', 'IN_PROGRESS', 'PREPARING', 'COMPLETED'] }
        }).sort({ createdAt: -1 }).lean();
      }
    } catch (err) {
      // safe fallback
    }

    const priorities = [];
    let primaryFocus = 'CAREER_GROWTH';

    // Check conditions
    const atsScore = resume?.atsScore ?? resume?.score ?? 0;
    const hasWeakResume = !resume || atsScore < 65;

    const topMatchScore = topOpportunity?.matchScore ?? 0;
    const hasHighMatch = topOpportunity && topMatchScore >= 80;

    const activeInterviews = applications.filter(a =>
      ['INTERVIEWING', 'INTERVIEW_SCHEDULED', 'ASSESSMENT'].includes(a.status)
    );
    const hasInterviewSoon = upcomingInterview || activeInterviews.length > 0;

    const daysSinceLastActivity = calculateDaysInactive(applications, resume);
    const isInactive = daysSinceLastActivity >= 7;

    // Rule priority determination
    if (hasInterviewSoon) {
      primaryFocus = 'INTERVIEW_SOON';
      priorities.push({
        id: 'p-interview-ready',
        title: 'Practice Interview Now',
        description: upcomingInterview
          ? `You have an upcoming interview scheduled for ${upcomingInterview.targetRole || 'your target role'}. Prepare with AI simulation.`
          : `You have ${activeInterviews.length} active application(s) in interview phase. Conduct a mock practice now.`,
        category: 'interview',
        priority: 'critical',
        deepLink: '/interview-prep',
        actionLabel: 'Launch Interview Simulator',
        impact: 'High Impact (95% Readiness Boost)',
        reason: 'Active interview stage detected in your pipeline.',
        icon: 'mic'
      });
    }

    if (hasHighMatch) {
      if (primaryFocus === 'CAREER_GROWTH') primaryFocus = 'HIGH_MATCH_AVAILABLE';
      priorities.push({
        id: 'p-high-match',
        title: `Apply to Your ${topMatchScore || 95}% Job Match`,
        description: `Top match "${topOpportunity?.title || 'Senior Engineer'}" at ${topOpportunity?.company || 'Target Company'} perfectly aligns with your skills.`,
        category: 'opportunity',
        priority: hasInterviewSoon ? 'high' : 'critical',
        deepLink: '/match-analysis',
        actionLabel: 'Review & Tailor Application',
        impact: 'High Match Probability',
        reason: 'Strong skill & experience alignment detected by AI.',
        icon: 'target'
      });
    }

    if (hasWeakResume) {
      if (primaryFocus === 'CAREER_GROWTH') primaryFocus = 'WEAK_RESUME';
      priorities.push({
        id: 'p-resume-boost',
        title: atsScore > 0 ? `Improve Your Resume (Current ATS: ${atsScore}/100)` : 'Optimize Your Resume ATS Score',
        description: atsScore > 0
          ? 'Your ATS score can be improved by adding high-impact quantifiable metrics and missing keyword coverage.'
          : 'Upload or generate your resume to unlock hyper-personalized job matching and AI application features.',
        category: 'resume',
        priority: (primaryFocus === 'WEAK_RESUME') ? 'critical' : 'high',
        deepLink: '/resume-studio',
        actionLabel: 'Optimize Resume Now',
        impact: 'Essential Baseline',
        reason: atsScore > 0 ? 'Resume ATS score is below optimum threshold (75+).' : 'No complete resume uploaded yet.',
        icon: 'file-text'
      });
    }

    if (isInactive) {
      if (primaryFocus === 'CAREER_GROWTH') primaryFocus = 'INACTIVE_MOMENTUM';
      priorities.push({
        id: 'p-restart-momentum',
        title: 'Restart Your Career Momentum',
        description: `It has been ${daysSinceLastActivity} days since your last application or resume update. Take 5 minutes to keep your streak active.`,
        category: 'momentum',
        priority: 'high',
        deepLink: '/opportunity-discovery',
        actionLabel: 'Discover New Opportunities',
        impact: 'Maintain Pipeline Health',
        reason: 'Inactive streak detected over 7 days.',
        icon: 'zap'
      });
    }

    if (applications.length > 0 && !hasInterviewSoon) {
      priorities.push({
        id: 'p-pipeline-followup',
        title: `Track ${applications.length} Active Application(s)`,
        description: 'Review response status, follow up on pending applications, or send tailored cover letters.',
        category: 'application',
        priority: 'medium',
        deepLink: '/applications',
        actionLabel: 'Manage Pipeline',
        impact: 'Response Optimization',
        reason: 'Active job applications logged in tracker.',
        icon: 'briefcase'
      });
    }

    // Default fallback priority if no specific triggers fired
    if (priorities.length === 0) {
      priorities.push({
        id: 'p-explore-jobs',
        title: 'Discover High-Match Career Opportunities',
        description: 'Explore AI-curated opportunity matches tailored specifically to your background and career goals.',
        category: 'opportunity',
        priority: 'high',
        deepLink: '/opportunity-discovery',
        actionLabel: 'Browse Opportunities',
        impact: 'Career Exploration',
        reason: 'Your profile is ready for discovery.',
        icon: 'compass'
      });
    }

    return {
      primaryFocus,
      smartPriorities: priorities
    };
  } catch (error) {
    console.error('Error in evaluateSmartPriorities:', error);
    return {
      primaryFocus: 'CAREER_GROWTH',
      smartPriorities: [
        {
          id: 'p-default',
          title: 'Optimize Your Career Profile',
          description: 'Keep your resume updated and analyze top matching job openings.',
          category: 'general',
          priority: 'high',
          deepLink: '/resume-studio',
          actionLabel: 'Go to Resume Studio',
          impact: 'Core Setup',
          reason: 'Recommended starting point.',
          icon: 'target'
        }
      ]
    };
  }
};

function calculateDaysInactive(applications, resume) {
  const dates = [];
  if (resume?.updatedAt) dates.push(new Date(resume.updatedAt));
  if (applications && applications.length > 0) {
    applications.forEach(a => {
      if (a.updatedAt) dates.push(new Date(a.updatedAt));
      if (a.createdAt) dates.push(new Date(a.createdAt));
    });
  }

  if (dates.length === 0) return 0;
  const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const diffMs = Date.now() - latestDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

module.exports = {
  evaluateSmartPriorities
};
