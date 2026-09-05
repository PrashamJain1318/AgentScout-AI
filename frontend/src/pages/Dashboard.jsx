import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import PageTransition from "../components/motion/PageTransition";
import AdaptiveDashboard from "../components/personalization/AdaptiveDashboard";

import QuickActions from "../components/dashboard/QuickActions";
import CareerReadinessHero from "../components/dashboard/CareerReadinessHero";
import NextBestAction from "../components/dashboard/NextBestAction";
import CareerHealthSnapshot from "../components/dashboard/CareerHealthSnapshot";
import TopOpportunities from "../components/dashboard/TopOpportunities";
import TodayCareerPlan from "../components/dashboard/TodayCareerPlan";
import CareerAgentWidget from "../components/dashboard/CareerAgentWidget";
import SmartActivityFeed from "../components/dashboard/SmartActivityFeed";
import CareerIntelligenceWidget from "../components/dashboard/CareerIntelligenceWidget";

import { getRecommendedOpportunities } from "../services/opportunities.api";
import { getApplications } from "../services/applications.api";
import { getNotifications } from "../services/notifications.api";
import { getResume } from "../services/resume.api";
import { getInterviewReadiness } from "../services/interview.api";
import { getTodayPlan } from "../services/careerPlanner.api";
import { getMonitor } from "../services/opportunityMonitor.api";
import { getSnapshot as getOSSnapshot } from "../services/careerOS.api";
import { getPersonalization, refreshPersonalization } from "../services/personalization.api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Progressive non-blocking state boundaries
  const [loading, setLoading] = useState(true);
  const [personalization, setPersonalization] = useState(null);
  const [refreshingPersonalization, setRefreshingPersonalization] = useState(false);

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

  // Individual safe fetchers
  const fetchPersonalizationData = async () => {
    try {
      const res = await getPersonalization();
      setPersonalization(res?.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const handleRefreshPersonalization = async () => {
    setRefreshingPersonalization(true);
    try {
      const res = await refreshPersonalization();
      setPersonalization(res?.data || null);
    } catch (err) {
      // Non-blocking
    } finally {
      setRefreshingPersonalization(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecLoading(true);
    setRecError(null);
    try {
      const resData = await getRecommendedOpportunities();
      const list = resData?.opportunities || resData?.data || resData || [];
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
      const list = resData?.applications || resData?.data || resData || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchRecentActivities = async () => {
    setActLoading(true);
    try {
      const resData = await getNotifications({ page: 1, limit: 4 });
      const list = resData?.notifications || resData?.data || [];
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
      setResumeData(resData?.resume || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchInterviewData = async () => {
    try {
      const res = await getInterviewReadiness();
      setInterviewReadiness(res?.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchPlanner = async () => {
    try {
      const res = await getTodayPlan();
      setPlannerData(res?.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchMonitorData = async () => {
    try {
      const res = await getMonitor();
      setMonitorData(res?.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchOS = async () => {
    try {
      const res = await getOSSnapshot();
      setOsSnapshot(res?.data || null);
    } catch (err) {
      // Non-blocking
    }
  };

  useEffect(() => {
    // Parallel non-blocking execution using Promise.allSettled
    Promise.allSettled([
      fetchPersonalizationData(),
      fetchRecommendations(),
      fetchApplications(),
      fetchRecentActivities(),
      fetchResumeHealth(),
      fetchInterviewData(),
      fetchPlanner(),
      fetchMonitorData(),
      fetchOS(),
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <PageTransition className="dashboard-clean-container">
      <AdaptiveDashboard
        user={user}
        personalization={personalization}
        onRefresh={handleRefreshPersonalization}
        refreshing={refreshingPersonalization}
        onNavigate={navigate}
      >
        {/* 2. QUICK ACTIONS ROW */}
        <QuickActions onNavigate={navigate} />

        {/* 3. CAREER READINESS HERO */}
        <CareerReadinessHero osSnapshot={osSnapshot} onNavigate={navigate} />

        {/* 4. NEXT BEST ACTION (DOMINANT CARD) */}
        <NextBestAction
          osSnapshot={osSnapshot}
          plannerData={plannerData}
          onNavigate={navigate}
        />

        {/* 5. CAREER HEALTH SNAPSHOT (5-CARD GRID) */}
        <CareerHealthSnapshot
          osSnapshot={osSnapshot}
          resumeData={resumeData}
          applicationsCount={applications.length}
          interviewReadiness={interviewReadiness}
          onNavigate={navigate}
        />

        {/* 5.5 CAREER INTELLIGENCE PROACTIVE WIDGET */}
        <CareerIntelligenceWidget onNavigate={navigate} />

        {/* 6. TOP 3 OPPORTUNITIES */}
        <TopOpportunities
          recommendations={recommendations}
          loading={recLoading}
          error={recError}
          onNavigate={navigate}
        />

        {/* 7. SPLIT SECTION — TODAY'S PLAN & AI CAREER AGENT */}
        <div className="db-split-grid">
          <TodayCareerPlan plannerData={plannerData} onNavigate={navigate} />
          <CareerAgentWidget
            osSnapshot={osSnapshot}
            monitorData={monitorData}
            onNavigate={navigate}
          />
        </div>

        {/* 8. SMART ACTIVITY FEED */}
        <SmartActivityFeed
          recentActivities={recentActivities}
          loading={actLoading}
          onNavigate={navigate}
        />
      </AdaptiveDashboard>
    </PageTransition>
  );
};

export default Dashboard;
