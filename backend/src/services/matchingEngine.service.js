const User = require('../models/User.model');
const Opportunity = require('../models/Opportunity.model');
const matchingService = require('./matching.service');
const notificationService = require('./notification.service');

const normalizeSkills = (skills) => {
  let list = [];
  if (Array.isArray(skills)) {
    list = skills;
  } else if (typeof skills === 'string') {
    list = skills.split(/[,;\n]/);
  }

  const set = new Set();
  for (const item of list) {
    if (item) {
      const cleaned = String(item).trim().toLowerCase();
      if (cleaned) {
        set.add(cleaned);
      }
    }
  }
  return Array.from(set);
};

const getDisplaySkill = (normSkill, originalCandidateSkills = [], originalRequirements = []) => {
  const allOriginals = [...originalCandidateSkills, ...originalRequirements];
  for (const orig of allOriginals) {
    if (orig && String(orig).trim().toLowerCase() === normSkill) {
      return String(orig).trim();
    }
  }
  return normSkill.charAt(0).toUpperCase() + normSkill.slice(1);
};

const calculateSkillMatch = (candidateSkills = [], requirements = []) => {
  const normCandidate = normalizeSkills(candidateSkills);
  const normRequirements = normalizeSkills(requirements);

  const matchedNorm = [];
  const missingNorm = [];

  for (const req of normRequirements) {
    if (normCandidate.includes(req)) {
      matchedNorm.push(req);
    } else {
      missingNorm.push(req);
    }
  }

  const matchedSkills = matchedNorm.map(s => getDisplaySkill(s, candidateSkills, requirements));
  const missingSkills = missingNorm.map(s => getDisplaySkill(s, candidateSkills, requirements));

  return {
    matchedSkills,
    missingSkills,
    matchedCount: matchedNorm.length,
    totalRequirements: normRequirements.length
  };
};

const getMatchLevel = (score) => {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  if (s >= 90) return 'excellent';
  if (s >= 75) return 'strong';
  if (s >= 60) return 'moderate';
  return 'low';
};

const generateMatchReasons = (context = {}) => {
  const {
    matchedCount,
    totalRequirements,
    matchedSkills = [],
    missingSkills = [],
    locationMatch,
    remoteMatch,
    hasSkills
  } = context;

  const reasons = [];

  if (!hasSkills) {
    reasons.push('Candidate profile currently has no skills listed. Add skills to your profile to calculate accurate technical alignment.');
  }

  if (totalRequirements === 0) {
    reasons.push('Opportunity has no specific technical requirements listed.');
  } else if (hasSkills) {
    reasons.push(`Matched ${matchedCount} of ${totalRequirements} required opportunity skill(s).`);
    if (matchedSkills.length > 0) {
      reasons.push(`Key matching skills: ${matchedSkills.slice(0, 4).join(', ')}.`);
    }
    if (missingSkills.length > 0) {
      reasons.push(`Missing skill gap(s): ${missingSkills.slice(0, 3).join(', ')}.`);
    }
  }

  if (locationMatch) {
    reasons.push('Opportunity location matches candidate preference or profile location.');
  }

  if (remoteMatch) {
    reasons.push('Remote role aligns with candidate remote work preferences.');
  }

  return reasons;
};

/**
 * Generate specific, data-driven recommendation text explaining alignment and skill gaps.
 */
const generateRecommendation = (score, context = {}) => {
  const { matchedSkills = [], missingSkills = [], company = 'this company' } = context;
  const matchedStr = matchedSkills.slice(0, 4).join(', ');
  const missingStr = missingSkills.slice(0, 3).join(', ');

  if (matchedStr && missingStr) {
    return `Your ${matchedStr} experience aligns with the requirements at ${company}, but the role requires additional ${missingStr} experience.`;
  }
  if (matchedStr && !missingStr) {
    return `Your ${matchedStr} background strongly satisfies all technical requirements for this position at ${company}.`;
  }
  if (!matchedStr && missingStr) {
    return `This role at ${company} requires ${missingStr} experience which is not currently listed on your candidate profile.`;
  }
  return `Your candidate profile aligns with the position requirements at ${company}.`;
};

