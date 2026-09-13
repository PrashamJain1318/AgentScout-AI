/**
 * getCareerHealthMetrics — Centralized selector & scoring utility for AgentScout Career OS.
 * Calculates composite Career Health score, dimension breakdown, positive/negative impact factors,
 * next best action, current stage, and momentum metrics strictly from authentic user data.
 */
export const getCareerHealthMetrics = (state = {}) => {
  // Extract user & profile info
  const user = state.user || state.rawState?.user || {};
  const profile = state.profile || user.profile || {};
  const targetRole = state.targetRole || profile.targetRole || user.targetRole || null;
  const hasTargetRole = Boolean(targetRole && targetRole.trim());
  const firstName = state.firstName || user.firstName || (user.name ? user.name.split(" ")[0] : "Candidate");

  // Skills
  const candidateSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const resumeSkills = Array.isArray(state.resumeData?.extractedData?.skills || state.resumeData?.skills)
    ? (state.resumeData?.extractedData?.skills || state.resumeData?.skills)
    : [];
  const userSkills = state.userSkills || Array.from(new Set([...candidateSkills, ...resumeSkills]));
  const hasSkills = userSkills.length > 0;

  // 1. Profile Score (0-100)
  let profileScore = 0;
  if (user.firstName) profileScore += 15;
  if (user.email) profileScore += 15;
  if (hasTargetRole) profileScore += 25;
  if (hasSkills) profileScore += 25;
  if (profile.location) profileScore += 10;
  if (profile.portfolioUrl || profile.githubUrl || profile.linkedinUrl) profileScore += 10;
  profileScore = Math.min(100, profileScore);

  const isProfileAvailable = Boolean(user._id || user.email || hasTargetRole || profileScore > 0);

  // 2. Resume / ATS Score
  const resumeData = state.resumeData || state.osSnapshot?.resumeState || null;
  const rawAts = state.atsScore ?? state.resumeData?.scores?.ats ?? state.resumeData?.atsScore ?? state.osSnapshot?.resumeState?.atsScore ?? null;
  const hasResume = state.hasResume ?? Boolean(resumeData && (resumeData._id || resumeData.fileName || resumeData.parsedText || rawAts !== null));
  const isAtsAvailable = hasResume && typeof rawAts === "number" && !isNaN(rawAts) && rawAts > 0;
  const atsScore = isAtsAvailable ? rawAts : null;

  // 3. Role Match / Opportunity Fit Score
  const totalMatches = state.totalMatches ?? state.osSnapshot?.opportunityState?.discovered ?? state.monitorData?.matchesCount ?? null;
  const rawMatch = state.avgMatchScore ?? state.osSnapshot?.readiness?.opportunityFit ?? state.monitorData?.averageMatchScore ?? null;
  const isMatchAvailable = (typeof totalMatches === "number" && totalMatches > 0) || (typeof rawMatch === "number" && rawMatch > 0);
  const avgMatchScore = isMatchAvailable ? rawMatch : null;

  // 4. Interview Readiness Score
  const interviewReadiness = state.interviewReadiness || state.osSnapshot?.interviewState || null;
  const rawInterview = state.interviewScore ?? interviewReadiness?.readinessScore ?? interviewReadiness?.overallScore ?? null;
  const mockAttempts = state.mockAttempts ?? interviewReadiness?.attempts ?? (Array.isArray(interviewReadiness?.history) ? interviewReadiness.history.length : 0);
  const isInterviewAvailable = (typeof mockAttempts === "number" && mockAttempts > 0) || (typeof rawInterview === "number" && rawInterview > 0);
  const interviewScore = isInterviewAvailable ? rawInterview : null;

  // Dimensions Map
  const dimensions = {
    profile: {
      key: "profile",
      label: "Profile",
      score: profileScore,
      available: isProfileAvailable,
      statusText: isProfileAvailable ? `${profileScore}%` : "Not started",
      link: "/dashboard/settings"
    },
    resume: {
      key: "resume",
      label: "Resume / ATS",
      score: isAtsAvailable ? atsScore : null,
      available: isAtsAvailable,
      statusText: isAtsAvailable ? `${atsScore}%` : (hasResume ? "Analysis pending" : "Not analyzed"),
      link: "/dashboard/resume"
    },
    roleMatch: {
      key: "roleMatch",
      label: "Role Match",
      score: isMatchAvailable ? avgMatchScore : null,
      available: isMatchAvailable,
      statusText: isMatchAvailable ? `${avgMatchScore}%` : "Not enough data",
      link: "/dashboard/opportunities"
    },
    interview: {
      key: "interview",
      label: "Interview",
      score: isInterviewAvailable ? interviewScore : null,
      available: isInterviewAvailable,
      statusText: isInterviewAvailable ? `${interviewScore}%` : "Not measured",
      link: "/dashboard/interview-coach"
    }
  };

  // Dimensions Available Count
  const validDimensionList = Object.values(dimensions).filter((d) => d.available && typeof d.score === "number" && d.score > 0);
  const availableDimensionsCount = validDimensionList.length;
  const totalDimensionsCount = 4;

  // Composite Score Calculation across ONLY valid dimensions
  const isNewUser = !hasTargetRole && !hasResume && (state.applicationsCount || 0) === 0 && !isInterviewAvailable;
  let compositeScore = null;

  if (availableDimensionsCount > 0) {
    const sum = validDimensionList.reduce((acc, d) => acc + d.score, 0);
    compositeScore = Math.round(sum / availableDimensionsCount);
    compositeScore = Math.min(100, Math.max(0, compositeScore));
  } else if (!isNewUser && profileScore > 0) {
    compositeScore = profileScore;
  }

  // Score Status Label & Color Thresholds
  let status = { label: "Not Available", level: "empty", color: "var(--text-muted, #94a3b8)" };
  if (compositeScore !== null && compositeScore > 0) {
    if (compositeScore >= 90) status = { label: "Excellent", level: "excellent", color: "#06b6d4" };
    else if (compositeScore >= 75) status = { label: "Strong", level: "strong", color: "#10b981" };
    else if (compositeScore >= 60) status = { label: "Developing", level: "developing", color: "#3b82f6" };
    else if (compositeScore >= 40) status = { label: "Building", level: "building", color: "#8b5cf6" };
    else status = { label: "Getting Started", level: "getting_started", color: "#f59e0b" };
  }

  // Dynamic "What's Affecting Your Score" Impact Factors
  const factors = [];

  // Profile Factor
  if (profileScore < 70) {
    factors.push({
      type: "negative",
      title: "Target role or profile skills incomplete",
      description: "Define your target role and technical skills to power high-precision AI opportunity matching.",
      link: "/dashboard/settings"
    });
  } else {
    factors.push({
      type: "positive",
      title: "Profile setup is strong",
      description: "Your career goals and primary candidate skills are configured.",
      link: "/dashboard/settings"
    });
  }

  // Resume Factor
  if (!isAtsAvailable) {
    factors.push({
      type: "negative",
      title: "Resume ATS data unavailable",
      description: "Upload and analyze your resume to measure applicant tracking system keywords and formatting.",
      link: "/dashboard/resume"
    });
  } else if (atsScore < 70) {
    factors.push({
      type: "negative",
      title: "Resume alignment needs improvement",
      description: `Your ATS score is currently ${atsScore}%, which may limit automated recruiter screening pass rates.`,
      link: "/dashboard/resume"
    });
  } else {
    factors.push({
      type: "positive",
      title: `Resume ATS score is strong (${atsScore}%)`,
      description: "Your resume includes role-aligned keywords for competitive recruiter parsing.",
      link: "/dashboard/resume"
    });
  }

  // Role Match Factor
  if (!isMatchAvailable) {
    factors.push({
      type: "negative",
      title: "Role match data is limited",
      description: "Save or explore target job listings to generate candidate match precision scores.",
      link: "/dashboard/opportunities"
    });
  } else if (avgMatchScore < 70) {
    factors.push({
      type: "negative",
      title: "Opportunity match alignment is moderate",
      description: `Average match score across active target listings is ${avgMatchScore}%.`,
      link: "/dashboard/opportunities"
    });
  } else {
    factors.push({
      type: "positive",
      title: `Strong opportunity match alignment (${avgMatchScore}%)`,
      description: "High candidate skill overlap detected with active market job postings.",
      link: "/dashboard/opportunities"
    });
  }

  // Interview Factor
  if (!isInterviewAvailable) {
    factors.push({
      type: "negative",
      title: "Interview readiness not measured",
      description: "Complete a practice session with the AI Interview Coach to evaluate STAR and technical readiness.",
      link: "/dashboard/interview-coach"
    });
  } else if (interviewScore < 70) {
    factors.push({
      type: "negative",
      title: "Interview readiness needs practice",
      description: `Your current interview readiness score is ${interviewScore}%. Practice mock sessions to boost confidence.`,
      link: "/dashboard/interview-coach"
    });
  } else {
    factors.push({
      type: "positive",
      title: `Interview readiness is strong (${interviewScore}%)`,
      description: "Demonstrated solid performance in mock technical and behavioral assessments.",
      link: "/dashboard/interview-coach"
    });
  }

  // Next Best Action (Targeting weakest or missing dimension)
  let nextBestAction = null;
  if (!hasTargetRole) {
    nextBestAction = {
      title: "Set Your Target Role",
      description: "Define your primary career target role and core skills to unlock accurate AI recommendations.",
      buttonText: "Set Target Role →",
      link: "/dashboard/settings",
      category: "profile"
    };
  } else if (!hasResume) {
    nextBestAction = {
      title: "Upload Your Resume",
      description: "Upload your resume to calculate your ATS compatibility score and extract key skills.",
      buttonText: "Upload Resume →",
      link: "/dashboard/resume",
      category: "resume"
    };
  } else if (isAtsAvailable && atsScore < 70) {
    nextBestAction = {
      title: "Improve Resume Alignment",
      description: "Your ATS analysis identified keyword gaps compared to target job descriptions.",
      buttonText: "Improve Resume →",
      link: "/dashboard/resume",
      category: "resume"
    };
  } else if (!isMatchAvailable) {
    nextBestAction = {
      title: "Discover Job Opportunities",
      description: "Explore AI-matched career postings and save roles to generate opportunity fit analytics.",
      buttonText: "Discover Opportunities →",
      link: "/dashboard/opportunities",
      category: "opportunities"
    };
  } else if (!isInterviewAvailable || interviewScore < 70) {
    nextBestAction = {
      title: "Practice AI Mock Interview",
      description: "Complete an interactive interview session to measure your behavioral & technical readiness.",
      buttonText: "Start Practice →",
      link: "/dashboard/interview-coach",
      category: "interview"
    };
  } else {
    nextBestAction = {
      title: "Maintain Career Momentum",
      description: "Your career profile is fully optimized. Keep tracking your active application pipeline.",
      buttonText: "View Applications →",
      link: "/dashboard/applications",
      category: "applications"
    };
  }

  // Dynamic Current Stage Derivation
  let currentStage = { key: "PROFILE_SETUP", label: "PROFILE SETUP", link: "/dashboard/settings" };
  const appsCount = state.applicationsCount ?? state.applications?.length ?? state.osSnapshot?.applicationState?.total ?? 0;
  const interviewApps = state.osSnapshot?.applicationState?.interviews ?? 0;
  const offerApps = state.osSnapshot?.applicationState?.offers ?? 0;

  if (offerApps > 0) {
    currentStage = { key: "OFFER_CAREER_OS", label: "OFFER & CAREER OS", link: "/dashboard/applications" };
  } else if (isInterviewAvailable || interviewApps > 0) {
    currentStage = { key: "INTERVIEW_PREPARATION", label: "INTERVIEW PREPARATION", link: "/dashboard/interview-coach" };
  } else if (appsCount > 0) {
    currentStage = { key: "APPLICATION_PIPELINE", label: "APPLICATION PIPELINE", link: "/dashboard/applications" };
  } else if (isMatchAvailable) {
    currentStage = { key: "JOB_DISCOVERY", label: "JOB DISCOVERY", link: "/dashboard/opportunities" };
  } else if (hasResume || isAtsAvailable) {
    currentStage = { key: "RESUME_OPTIMIZATION", label: "RESUME OPTIMIZATION", link: "/dashboard/resume" };
  } else {
    currentStage = { key: "PROFILE_SETUP", label: "PROFILE SETUP", link: "/dashboard/settings" };
  }

  // Career Momentum Metrics
  const activeEventsCount = (appsCount > 0 ? 1 : 0) + (isInterviewAvailable ? 1 : 0) + (hasResume ? 1 : 0) + (hasSkills ? 1 : 0);
  const momentumScore = state.momentumScore ?? state.osSnapshot?.momentum?.score ?? (activeEventsCount > 0 ? Math.min(100, Math.max(30, activeEventsCount * 25)) : 0);
  const momentumTrend = state.osSnapshot?.momentum?.trend || (activeEventsCount >= 3 ? "UP" : activeEventsCount >= 1 ? "STABLE" : "NEUTRAL");
  const momentumChange = state.osSnapshot?.momentum?.changePercentage || (activeEventsCount >= 3 ? 25 : 0);

  return {
    score: compositeScore,
    status,
    dimensions,
    availableDimensionsCount,
    totalDimensionsCount,
    factors,
    nextBestAction,
    currentStage,
    isNewUser,
    firstName,
    momentum: {
      score: momentumScore,
      trend: momentumTrend,
      changePercentage: momentumChange,
      activeEventsCount
    }
  };
};

export default getCareerHealthMetrics;
