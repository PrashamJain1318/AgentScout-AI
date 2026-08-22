import { Radio, Clock, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

const MonitorStatus = ({ monitor = {}, digest = {} }) => {
  const isEnabled = monitor.enabled !== false;
  const lastRunText = monitor.lastRunAt ? new Date(monitor.lastRunAt).toLocaleString() : "Never run yet";

  const {
    newOpportunitiesCount = 0,
    excellentMatchesCount = 0,
    strongMatchesCount = 0,
    readyToApplyCount = 0
  } = digest;

  return (
    <div className="resume-section-card readiness-score-card">
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <Radio size={20} className={isEnabled ? "text-success" : "text-muted"} />
            {isEnabled && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--success)",
                  boxShadow: "0 0 6px var(--success)"
                }}
              />
            )}
          </div>
          <div>
            <strong style={{ fontSize: "16px" }}>
              Status: {isEnabled ? "Monitoring Active" : "Monitoring Paused"}
            </strong>
            <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>
              AgentScout is watching for opportunities that match your career profile.
            </p>
          </div>
        </div>

        <div className="overall-readiness-pill" style={{ background: isEnabled ? "var(--success)" : "var(--primary)" }}>
          <Clock size={13} />
          <span>Last Scan: {lastRunText}</span>
        </div>
      </div>

      <div className="pipeline-conversion-summary-grid" style={{ marginTop: "16px" }}>
        <div className="summary-metric-item">
          <span className="metric-label">New Opportunities (24h)</span>
          <strong className="metric-val text-primary">{newOpportunitiesCount}</strong>
        </div>

        <div className="summary-metric-item">
          <span className="metric-label">90%+ Excellent Matches</span>
          <strong className="metric-val text-success">{excellentMatchesCount}</strong>
        </div>

        <div className="summary-metric-item">
          <span className="metric-label">75%+ Strong Matches</span>
          <strong className="metric-val">{strongMatchesCount}</strong>
        </div>

        <div className="summary-metric-item">
          <span className="metric-label">Ready to Apply</span>
          <strong className="metric-val text-success">{readyToApplyCount}</strong>
        </div>
      </div>
    </div>
  );
};

export default MonitorStatus;
