import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookmarkCheck,
  Send,
  Briefcase,
  Trophy,
  XCircle,
  CornerUpLeft,
  BarChart2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { getApplicationAnalytics } from "../../services/applications.api";

const statusConfig = [
  { key: "saved", label: "Saved", icon: BookmarkCheck, color: "#64748b", bg: "#f1f5f9" },
  { key: "applied", label: "Applied", icon: Send, color: "#2563eb", bg: "#dbeafe" },
  { key: "interview", label: "Interview", icon: Briefcase, color: "#d97706", bg: "#fef3c7" },
  { key: "offer", label: "Offer", icon: Trophy, color: "#059669", bg: "#d1fae5" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "#dc2626", bg: "#fee2e2" },
  { key: "withdrawn", label: "Withdrawn", icon: CornerUpLeft, color: "#6b7280", bg: "#f3f4f6" },
];

const ApplicationStatistics = ({ initialAnalytics = null }) => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loading, setLoading] = useState(!initialAnalytics);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await getApplicationAnalytics();
      const data = resData.data || resData.analytics || resData || {};
      setAnalytics(data);
    } catch (err) {
      setError("Unable to load application pipeline statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAnalytics) {
      fetchAnalytics();
    }
  }, [initialAnalytics]);

  if (loading) {
    return (
      <div className="application-stats-card skeleton-card" style={{ minHeight: "260px" }}>
        <div className="skeleton-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="application-stats-card error-card">
        <div className="inline-error-state">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={fetchAnalytics} className="retry-btn">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const byStatus = analytics?.byStatus || {};
  const totalApps = analytics?.totalApplications || Object.values(byStatus).reduce((a, b) => a + (Number(b) || 0), 0);

  const getCount = (key) => {
    const val = byStatus[key];
    if (val !== undefined && val !== null) return Number(val);
    if (key === "interview" && byStatus.interviewing) return Number(byStatus.interviewing);
    return 0;
  };

  const activePipelineCount = getCount("applied") + getCount("interview") + getCount("offer");
  const conversionRate = totalApps > 0 ? Math.round((getCount("offer") / totalApps) * 100) : 0;

  return (
    <section className="application-stats-card" role="region" aria-label="Application Statistics & Pipeline">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">PIPELINE ANALYTICS</span>
          <h3>Application Status Breakdown</h3>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={() => navigate("/applications")}
        >
          <span>View All ({totalApps})</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {totalApps === 0 ? (
        <div className="empty-state-box">
          <BarChart2 size={32} className="empty-icon" />
          <h4>No Application Analytics Yet</h4>
          <p>Track your submitted applications to generate real-time funnel conversion metrics.</p>
          <button
            type="button"
            className="primary-action-btn"
            onClick={() => navigate("/opportunities")}
          >
            Find Opportunities
          </button>
        </div>
      ) : (
        <div className="app-stats-body">

          {/* Top Pipeline Highlights Header */}
          <div className="pipeline-highlights-bar">
            <div className="highlight-metric">
              <span>Total Tracked</span>
              <strong>{totalApps}</strong>
            </div>

            <div className="highlight-metric">
              <span>Active Pipeline</span>
              <strong className="text-active">{activePipelineCount}</strong>
            </div>

            <div className="highlight-metric">
              <span>Offer Rate</span>
              <strong className="text-offer">{conversionRate}%</strong>
            </div>
          </div>

          {/* Summary Status Chips Grid (6 Statuses) */}
          <div className="status-summary-grid">
            {statusConfig.map(({ key, label, icon: Icon, color, bg }) => {
              const count = getCount(key);
              const percentage = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;

              return (
                <div key={key} className="status-summary-chip">
                  <div className="chip-icon-box" style={{ background: bg, color }}>
                    <Icon size={16} />
                  </div>
                  <div className="chip-info">
                    <span className="chip-label">{label}</span>
                    <div className="chip-values">
                      <strong>{count}</strong>
                      <span className="chip-percent">({percentage}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Distribution Bar */}
          <div className="visual-distribution-container">
            <div className="distribution-label">
              <span>Funnel Distribution</span>
              <span>100%</span>
            </div>

            <div className="stacked-distribution-bar">
              {statusConfig.map(({ key, color }) => {
                const count = getCount(key);
                if (count === 0) return null;
                const widthPercent = (count / totalApps) * 100;

                return (
                  <div
                    key={key}
                    className="bar-segment"
                    style={{ width: `${widthPercent}%`, background: color }}
                    title={`${key}: ${count}`}
                  />
                );
              })}
            </div>
          </div>

        </div>
      )}
    </section>
  );
};

export default ApplicationStatistics;
