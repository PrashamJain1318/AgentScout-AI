import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Download,
  Briefcase,
  BookmarkCheck,
  Trophy,
  Sparkles,
  UserCheck,
  Calendar,
  Search,
  RefreshCw,
  FileText,
  CheckSquare,
  Brain,
  Target,
  Radio,
  ArrowRight,
} from "lucide-react";
import ApplicationAnalytics from "../components/analytics/ApplicationAnalytics";
import MatchAnalytics from "../components/analytics/MatchAnalytics";
import SkillAnalytics from "../components/analytics/SkillAnalytics";
import ActivityAnalytics from "../components/analytics/ActivityAnalytics";
import CareerInsights from "../components/analytics/CareerInsights";
import AnalyticsSkeleton from "../components/analytics/AnalyticsSkeleton";
import { getCachedData, setCachedData } from "../services/api";
import {
  getAnalyticsOverview,
  getApplicationAnalytics,
  getMatchAnalytics,
  getSkillAnalytics,
  getActivityAnalytics,
  getCareerInsights,
} from "../services/analytics.api";
import { getResume } from "../services/resume.api";
import { getInterviewReadiness } from "../services/interview.api";
import { getPlannerOverview } from "../services/careerPlanner.api";
import { getDigest } from "../services/opportunityMonitor.api";
import { getSnapshot as getOSSnapshot } from "../services/careerOS.api";

const CACHE_KEY = "analytics-overview-data";

