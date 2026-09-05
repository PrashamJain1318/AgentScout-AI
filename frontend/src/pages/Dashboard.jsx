import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import DashboardHero from "../components/dashboard/DashboardHero";
import NextBestActionCard from "../components/dashboard/NextBestActionCard";
import CareerSnapshot from "../components/dashboard/CareerSnapshot";
import TodayFocus from "../components/dashboard/TodayFocus";
import OpportunitySpotlight from "../components/dashboard/OpportunitySpotlight";
import AgentStatusCard from "../components/dashboard/AgentStatusCard";
import RecentActivitySection from "../components/dashboard/RecentActivitySection";

import { getRecommendedOpportunities } from "../services/opportunities.api";
import { getApplications, getApplicationAnalytics } from "../services/applications.api";
import { getNotifications } from "../services/notifications.api";
import { getResume } from "../services/resume.api";
import { getInterviewReadiness } from "../services/interview.api";
import { getTodayPlan } from "../services/careerPlanner.api";
import { getMonitor } from "../services/opportunityMonitor.api";
import { getSnapshot as getOSSnapshot } from "../services/careerOS.api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Independent per-section states for zero blocking
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState(null);

  const [applications, setApplications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [actLoading, setActLoading] = useState(true);

  const [resumeData, setResumeData] = useState(null);
  const [interviewReadiness, setInterviewReadiness] = useState(null);
  const [plannerData, setPlannerData] = useState(null);
  const [monitorData, setMonitorData] = useState(null);
  const [osSnapshot, setOsSnapshot] = useState(null);

  // Independent asynchronous fetch handlers
  const fetchRecommendations = async () => {
    setRecLoading(true);
    setRecError(null);
    try {
      const resData = await getRecommendedOpportunities();
      const list = resData.opportunities || resData.data || resData || [];
      setRecommendations(Array.isArray(list) ? list : []);
    } catch (err) {
      setRecError("Unable to load top recommended opportunities.");
    } finally {
      setRecLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const resData = await getApplications();
      const list = resData.applications || resData.data || resData || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchRecentActivities = async () => {
    setActLoading(true);
    try {
      const resData = await getNotifications({ page: 1, limit: 4 });
      const list = resData.notifications || resData.data || [];
      setRecentActivities(Array.isArray(list) ? list : []);
    } catch (err) {
      // Non-blocking
    } finally {
      setActLoading(false);
    }
  };

  const fetchResumeHealth = async () => {
    try {
      const resData = await getResume();
      setResumeData(resData.resume || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchInterviewData = async () => {
    try {
      const res = await getInterviewReadiness();
      setInterviewReadiness(res.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchPlanner = async () => {
    try {
      const res = await getTodayPlan();
      setPlannerData(res.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchMonitorData = async () => {
    try {
      const res = await getMonitor();
      setMonitorData(res.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchOS = async () => {
    try {
      const res = await getOSSnapshot();
      setOsSnapshot(res.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  useEffect(() => {
    // Parallel non-blocking execution using Promise.allSettled
    Promise.allSettled([
      fetchRecommendations(),
      fetchApplications(),
      fetchRecentActivities(),
      fetchResumeHealth(),
      fetchInterviewData(),
      fetchPlanner(),
      fetchMonitorData(),
      fetchOS(),
    ]);
  }, []);

  return (
    <div className="dashboard-clean-container">
      {/* SECTION 1 — WELCOME HERO */}
      <DashboardHero
        user={user}
        osSnapshot={osSnapshot}
        onNavigate={navigate}
      />

      {/* SECTION 2 — THE MOST IMPORTANT CARD */}
      <NextBestActionCard
        osSnapshot={osSnapshot}
        plannerData={plannerData}
        onNavigate={navigate}
      />

      {/* SECTION 3 — CAREER SNAPSHOT */}
      <CareerSnapshot
        osSnapshot={osSnapshot}
        resumeData={resumeData}
        applicationsCount={applications.length}
        interviewReadiness={interviewReadiness}
      />

      {/* SECTION 4 — TODAY'S PLAN */}
      <TodayFocus
        plannerData={plannerData}
        onNavigate={navigate}
      />

      {/* SECTION 5 — OPPORTUNITY SPOTLIGHT */}
      <OpportunitySpotlight
        recommendations={recommendations}
        loading={recLoading}
        error={recError}
        onNavigate={navigate}
      />

      {/* SECTION 6 — AI AGENT STATUS */}
      <AgentStatusCard
        osSnapshot={osSnapshot}
        monitorData={monitorData}
        onNavigate={navigate}
      />

      {/* SECTION 7 — ACTIVITY TIMELINE */}
      <RecentActivitySection
        recentActivities={recentActivities}
        loading={actLoading}
        onNavigate={navigate}
      />
    </div>
  );
};

export default Dashboard;
