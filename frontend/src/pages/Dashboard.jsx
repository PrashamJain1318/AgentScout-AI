import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCareerState } from "../hooks/useCareerState";

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

import NewUserDashboard from "../components/dashboard/NewUserDashboard";

import { getRecommendedOpportunities } from "../services/opportunities.api";
import { getNotifications } from "../services/notifications.api";
import { refreshPersonalization } from "../services/personalization.api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    personalization,
    applications,
    resumeData,
    interviewReadiness,
    plannerData,
    monitorData,
    osSnapshot,
    hasTargetRole,
    hasResume,
    hasSkills,
    firstName,
    loading: careerStateLoading,
    refetch
  } = useCareerState();

  const [refreshingPersonalization, setRefreshingPersonalization] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState(null);

  const [recentActivities, setRecentActivities] = useState([]);
  const [actLoading, setActLoading] = useState(true);

  const handleRefreshPersonalization = async () => {
    setRefreshingPersonalization(true);
    try {
      await refreshPersonalization();
      await refetch();
    } catch (err) {
      // Non-blocking
    } finally {
      setRefreshingPersonalization(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
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

  const fetchRecentActivities = async () => {
    if (!user) return;
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

  useEffect(() => {
    if (user) {
      fetchRecommendations();
      fetchRecentActivities();
    } else {
      setRecommendations([]);
      setRecentActivities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isNewUser = !hasTargetRole && !hasResume && applications.length === 0;

  return (
    <PageTransition className="dashboard-clean-container">
      {isNewUser ? (
        <NewUserDashboard
          user={user}
          firstName={firstName}
          hasTargetRole={hasTargetRole}
          hasResume={hasResume}
          hasSkills={hasSkills}
          onNavigate={navigate}
        />
      ) : (
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
      )}
    </PageTransition>
  );
};

export default Dashboard;