const generateMatchForOpportunity = (userDoc, opportunityDoc) => {
  const candidateSkills = (userDoc.profile && Array.isArray(userDoc.profile.skills))
    ? userDoc.profile.skills
    : (Array.isArray(userDoc.skills) ? userDoc.skills : []);

  const requirements = Array.isArray(opportunityDoc.requirements)
    ? opportunityDoc.requirements
    : [];

  const hasSkills = candidateSkills.length > 0;
  const skillMatch = calculateSkillMatch(candidateSkills, requirements);

  // 1. Technical Skill Score (70% max weight)
  let skillScore = 0;
  if (hasSkills && skillMatch.totalRequirements > 0) {
    skillScore = Math.round((skillMatch.matchedCount / skillMatch.totalRequirements) * 70);
  } else if (hasSkills && skillMatch.totalRequirements === 0) {
    skillScore = 50;
  } else {
    skillScore = 0;
  }

  // 2. Location Alignment (10% weight)
  const candidateLocation = (userDoc.profile && userDoc.profile.location)
    ? userDoc.profile.location.toLowerCase()
    : (userDoc.location ? userDoc.location.toLowerCase() : '');
  const preferredLocations = (userDoc.profile && userDoc.profile.preferences && Array.isArray(userDoc.profile.preferences.preferredLocations))
    ? userDoc.profile.preferences.preferredLocations.map(l => String(l).toLowerCase())
    : [];
  const oppLocation = (opportunityDoc.location || '').toLowerCase();

  const locationMatch = Boolean(
    (candidateLocation && oppLocation && oppLocation.includes(candidateLocation)) ||
    preferredLocations.some(l => oppLocation.includes(l))
  );
  const locationScore = locationMatch ? 10 : 0;

  // 3. Remote Preference Alignment (10% weight)
  const remotePref = Boolean(userDoc.profile && userDoc.profile.preferences && userDoc.profile.preferences.remotePreference);
  const remoteMatch = Boolean(opportunityDoc.remote && remotePref);
  const remoteScore = remoteMatch ? 10 : (opportunityDoc.remote ? 5 : 0);

  // 4. Desired Role Title Alignment (10% weight)
  const desiredRoles = (userDoc.profile && userDoc.profile.preferences && Array.isArray(userDoc.profile.preferences.desiredRoles))
    ? userDoc.profile.preferences.desiredRoles.map(r => String(r).toLowerCase())
    : [];
  const oppTitle = (opportunityDoc.title || '').toLowerCase();
  const roleMatch = desiredRoles.some(r => oppTitle.includes(r) || r.includes(oppTitle));
  const roleScore = roleMatch ? 10 : 0;

  // Final Composite Score (0–100)
  const finalScore = Math.max(0, Math.min(100, skillScore + locationScore + remoteScore + roleScore));
  const matchLevel = getMatchLevel(finalScore);

  const reasons = generateMatchReasons({
    matchedCount: skillMatch.matchedCount,
    totalRequirements: skillMatch.totalRequirements,
    matchedSkills: skillMatch.matchedSkills,
    missingSkills: skillMatch.missingSkills,
    locationMatch,
    remoteMatch,
    hasSkills
  });

  const recommendation = generateRecommendation(finalScore, {
    matchedSkills: skillMatch.matchedSkills,
    missingSkills: skillMatch.missingSkills,
    company: opportunityDoc.company || 'this company'
  });

  // Category Breakdown Metrics
  const skillsBreakdownScore = skillMatch.totalRequirements > 0
    ? Math.round((skillMatch.matchedCount / skillMatch.totalRequirements) * 100)
    : (hasSkills ? 80 : 0);

  const experienceYears = (userDoc.profile && userDoc.profile.experience && Array.isArray(userDoc.profile.experience))
    ? userDoc.profile.experience.length * 2
    : 1;
  const experienceScore = Math.min(100, Math.max(40, experienceYears * 25));
  const locationBreakdownScore = locationMatch ? 100 : (candidateLocation ? 50 : 20);
  const jobTypeScore = 90;
  const workModeScore = remoteMatch ? 100 : 80;
  const profileCompleteness = Math.min(100, (hasSkills ? 40 : 10) + (candidateLocation ? 30 : 0) + (desiredRoles.length > 0 ? 30 : 0));

  const breakdown = {
    skills: skillsBreakdownScore,
    experience: experienceScore,
    location: locationBreakdownScore,
    jobType: jobTypeScore,
    workMode: workModeScore,
    profileCompleteness
  };

  return {
    user: userDoc._id,
    opportunity: opportunityDoc._id,
    score: finalScore,
    matchLevel,
    matchedSkills: skillMatch.matchedSkills,
    missingSkills: skillMatch.missingSkills,
    reasons,
    recommendation,
    breakdown,
    status: 'generated'
  };
};

const generateMatchesForUser = async (userId, limit = 20) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 50));

  const opportunities = await Opportunity.find({ isActive: true })
    .sort({ postedAt: -1, createdAt: -1 })
    .limit(safeLimit);

  let processed = 0;
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const opp of opportunities) {
    try {
      processed++;
      const payload = generateMatchForOpportunity(user, opp);
      
      const existingMatch = await matchingService.getMatchByUserAndOpportunity(user._id, opp._id);
      
      const matchDoc = await matchingService.createMatch(payload);

      if (existingMatch) {
        updated++;
      } else {
        created++;
        // Dispatch new match notification only for genuinely new matches
        if (matchDoc) {
          if (payload.score >= 90) {
            notificationService.createNotification({
              user: user._id,
              type: 'excellent_match',
              title: 'Excellent Match Found',
              message: `You have a ${payload.score}% match for ${opp.title} at ${opp.company}.`,
              link: `/dashboard/matches/${matchDoc._id}`
            }).catch(() => {});
          } else if (payload.score >= 75) {
            notificationService.createNotification({
              user: user._id,
              type: 'new_match',
              title: 'Strong Career Match',
              message: `A new ${payload.score}% career match is available for ${opp.title} at ${opp.company}.`,
              link: `/dashboard/matches/${matchDoc._id}`
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to process match for opportunity ${opp._id}: ${err.message}`);
      failed++;
    }
  }

  return {
    processed,
    created,
    updated,
    failed
  };
};

module.exports = {
  normalizeSkills,
  calculateSkillMatch,
  getMatchLevel,
  generateMatchReasons,
  generateRecommendation,
  generateMatchForOpportunity,
  generateMatchesForUser
};