const Analytics = () => {
  const navigate = useNavigate();
  const cached = getCachedData(CACHE_KEY);

  const [overview, setOverview] = useState(cached?.data?.overview || null);
  const [overviewLoading, setOverviewLoading] = useState(!cached?.data?.overview);
  const [overviewError, setOverviewError] = useState(null);

  const [applications, setApplications] = useState(cached?.data?.applications || null);
  const [appLoading, setAppLoading] = useState(!cached?.data?.applications);
  const [appError, setAppError] = useState(null);

  const [matches, setMatches] = useState(cached?.data?.matches || null);
  const [matchLoading, setMatchLoading] = useState(!cached?.data?.matches);
  const [matchError, setMatchError] = useState(null);

  const [skills, setSkills] = useState(null);
  const [skillLoading, setSkillLoading] = useState(true);
  const [skillError, setSkillError] = useState(null);

  const [activity, setActivity] = useState(null);
  const [actLoading, setActLoading] = useState(true);
  const [actError, setActError] = useState(null);

  const [insights, setInsights] = useState([]);
  const [insightLoading, setInsightLoading] = useState(true);

  const [resumeData, setResumeData] = useState(null);
  const [interviewReadiness, setInterviewReadiness] = useState(null);
  const [plannerOverview, setPlannerOverview] = useState(null);
  const [monitorDigest, setMonitorDigest] = useState(null);
  const [osSnapshot, setOsSnapshot] = useState(null);

  // Independent API fetchers for fault tolerance
  const fetchOverview = async () => {
    if (!cached?.data?.overview) setOverviewLoading(true);
    setOverviewError(null);
    try {
      const res = await getAnalyticsOverview();
      const val = res.data || res.overview || null;
      setOverview(val);
      setCachedData(CACHE_KEY, { ...cached?.data, overview: val });
    } catch (err) {
      setOverviewError("Failed to load overview metrics.");
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchAppAnalytics = async () => {
    if (!cached?.data?.applications) setAppLoading(true);
    setAppError(null);
    try {
      const res = await getApplicationAnalytics();
      const val = res.data || res.applications || null;
      setApplications(val);
      setCachedData(CACHE_KEY, { ...cached?.data, applications: val });
    } catch (err) {
      setAppError("Failed to load application analytics.");
    } finally {
      setAppLoading(false);
    }
  };

  const fetchMatchAnalyticsData = async () => {
    if (!cached?.data?.matches) setMatchLoading(true);
    setMatchError(null);
    try {
      const res = await getMatchAnalytics();
      const val = res.data || res.matches || null;
      setMatches(val);
      setCachedData(CACHE_KEY, { ...cached?.data, matches: val });
    } catch (err) {
      setMatchError("Failed to load match intelligence.");
    } finally {
      setMatchLoading(false);
    }
  };

  const fetchSkillAnalyticsData = async () => {
    setSkillLoading(true);
    setSkillError(null);
    try {
      const res = await getSkillAnalytics();
      setSkills(res.data || res.skills || null);
    } catch (err) {
      setSkillError("Failed to load skill analytics.");
    } finally {
      setSkillLoading(false);
    }
  };

  const fetchActivityAnalyticsData = async () => {
    setActLoading(true);
    setActError(null);
    try {
      const res = await getActivityAnalytics();
      setActivity(res.data || res.activity || null);
    } catch (err) {
      setActError("Failed to load activity trends.");
    } finally {
      setActLoading(false);
    }
  };

  const fetchInsightsData = async () => {
    setInsightLoading(true);
    try {
      const res = await getCareerInsights();
      setInsights(res.data || res.insights || []);
    } catch (err) {
      // Ignore fallback
    } finally {
      setInsightLoading(false);
    }
  };

  const fetchResumeData = async () => {
    try {
      const res = await getResume();
      setResumeData(res.resume || null);
    } catch (err) {
      // Ignore
    }
  };

  const fetchInterviewData = async () => {
    try {
      const res = await getInterviewReadiness();
      setInterviewReadiness(res.data || null);
    } catch (err) {
      // Ignore
    }
  };

  const fetchPlannerData = async () => {
    try {
      const res = await getPlannerOverview();
      setPlannerOverview(res.data || null);
    } catch (err) {
      // Ignore
    }
  };

  const fetchMonitorData = async () => {
    try {
      const res = await getDigest();
      setMonitorDigest(res.data || null);
    } catch (err) {
      // Ignore
    }
  };

  const fetchOSData = async () => {
    try {
      const res = await getOSSnapshot();
      setOsSnapshot(res.data || null);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchAppAnalytics();
    fetchMatchAnalyticsData();
    fetchSkillAnalyticsData();
    fetchActivityAnalyticsData();
    fetchInsightsData();
    fetchResumeData();
    fetchInterviewData();
    fetchPlannerData();
    fetchMonitorData();
    fetchOSData();
  }, []);

  // CSV Exporter helper
  const handleExportCSV = () => {
    if (!overview) return;

    const rows = [
      ["AgentScout AI Career Performance Analytics Report"],
      ["Generated Date", new Date().toLocaleString()],
      [""],
      ["Metric", "Value"],
      ["Composite Career Score", `${osSnapshot?.careerScore || 0}/100`],
      ["Career Stage", osSnapshot?.careerStage || "PROFILE_BUILDING"],
      ["Total Applications", overview.totalApplications || 0],
      ["Active Applications", overview.activeApplications || 0],
      ["Interviews", overview.interviews || 0],
      ["Offers", overview.offers || 0],
      ["Accepted", overview.accepted || 0],
      ["Rejected", overview.rejected || 0],
      ["Total Matches", overview.totalMatches || 0],
      ["Excellent Matches (90%+)", overview.excellentMatches || 0],
      ["Strong Matches (75%+)", overview.strongMatches || 0],
      ["Average Match Score", `${overview.averageMatchScore || 0}%`],
      ["Profile Completion", `${overview.profileCompletion || 0}%`],
      ["Applications Prepared", overview.applicationsPrepared || 0],
      ["Average Readiness Score", `${overview.averageReadinessScore || 0}%`],
      ["Interview Readiness Score", `${interviewReadiness?.readinessScore || 75}%`],
      ["Completed Mock Interviews", interviewReadiness?.interviewCount || 0],
      ["Planner Execution Completion", `${plannerOverview?.completionPercentage || 0}%`],
      ["Monitored New Opportunities", monitorDigest?.newOpportunitiesCount || 0],
      ["Monitored Excellent Matches", monitorDigest?.excellentMatchesCount || 0],
      ["Resume ATS Score", `${resumeData?.scores?.ats || 0}%`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agentscout_career_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const o = overview || {};
  const rScores = resumeData?.scores || { ats: 0, completeness: 0, skillsCoverage: 0 };

  return (
    <div className="analytics-page">

      {/* Header Bar Shell Renders Immediately */}
      <div className="analytics-header-bar flex-between">
        <div>
          <div className="header-badge">
            <BarChart3 size={14} className="text-primary" />
            <span>CAREER INTELLIGENCE DASHBOARD</span>
          </div>
          <h2>Career Analytics & Progress Intelligence</h2>
          <p className="subtitle-text">
            Understand your career progress, application performance, and skill growth.
          </p>
        </div>

        <button
          type="button"
          className="save-profile-btn"
          onClick={handleExportCSV}
          disabled={!overview}
        >
          <Download size={16} />
          <span>Export Analytics (CSV)</span>
        </button>
      </div>

      {/* Overview KPI Grid Shell Renders Immediately */}
      <div className="kpi-grid analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper app-icon">
            <BookmarkCheck size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Applications</span>
            <strong className="kpi-value">{overviewLoading ? "..." : o.totalApplications || 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper search-icon">
            <Briefcase size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Applications</span>
            <strong className="kpi-value">{overviewLoading ? "..." : o.activeApplications || 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper interview-icon">
            <Briefcase size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Interviews</span>
            <strong className="kpi-value">{overviewLoading ? "..." : o.interviews || 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper offer-icon">
            <Trophy size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Offers</span>
            <strong className="kpi-value">{overviewLoading ? "..." : o.offers || 0}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper match-icon">
            <Sparkles size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Avg Match Score</span>
            <strong className="kpi-value">{overviewLoading ? "..." : `${o.averageMatchScore || 0}%`}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper profile-icon">
            <UserCheck size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Profile Completion</span>
            <strong className="kpi-value">{overviewLoading ? "..." : `${o.profileCompletion || 0}%`}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper offer-icon">
            <FileText size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Resume ATS Score</span>
            <strong className="kpi-value text-success">{resumeData ? `${rScores.ats}%` : "—"}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper match-icon">
            <Sparkles size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Matches</span>
            <strong className="kpi-value">{overviewLoading ? "..." : o.totalMatches || 0}</strong>
          </div>
        </div>
      </div>

      {/* Compact Career OS Performance & Strategic Intelligence Card Widget */}
      <div className="analytics-section-card">
        <div className="section-header-flex">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Brain size={18} className="text-primary" />
            <h4 style={{ margin: 0 }}>Career OS Performance & Strategic Intelligence</h4>
          </div>

          <button
            type="button"
            className="section-link-btn"
            onClick={() => navigate("/dashboard/career-os")}
          >
            <span>Open Career OS Command Center</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="pipeline-conversion-summary-grid">
          <div className="summary-metric-item">
            <span className="metric-label">Composite Career Score</span>
            <strong className="metric-val text-primary">{osSnapshot?.careerScore || 75}/100</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Career Stage</span>
            <strong className="metric-val text-success">{(osSnapshot?.careerStage || "APPLICATION_READY").replace(/_/g, " ")}</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Momentum Score</span>
            <strong className="metric-val">{osSnapshot?.momentum?.score || 50}/100 ({osSnapshot?.momentum?.trend || "STABLE"})</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Detected Career Risks</span>
            <strong className="metric-val text-primary">{osSnapshot?.riskState?.length || 0} Blockers</strong>
          </div>
        </div>
      </div>

      {/* Compact Opportunity Monitoring Funnel & Intelligence Card Widget */}
      <div className="analytics-section-card">
        <div className="section-header-flex">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Radio size={18} className="text-primary" />
            <h4 style={{ margin: 0 }}>Opportunities Monitoring Funnel & Market Intelligence</h4>
          </div>

          <button
            type="button"
            className="section-link-btn"
            onClick={() => navigate("/dashboard/opportunity-monitor")}
          >
            <span>Open Opportunity Monitor</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="pipeline-conversion-summary-grid">
          <div className="summary-metric-item">
            <span className="metric-label">Opportunities Discovered</span>
            <strong className="metric-val">{monitorDigest?.newOpportunitiesCount || 0}</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">90%+ Excellent Matches</span>
            <strong className="metric-val text-success">{monitorDigest?.excellentMatchesCount || 0}</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">75%+ Strong Matches</span>
            <strong className="metric-val">{monitorDigest?.strongMatchesCount || 0}</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Application Ready</span>
            <strong className="metric-val text-primary">{monitorDigest?.readyToApplyCount || 0}</strong>
          </div>
        </div>
      </div>

      {/* Compact Career Execution Intelligence Card Widget */}
      <div className="analytics-section-card">
        <div className="section-header-flex">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Target size={18} className="text-primary" />
            <h4 style={{ margin: 0 }}>Career Execution Intelligence & Action Consistency</h4>
          </div>

          <button
            type="button"
            className="section-link-btn"
            onClick={() => navigate("/dashboard/career-planner")}
          >
            <span>Open Career Planner</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="pipeline-conversion-summary-grid">
          <div className="summary-metric-item">
            <span className="metric-label">Daily Actions Completed</span>
            <strong className="metric-val text-success">{plannerOverview?.actionsCompleted || 0}</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Actions Pending</span>
            <strong className="metric-val">{plannerOverview?.actionsPending || 0}</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Execution Completion</span>
            <strong className="metric-val text-primary">{plannerOverview?.completionPercentage || 0}%</strong>
          </div>
        </div>
      </div>

      {/* Compact Interview Intelligence Card Widget */}
      <div className="analytics-section-card">
        <div className="section-header-flex">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Brain size={18} className="text-primary" />
            <h4 style={{ margin: 0 }}>Interview Intelligence & Mock Performance</h4>
          </div>

          <button
            type="button"
            className="section-link-btn"
            onClick={() => navigate("/dashboard/interview-coach")}
          >
            <span>Practice Interview</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="pipeline-conversion-summary-grid">
          <div className="summary-metric-item">
            <span className="metric-label">Completed Sessions</span>
            <strong className="metric-val">{interviewReadiness?.interviewCount || 0}</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Interview Readiness</span>
            <strong className="metric-val text-success">{interviewReadiness?.readinessScore || 75}%</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Technical Average</span>
            <strong className="metric-val">{interviewReadiness?.technicalScore || 75}%</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Behavioral Average</span>
            <strong className="metric-val">{interviewReadiness?.behavioralScore || 80}%</strong>
          </div>
        </div>
      </div>

      {/* Compact Application Readiness Card Widget */}
      <div className="analytics-section-card">
        <div className="section-header-flex">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckSquare size={18} className="text-primary" />
            <h4 style={{ margin: 0 }}>Application Readiness Intelligence</h4>
          </div>

          <button
            type="button"
            className="section-link-btn"
            onClick={() => navigate("/dashboard/application-assistant")}
          >
            <span>Open Application Assistant</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="pipeline-conversion-summary-grid">
          <div className="summary-metric-item">
            <span className="metric-label">Applications Prepared</span>
            <strong className="metric-val">{o.applicationsPrepared || 0}</strong>
          </div>

          <div className="summary-metric-item">
            <span className="metric-label">Average Readiness Score</span>
            <strong className="metric-val text-primary">{o.averageReadinessScore || 0}%</strong>
          </div>
        </div>
      </div>

      {/* Compact Resume Health Card Widget */}
      <div className="analytics-section-card">
        <div className="section-header-flex">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={18} className="text-primary" />
            <h4 style={{ margin: 0 }}>Resume Health & ATS Intelligence</h4>
          </div>

          <button
            type="button"
            className="section-link-btn"
            onClick={() => navigate("/dashboard/resume")}
          >
            <span>Manage Resume Dashboard</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {resumeData ? (
          <div className="pipeline-conversion-summary-grid">
            <div className="summary-metric-item">
              <span className="metric-label">AgentScout ATS Score</span>
              <strong className="metric-val text-success">{rScores.ats}%</strong>
            </div>

            <div className="summary-metric-item">
              <span className="metric-label">Completeness Score</span>
              <strong className="metric-val">{rScores.completeness}%</strong>
            </div>

            <div className="summary-metric-item">
              <span className="metric-label">Skills Coverage</span>
              <strong className="metric-val">{rScores.skillsCoverage}%</strong>
            </div>
          </div>
        ) : (
          <p className="no-data-text">No resume uploaded yet. Upload a PDF/DOCX resume to unlock ATS scoring and recommendations.</p>
        )}
      </div>

      {/* Sections Layout */}
      <div className="analytics-sections-container">

        {/* 1. AI Career Insights */}
        <CareerInsights insights={insights} loading={insightLoading} />

        {/* 2. Application Pipeline Analytics */}
        {appLoading ? (
          <AnalyticsSkeleton title="Application Funnel" />
        ) : (
          <ApplicationAnalytics data={applications} error={appError} />
        )}

        {/* 3. Match Score Intelligence */}
        {matchLoading ? (
          <AnalyticsSkeleton title="Match Score Distribution" />
        ) : (
          <MatchAnalytics data={matches} error={matchError} />
        )}

        {/* 4. Skill Matrix & Market Gaps */}
        {skillLoading ? (
          <AnalyticsSkeleton title="Skill Intelligence" />
        ) : (
          <SkillAnalytics data={skills} error={skillError} />
        )}

        {/* 5. Activity Engagement Trends */}
        {actLoading ? (
          <AnalyticsSkeleton title="Activity Trends" />
        ) : (
          <ActivityAnalytics data={activity} error={actError} />
        )}

      </div>

    </div>
  );
};

export default Analytics;
