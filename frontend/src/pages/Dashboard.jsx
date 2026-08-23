import { useEffect, useState, lazy, Suspense, Component } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Search,
  BookmarkCheck,
  Briefcase,
  Trophy,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  UserCheck,
  Bell,
  FileText,
  CheckSquare,
  Brain,
  Target,
  Radio,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ProfileSummaryCard from "../components/common/ProfileSummaryCard";
import MatchStatistics from "../components/dashboard/MatchStatistics";
import ApplicationStatistics from "../components/dashboard/ApplicationStatistics";
import OpportunityCard from "../components/common/OpportunityCard";
import RecentApplications from "../components/dashboard/RecentApplications";
import CareerCopilotPreview from "../components/dashboard/CareerCopilotPreview";
import NotificationItem from "../components/notifications/NotificationItem";
import { getRecommendedOpportunities } from "../services/opportunities.api";
import { getApplications, getApplicationAnalytics } from "../services/applications.api";
import { getCareerCopilotPlan } from "../services/careerCopilot.api";
import { getNotifications } from "../services/notifications.api";
import { getResume } from "../services/resume.api";
import { getInterviewReadiness } from "../services/interview.api";
import { getTodayPlan } from "../services/careerPlanner.api";
import { getMonitor } from "../services/opportunityMonitor.api";
import { getSnapshot as getOSSnapshot } from "../services/careerOS.api";

import CareerCoreFallback from "../components/three/CareerCoreFallback";

const CareerCore = lazy(() => import("../components/three/CareerCore"));

class ComponentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("Component error caught by boundary:", err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Time-based greeting helper
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Profile completion calculator
const calculateProfileCompletion = (user) => {
  if (!user) return { percentage: 0, missingFields: [] };
  let score = 0;
  const missingFields = [];

  if (user.firstName) score += 15; else missingFields.push("First Name");
  if (user.lastName) score += 15; else missingFields.push("Last Name");
  if (user.email) score += 20; else missingFields.push("Email");

  const p = user.profile || {};
  if (p.targetRole || p.headline) score += 20; else missingFields.push("Target Role");
  if (Array.isArray(p.skills) && p.skills.length > 0) score += 15; else missingFields.push("Skills");
  if (p.location) score += 15; else missingFields.push("Location");

  return { percentage: Math.min(100, score), missingFields };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Independent state for each section
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState(null);

  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState(null);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  const [copilot, setCopilot] = useState(null);
  const [copilotLoading, setCopilotLoading] = useState(true);

  const [recentActivities, setRecentActivities] = useState([]);
  const [actLoading, setActLoading] = useState(true);

  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);

  const [interviewReadiness, setInterviewReadiness] = useState(null);
  const [plannerData, setPlannerData] = useState(null);
  const [monitorData, setMonitorData] = useState(null);
  const [osSnapshot, setOsSnapshot] = useState(null);

  const firstName = user?.firstName || user?.name || "Candidate";
  const greeting = getGreeting();
  const profileCompletion = calculateProfileCompletion(user);

  // Fetch Recommended Opportunities
  const fetchRecommendations = async () => {
    setRecLoading(true);
    setRecError(null);
    try {
      const resData = await getRecommendedOpportunities();
      const list = resData.opportunities || resData.data || resData || [];
      setRecommendations(Array.isArray(list) ? list : []);
    } catch (err) {
      setRecError("Unable to load recommended opportunities.");
    } finally {
      setRecLoading(false);
    }
  };

  // Fetch Applications
  const fetchApplications = async () => {
    setAppLoading(true);
    setAppError(null);
    try {
      const resData = await getApplications();
      const list = resData.applications || resData.data || resData || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      setAppError("Unable to load recent applications.");
    } finally {
      setAppLoading(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const resData = await getApplicationAnalytics();
      setAnalytics(resData.data || resData.analytics || resData || {});
    } catch (err) {
      setAnalyticsError("Unable to load application pipeline analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch Career Copilot Preview
  const fetchCopilot = async () => {
    setCopilotLoading(true);
    try {
      const resData = await getCareerCopilotPlan();
      setCopilot(resData.data || resData.copilot || resData || null);
    } catch (err) {
      // Ignore
    } finally {
      setCopilotLoading(false);
    }
  };

  // Fetch Recent Activities for Activity Section
  const fetchRecentActivities = async () => {
    setActLoading(true);
    try {
      const resData = await getNotifications({ page: 1, limit: 5 });
      const list = resData.notifications || resData.data || [];
      setRecentActivities(Array.isArray(list) ? list : []);
    } catch (err) {
      // Ignore
    } finally {
      setActLoading(false);
    }
  };

  // Fetch Resume Health Data
  const fetchResumeHealth = async () => {
    setResumeLoading(true);
    try {
      const resData = await getResume();
      setResumeData(resData.resume || null);
    } catch (err) {
      // Ignore
    } finally {
      setResumeLoading(false);
    }
  };

  // Fetch Interview Readiness Data
  const fetchInterviewData = async () => {
    try {
      const res = await getInterviewReadiness();
      setInterviewReadiness(res.data || null);
    } catch (err) {
      // Ignore
    }
  };

  // Fetch Planner Data
  const fetchPlanner = async () => {
    try {
      const res = await getTodayPlan();
      setPlannerData(res.data || null);
    } catch (err) {
      // Ignore
    }
  };

  // Fetch Monitor Data
  const fetchMonitorData = async () => {
    try {
      const res = await getMonitor();
      setMonitorData(res.data || null);
    } catch (err) {
      // Ignore
    }
  };

  // Fetch Career OS Snapshot Data
  const fetchOS = async () => {
    try {
      const res = await getOSSnapshot();
      setOsSnapshot(res.data || null);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchApplications();
    fetchAnalytics();
    fetchCopilot();
    fetchRecentActivities();
    fetchResumeHealth();
    fetchInterviewData();
    fetchPlanner();
    fetchMonitorData();
    fetchOS();
  }, []);

  // Compute KPI Values
  const topMatchScore = recommendations.length > 0
    ? Math.max(...recommendations.map(r => r.matchScore || r.score || 0))
    : 0;

  const resumeScores = resumeData?.scores || { ats: 0, completeness: 0, skillsCoverage: 0 };
  const readScore = interviewReadiness?.readinessScore || 75;
  const overallScore = osSnapshot?.careerScore || 75;
  const readinessObj = {
    overall: overallScore,
    resume: resumeScores.ats || osSnapshot?.readiness?.resume || 75,
    skills: osSnapshot?.readiness?.skills || 70,
    application: osSnapshot?.readiness?.application || 65,
    interview: readScore || osSnapshot?.readiness?.interview || 75,
    profile: profileCompletion.percentage || 80,
    opportunities: topMatchScore || 85
  };

  return (
    <div className="dashboard-page">

      {/* 0. HERO: CAREER INTELLIGENCE COMMAND CENTER WITH 3D CAREER CORE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "24px",
          marginBottom: "24px",
          alignItems: "stretch",
        }}
        className="command-center-hero"
      >
        {/* Left Column: Command Center Greeting & Readiness Overview */}
        <div
          style={{
            background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
            borderRadius: "18px",
            border: "1px solid #27272a",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              className="header-badge"
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                marginBottom: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              <Sparkles size={13} />
              <span>CAREER INTELLIGENCE COMMAND CENTER</span>
            </div>
            <h2 style={{ fontSize: "28px", margin: "4px 0 8px 0", color: "#ffffff" }}>
              {greeting}, {firstName} 👋
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
              Your AI career operating system is continuously analyzing opportunities, resume compatibility, and application velocity.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <div
              onClick={() => navigate("/dashboard/career-os")}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "11px", color: "#a1a1aa", display: "block" }}>Career Score</span>
              <strong style={{ fontSize: "22px", color: "#818cf8", marginTop: "2px", display: "block" }}>
                {overallScore}/100
              </strong>
            </div>

            <div
              onClick={() => navigate("/dashboard/resume")}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "11px", color: "#a1a1aa", display: "block" }}>Resume ATS</span>
              <strong style={{ fontSize: "22px", color: "#10b981", marginTop: "2px", display: "block" }}>
                {resumeScores.ats || 75}%
              </strong>
            </div>

            <div
              onClick={() => navigate("/dashboard/interview-coach")}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "11px", color: "#a1a1aa", display: "block" }}>Interview Readiness</span>
              <strong style={{ fontSize: "22px", color: "#f59e0b", marginTop: "2px", display: "block" }}>
                {readScore}%
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column: 3D AI CAREER CORE CANVAS */}
        <div>
          <ComponentErrorBoundary fallback={<CareerCoreFallback readiness={overallScore} />}>
            <Suspense fallback={<CareerCoreFallback readiness={overallScore} />}>
              <CareerCore
                readiness={readinessObj}
                agentStatus={osSnapshot?.agentState?.status || "AUTONOMOUS"}
                nextAction={osSnapshot?.actionState?.nextBestAction}
              />
            </Suspense>
          </ComponentErrorBoundary>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper match-icon">
            <Sparkles size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Top Match Score</span>
            <strong className="kpi-value">{topMatchScore > 0 ? `${topMatchScore}%` : "—"}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper search-icon">
            <Search size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Matches</span>
            <strong className="kpi-value">{recLoading ? "..." : totalMatchesCount}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper app-icon">
            <BookmarkCheck size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Applications</span>
            <strong className="kpi-value">{appLoading ? "..." : applications.length}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper interview-icon">
            <Briefcase size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Interviews</span>
            <strong className="kpi-value">{analyticsLoading ? "..." : interviewsCount}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper offer-icon">
            <Trophy size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Offers</span>
            <strong className="kpi-value">{analyticsLoading ? "..." : offersCount}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        
        {/* Left Column: Match Statistics, Recommended Opportunities & Recent Applications */}
        <div className="dashboard-main-column">

          {/* Match Statistics Component */}
          <MatchStatistics />
          
          {/* Recommended Opportunities using OpportunityCard */}
          <section className="dashboard-card-section">
            <div className="section-header-flex">
              <div>
                <span className="eyebrow">AI RECOMMENDED</span>
                <h3>Top Matches for You</h3>
              </div>

              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/opportunities")}
              >
                <span>View All ({recommendations.length})</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {recLoading ? (
              <div className="skeleton-list">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            ) : recError ? (
              <div className="inline-error-state">
                <AlertCircle size={20} />
                <span>{recError}</span>
                <button type="button" onClick={fetchRecommendations} className="retry-btn">
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="empty-state-box">
                <Search size={32} className="empty-icon" />
                <h4>No Recommendations Yet</h4>
                <p>Complete your profile skills to start receiving AI-matched career opportunities.</p>
                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={() => navigate("/dashboard/profile")}
                >
                  Update Profile Skills
                </button>
              </div>
            ) : (
              <div className="recommendations-list">
                {recommendations.slice(0, 3).map((opp) => (
                  <OpportunityCard key={opp._id || opp.id} opportunity={opp} />
                ))}
              </div>
            )}
          </section>

          {/* Reusable Recent Applications Component */}
          <RecentApplications initialApplications={applications} />
        </div>

        {/* Right Column: Career Agent, Career OS, Opportunity Monitor, Today's Plan & Widgets */}
        <div className="dashboard-side-column">

          {/* Compact AI Career Agent Widget (Phase 17.0) */}
          <div className="dashboard-side-card" style={{ border: "2px solid #6366f1", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.02) 100%)" }}>
            <div className="section-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} style={{ color: "#818cf8" }} />
                <h4 style={{ margin: 0, color: "#ffffff" }}>AI Career Agent</h4>
              </div>
              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/dashboard/agent")}
              >
                <span>Agent Center →</span>
              </button>
            </div>

            <div style={{ marginTop: "10px" }}>
              <div className="flex-between" style={{ fontSize: "12px" }}>
                <span>Career Readiness</span>
                <strong style={{ color: "#818cf8", fontSize: "15px" }}>{osSnapshot?.careerScore || 75}%</strong>
              </div>
              <div className="progress-bar-bg" style={{ height: "6px", margin: "4px 0 8px 0" }}>
                <div className="progress-bar-fill" style={{ width: `${osSnapshot?.careerScore || 75}%`, background: "#6366f1" }} />
              </div>

              <div style={{ margin: "6px 0 10px 0", fontSize: "12px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#818cf8", textTransform: "uppercase" }}>NEXT BEST ACTION</span>
                <p style={{ margin: "2px 0 0 0", color: "#e4e4e7", fontWeight: 600 }}>{osSnapshot?.actionState?.nextBestAction?.title || "Optimize Resume ATS Score"}</p>
              </div>

              <button
                type="button"
                className="save-profile-btn"
                style={{ width: "100%", padding: "8px 12px", fontSize: "12px", justifyContent: "center", background: "#6366f1", border: "none" }}
                onClick={() => navigate("/dashboard/agent")}
              >
                Run AI Career Agent
              </button>
            </div>
          </div>

          {/* Compact Career OS Command Center Widget (Phase 17.0) */}
          <div className="dashboard-side-card" style={{ border: "2px solid var(--primary-light)" }}>
            <div className="section-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Brain size={18} className="text-primary" />
                <h4 style={{ margin: 0 }}>Career Operating System</h4>
              </div>
              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/dashboard/career-os")}
              >
                <span>Open OS →</span>
              </button>
            </div>

            <div style={{ marginTop: "10px" }}>
              <div className="flex-between" style={{ fontSize: "12px" }}>
                <span>Career Score</span>
                <strong className="text-primary" style={{ fontSize: "15px" }}>{osSnapshot?.careerScore || 75}/100</strong>
              </div>
              <div className="progress-bar-bg" style={{ height: "6px", margin: "4px 0 8px 0" }}>
                <div className="progress-bar-fill" style={{ width: `${osSnapshot?.careerScore || 75}%` }} />
              </div>

              {osSnapshot?.actionState?.nextBestAction ? (
                <div style={{ margin: "6px 0 10px 0", fontSize: "12px" }}>
                  <strong className="text-primary">Highest Impact Priority:</strong>
                  <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>{osSnapshot.actionState.nextBestAction.title}</p>
                </div>
              ) : (
                <div className="notif-subtext" style={{ margin: "6px 0 10px 0" }}>View intelligent career briefing and next actions.</div>
              )}

              <button
                type="button"
                className="save-profile-btn"
                style={{ width: "100%", padding: "6px 12px", fontSize: "12px", justifyContent: "center" }}
                onClick={() => navigate("/dashboard/career-os")}
              >
                Open Career OS Command Center
              </button>
            </div>
          </div>

          {/* Compact AI Opportunity Monitor Widget (Part 25) */}
          <div className="dashboard-side-card">
            <div className="section-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Radio size={18} className="text-primary" />
                <h4 style={{ margin: 0 }}>AI Opportunity Monitor</h4>
              </div>
              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/dashboard/opportunity-monitor")}
              >
                <span>Open Monitor →</span>
              </button>
            </div>

            <div style={{ marginTop: "10px" }}>
              <div className="flex-between" style={{ fontSize: "12px" }}>
                <span>Monitoring Status</span>
                <strong className={monitorData?.enabled !== false ? "text-success" : "text-muted"}>
                  {monitorData?.enabled !== false ? "Active ●" : "Paused ⏸"}
                </strong>
              </div>
              <p className="notif-subtext" style={{ margin: "4px 0 8px 0", fontSize: "12px" }}>
                AgentScout is watching active market roles for candidate matches.
              </p>

              <button
                type="button"
                className="primary-action-btn"
                style={{ width: "100%", padding: "6px 12px", fontSize: "12px" }}
                onClick={() => navigate("/dashboard/opportunity-monitor")}
              >
                View Opportunity Monitor
              </button>
            </div>
          </div>

          {/* Compact Today's Career Plan Widget (Part 24) */}
          <div className="dashboard-side-card">
            <div className="section-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Target size={18} className="text-primary" />
                <h4 style={{ margin: 0 }}>Today's Career Plan</h4>
              </div>
              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/dashboard/career-planner")}
              >
                <span>View Plan →</span>
              </button>
            </div>

            <div style={{ marginTop: "10px" }}>
              <div className="flex-between" style={{ fontSize: "12px" }}>
                <span>Execution Rate</span>
                <strong className="text-primary">{plannerData?.completionPercentage || 0}%</strong>
              </div>
              <div className="progress-bar-bg" style={{ height: "6px", margin: "4px 0 8px 0" }}>
                <div className="progress-bar-fill" style={{ width: `${plannerData?.completionPercentage || 0}%` }} />
              </div>

              {plannerData?.nextBestAction ? (
                <div style={{ margin: "6px 0 10px 0", fontSize: "12px" }}>
                  <strong className="text-primary">Next Best Action:</strong>
                  <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>{plannerData.nextBestAction.title}</p>
                </div>
              ) : (
                <div className="notif-subtext" style={{ margin: "6px 0 10px 0" }}>Review today's personalized execution priorities.</div>
              )}

              <button
                type="button"
                className="primary-action-btn"
                style={{ width: "100%", padding: "6px 12px", fontSize: "12px" }}
                onClick={() => navigate("/dashboard/career-planner")}
              >
                View Career Plan
              </button>
            </div>
          </div>

          {/* Compact Interview Coach Widget (Part 23) */}
          <div className="dashboard-side-card">
            <div className="section-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Brain size={18} className="text-primary" />
                <h4 style={{ margin: 0 }}>Interview Coach</h4>
              </div>
              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/dashboard/interview-coach")}
              >
                <span>Practice →</span>
              </button>
            </div>

            <div style={{ marginTop: "10px" }}>
              <div className="flex-between" style={{ fontSize: "12px" }}>
                <span>Interview Readiness</span>
                <strong className="text-success">{readScore}%</strong>
              </div>
              <div className="progress-bar-bg" style={{ height: "6px", margin: "4px 0 8px 0" }}>
                <div className="progress-bar-fill" style={{ width: `${readScore}%` }} />
              </div>

              <button
                type="button"
                className="primary-action-btn"
                style={{ width: "100%", padding: "6px 12px", fontSize: "12px" }}
                onClick={() => navigate("/dashboard/interview-coach")}
              >
                Practice Mock Interview
              </button>
            </div>
          </div>

          {/* Compact Application Intelligence Widget (Part 22) */}
          <div className="dashboard-side-card">
            <div className="section-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckSquare size={18} className="text-primary" />
                <h4 style={{ margin: 0 }}>Application Intelligence</h4>
              </div>
              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/dashboard/application-assistant")}
              >
                <span>Prepare App →</span>
              </button>
            </div>

            <div style={{ marginTop: "10px" }}>
              {recommendations.length > 0 ? (
                <div>
                  <strong style={{ fontSize: "13px" }}>{recommendations[0].title}</strong>
                  <p className="notif-subtext" style={{ margin: "2px 0 8px 0" }}>{recommendations[0].company}</p>
                  <button
                    type="button"
                    className="primary-action-btn"
                    style={{ width: "100%", padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => navigate(`/dashboard/application-assistant?opportunity=${recommendations[0]._id || recommendations[0].id}`)}
                  >
                    Prepare Application
                  </button>
                </div>
              ) : (
                <div className="notif-subtext">Select an opportunity in Application Assistant to generate tailored cover letters and readiness scores.</div>
              )}
            </div>
          </div>

          {/* Compact Resume Health Widget (Part 22) */}
          <div className="dashboard-side-card">
            <div className="section-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} className="text-primary" />
                <h4 style={{ margin: 0 }}>Resume Health</h4>
              </div>
              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/dashboard/resume")}
              >
                <span>Improve Resume →</span>
              </button>
            </div>

            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {resumeLoading ? (
                <div className="notif-subtext">Loading resume score...</div>
              ) : !resumeData ? (
                <div className="notif-subtext">No resume uploaded yet. Upload a PDF/DOCX resume for ATS scoring.</div>
              ) : (
                <>
                  <div className="flex-between" style={{ fontSize: "12px" }}>
                    <span>ATS Score</span>
                    <strong>{resumeScores.ats}%</strong>
                  </div>
                  <div className="progress-bar-bg" style={{ height: "6px" }}>
                    <div className="progress-bar-fill" style={{ width: `${resumeScores.ats}%` }} />
                  </div>

                  <div className="flex-between" style={{ fontSize: "12px", marginTop: "4px" }}>
                    <span>Completeness</span>
                    <strong>{resumeScores.completeness}%</strong>
                  </div>
                  <div className="flex-between" style={{ fontSize: "12px" }}>
                    <span>Skills Coverage</span>
                    <strong>{resumeScores.skillsCoverage}%</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Compact Recent Activity Section (Section 18) */}
          <div className="dashboard-side-card">
            <div className="section-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={18} className="text-primary" />
                <h4 style={{ margin: 0 }}>Recent Activity</h4>
              </div>
              <button
                type="button"
                className="section-link-btn"
                onClick={() => navigate("/dashboard/notifications")}
              >
                <span>View all activity</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="dashboard-recent-activity-list" style={{ marginTop: "10px" }}>
              {actLoading ? (
                <div className="notif-subtext">Loading recent activity...</div>
              ) : recentActivities.length === 0 ? (
                <div className="notif-subtext">No recent activity.</div>
              ) : (
                recentActivities.slice(0, 5).map((n) => (
                  <NotificationItem key={n._id || n.id} notification={n} compact />
                ))
              )}
            </div>
          </div>

          {/* Reusable Profile Summary Card */}
          <ProfileSummaryCard initialData={user} />

          {/* Reusable Application Statistics Component */}
          <ApplicationStatistics initialAnalytics={analytics} />

          {/* Reusable Career Copilot Preview Card */}
          <CareerCopilotPreview initialCopilot={copilot} />

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
