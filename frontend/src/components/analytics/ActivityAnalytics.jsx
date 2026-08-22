import { useNavigate } from "react-router-dom";
import { Calendar, ArrowRight, AlertCircle } from "lucide-react";

const ActivityAnalytics = ({ data, loading = false, error = null }) => {
  const navigate = useNavigate();

  if (loading) return <div className="analytics-section-card skeleton-box">Loading activity timeline...</div>;

  if (error) {
    return (
      <div className="analytics-section-card inline-error-state">
        <AlertCircle size={20} />
        <span>Activity timeline currently unavailable.</span>
      </div>
    );
  }

  const actData = data || {};
  const dailyList = actData.dailyActivity || [];
  const totalEvents = actData.totalEventsLast30Days || 0;

  // Filter last 14 days for timeline display
  const recentDays = dailyList.slice(-14);

  return (
    <div className="analytics-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">ACTIVITY TRENDS</span>
          <h3>Career Engagement (Last 30 Days)</h3>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={() => navigate("/dashboard/notifications")}
        >
          <span>View Activity Center</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="activity-timeline-chart-box">
        {totalEvents === 0 ? (
          <div className="empty-state-box" style={{ marginTop: "16px" }}>
            <Calendar size={32} className="empty-icon" />
            <h4>No Recent Activity Logged</h4>
            <p>Your applications, match evaluations, and copilot interactions will appear here over time.</p>
          </div>
        ) : (
          <div className="daily-activity-bars-grid">
            {recentDays.map((item, idx) => {
              const maxVal = Math.max(1, ...recentDays.map((d) => d.activities));
              const heightPct = Math.min(100, Math.round((item.activities / maxVal) * 100));
              const dateLabel = item.date ? item.date.slice(5) : "";

              return (
                <div key={idx} className="activity-bar-col" title={`${item.date}: ${item.activities} total activities (${item.applications} apps, ${item.matches} matches)`}>
                  <span className="bar-count-val">{item.activities > 0 ? item.activities : ""}</span>
                  <div className="activity-bar-track">
                    <div
                      className="activity-bar-fill"
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                    />
                  </div>
                  <span className="bar-date-label">{dateLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityAnalytics;
