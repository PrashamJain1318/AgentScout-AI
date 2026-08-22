import { useNavigate } from "react-router-dom";
import { Sparkles, Trophy, ArrowRight, AlertCircle } from "lucide-react";

const MatchAnalytics = ({ data, loading = false, error = null }) => {
  const navigate = useNavigate();

  if (loading) return <div className="analytics-section-card skeleton-box">Loading match analytics...</div>;

  if (error) {
    return (
      <div className="analytics-section-card inline-error-state">
        <AlertCircle size={20} />
        <span>Match analytics currently unavailable.</span>
      </div>
    );
  }

  const matchData = data || {};
  const total = matchData.totalMatches || 0;
  const avg = matchData.averageScore || 0;
  const highest = matchData.highestScore || 0;
  const dist = matchData.distribution || { low: 0, moderate: 0, strong: 0, excellent: 0 };
  const distPct = matchData.distributionPercent || { low: 0, moderate: 0, strong: 0, excellent: 0 };

  return (
    <div className="analytics-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">MATCH INTELLIGENCE</span>
          <h3>AI Match Score Distribution</h3>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={() => navigate("/dashboard/matches")}
        >
          <span>View Matches</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {total === 0 ? (
        <div className="empty-state-box" style={{ marginTop: "16px" }}>
          <Sparkles size={32} className="empty-icon" />
          <h4>No Match Data Yet</h4>
          <p>Generate AI matches to view score distribution across opportunities.</p>
        </div>
      ) : (
        <div className="match-analytics-grid">

          {/* Distribution Chart Bars */}
          <div className="distribution-chart-box">
            <div className="dist-bar-item">
              <div className="dist-label-row">
                <span className="dist-category-title text-success">Excellent (90–100%)</span>
                <strong>{dist.excellent} matches ({distPct.excellent}%)</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill bg-success" style={{ width: `${distPct.excellent}%` }} />
              </div>
            </div>

            <div className="dist-bar-item">
              <div className="dist-label-row">
                <span className="dist-category-title text-indigo">Strong (75–89%)</span>
                <strong>{dist.strong} matches ({distPct.strong}%)</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill bg-indigo" style={{ width: `${distPct.strong}%` }} />
              </div>
            </div>

            <div className="dist-bar-item">
              <div className="dist-label-row">
                <span className="dist-category-title text-warning">Moderate (60–74%)</span>
                <strong>{dist.moderate} matches ({distPct.moderate}%)</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill bg-warning" style={{ width: `${distPct.moderate}%` }} />
              </div>
            </div>

            <div className="dist-bar-item">
              <div className="dist-label-row">
                <span className="dist-category-title text-muted">Low (&lt;60%)</span>
                <strong>{dist.low} matches ({distPct.low}%)</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill bg-gray" style={{ width: `${distPct.low}%` }} />
              </div>
            </div>
          </div>

          {/* Stats Summary Sidebar */}
          <div className="match-stats-summary-card">
            <div className="summary-stat-box">
              <span className="stat-label">Average Score</span>
              <strong className="stat-value text-primary">{avg}%</strong>
            </div>

            <div className="summary-stat-box">
              <span className="stat-label">Highest Score</span>
              <strong className="stat-value text-success">{highest}%</strong>
            </div>

            <div className="summary-stat-box">
              <span className="stat-label">Total Matches</span>
              <strong className="stat-value">{total}</strong>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default MatchAnalytics;
