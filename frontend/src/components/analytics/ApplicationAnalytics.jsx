import { Briefcase, ArrowRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

const ApplicationAnalytics = ({ data, loading = false, error = null }) => {
  if (loading) return <div className="analytics-section-card skeleton-box">Loading application pipeline analytics...</div>;

  if (error) {
    return (
      <div className="analytics-section-card inline-error-state">
        <AlertCircle size={20} />
        <span>Application analytics currently unavailable.</span>
      </div>
    );
  }

  const appData = data || {};
  const total = appData.total || 0;
  const statuses = appData.statuses || {};
  const conversion = appData.conversion || {};
  const funnel = appData.funnel || [];

  return (
    <div className="analytics-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">APPLICATION FUNNEL</span>
          <h3>Application Pipeline Performance</h3>
        </div>
        <div className="conversion-badges-row flex-between" style={{ gap: "10px" }}>
          <span className="stat-pill">Interview Rate: <strong>{conversion.interviewRate || 0}%</strong></span>
          <span className="stat-pill success">Offer Rate: <strong>{conversion.offerRate || 0}%</strong></span>
        </div>
      </div>

      {total === 0 ? (
        <div className="empty-state-box" style={{ marginTop: "16px" }}>
          <Briefcase size={32} className="empty-icon" />
          <h4>No Application Data Yet</h4>
          <p>Submit applications or save roles to track your pipeline performance and conversion metrics.</p>
        </div>
      ) : (
        <div className="funnel-visualization-container">

          {/* Funnel Stage Steps */}
          <div className="funnel-stages-row">
            {funnel.map((step, idx) => (
              <div key={idx} className="funnel-stage-col">
                <div className="stage-header">
                  <span className="stage-name">{step.stage}</span>
                  <strong className="stage-count">{step.count}</strong>
                </div>

                <div className="funnel-bar-wrapper">
                  <div
                    className={`funnel-bar-fill stage-${step.stage.toLowerCase()}`}
                    style={{ height: `${Math.max(12, Math.min(100, step.conversion))}%` }}
                  />
                </div>

                <span className="stage-percent">{step.conversion}%</span>
              </div>
            ))}
          </div>

          {/* Conversion Metrics Footer */}
          <div className="pipeline-conversion-summary-grid">
            <div className="summary-metric-item">
              <span className="metric-label">Screening to Interview</span>
              <strong className="metric-val">{conversion.interviewRate}%</strong>
            </div>

            <div className="summary-metric-item">
              <span className="metric-label">Interview to Offer</span>
              <strong className="metric-val">{conversion.offerRate}%</strong>
            </div>

            <div className="summary-metric-item">
              <span className="metric-label">Rejection Rate</span>
              <strong className="metric-val">{conversion.rejectionRate || 0}%</strong>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ApplicationAnalytics;
