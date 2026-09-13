import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getResume } from "../services/resume.api";
import { getApplications } from "../services/applications.api";
import { getInterviewReadiness } from "../services/interview.api";
import { getTodayPlan } from "../services/careerPlanner.api";
import { getMonitor } from "../services/opportunityMonitor.api";
import { getSnapshot as getOSSnapshot } from "../services/careerOS.api";
import { getPersonalization } from "../services/personalization.api";

/**
 * useCareerState — Reliable single source of authenticated user career data.
 * Consolidates real backend state without inventing fake default metrics or demo values.
 */
export const useCareerState = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [resumeData, setResumeData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviewReadiness, setInterviewReadiness] = useState(null);
  const [plannerData, setPlannerData] = useState(null);
  const [monitorData, setMonitorData] = useState(null);
  const [osSnapshot, setOsSnapshot] = useState(null);
  const [personalization, setPersonalization] = useState(null);

  const fetchCareerState = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      getResume(),
      getApplications(),
      getInterviewReadiness(),
      getTodayPlan(),
      getMonitor(),
      getOSSnapshot(),
      getPersonalization()
    ]);

    // 1. Resume
    if (results[0].status === "fulfilled" && results[0].value) {
      setResumeData(results[0].value.resume || results[0].value.data || results[0].value);
    } else {
      setResumeData(null);
    }

    // 2. Applications
    if (results[1].status === "fulfilled" && results[1].value) {
      const apps = results[1].value.applications || results[1].value.data || results[1].value;
      setApplications(Array.isArray(apps) ? apps : []);
    } else {
      setApplications([]);
    }

    // 3. Interview Readiness
    if (results[2].status === "fulfilled" && results[2].value) {
      setInterviewReadiness(results[2].value.data || results[2].value);
    } else {
      setInterviewReadiness(null);
    }

    // 4. Today Planner
    if (results[3].status === "fulfilled" && results[3].value) {
      setPlannerData(results[3].value.data || results[3].value);
    } else {
      setPlannerData(null);
    }

    // 5. Monitor
    if (results[4].status === "fulfilled" && results[4].value) {
      setMonitorData(results[4].value.data || results[4].value);
    } else {
      setMonitorData(null);
    }

    // 6. Career OS Snapshot
    if (results[5].status === "fulfilled" && results[5].value) {
      setOsSnapshot(results[5].value.data || results[5].value);
    } else {
      setOsSnapshot(null);
    }

    // 7. Personalization
    if (results[6].status === "fulfilled" && results[6].value) {
      setPersonalization(results[6].value.data || results[6].value);
    } else {
      setPersonalization(null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCareerState();
  }, [fetchCareerState]);

  // Derived real data availability flags
  const profile = user?.profile || {};
  const targetRole = user?.targetRole || profile.targetRole || null;
  const firstName = user?.firstName || (user?.name ? user.name.split(" ")[0] : null);

  const hasTargetRole = Boolean(targetRole && targetRole.trim());
  const hasResume = Boolean(resumeData && (resumeData._id || resumeData.fileName || resumeData.parsedText));
  const atsScore = resumeData?.scores?.ats ?? resumeData?.atsScore ?? null;
  const hasAtsScore = typeof atsScore === "number" && !isNaN(atsScore);

  const applicationsCount = applications.length;
  const activeApplicationsCount = applications.filter(
    (a) => a.status && !["rejected", "withdrawn"].includes(a.status.toLowerCase())
  ).length;

  const interviewScore = interviewReadiness?.readinessScore ?? interviewReadiness?.overallScore ?? null;
  const hasInterviewScore = typeof interviewScore === "number" && !isNaN(interviewScore);

  const userSkills = Array.isArray(profile.skills) && profile.skills.length > 0
    ? profile.skills
    : Array.isArray(resumeData?.skills) && resumeData.skills.length > 0
    ? resumeData.skills
    : [];

  const hasSkills = userSkills.length > 0;

  const careerScore = osSnapshot?.careerScore ?? osSnapshot?.readinessMetrics?.overall ?? null;
  const hasCareerScore = typeof careerScore === "number" && !isNaN(careerScore);

  const momentumScore = personalization?.momentum?.score ?? osSnapshot?.momentum?.score ?? null;
  const hasMomentumScore = typeof momentumScore === "number" && !isNaN(momentumScore);

  return {
    user,
    profile,
    firstName,
    targetRole,
    hasTargetRole,

    resumeData,
    hasResume,
    atsScore,
    hasAtsScore,

    applications,
    applicationsCount,
    activeApplicationsCount,

    interviewReadiness,
    interviewScore,
    hasInterviewScore,

    userSkills,
    hasSkills,

    plannerData,
    monitorData,

    osSnapshot,
    careerScore,
    hasCareerScore,

    personalization,
    momentumScore,
    hasMomentumScore,

    loading,
    refetch: fetchCareerState
  };
};

export default useCareerState;
