import { useNavigate } from "react";
import { UserCheck, FileText, BookmarkCheck, Brain, Sparkles, FolderGit2, AlertTriangle, ArrowRight } from "lucide-react";

export const ReadinessMatrix = ({ readiness = {} }) => {
  const navigate = useNavigate();

  const getMetricBadge = (score) => {
    if (score >= 85) return { label: "Excellent", class: "excellent" };
    if (score >= 70) return { label: "Ready", class: "high" };
    if (score >= 50) return { label: "Needs Work", class: "medium" };
    return { label: "Critical", class: "low" };
  };

  const matrixItems = [
    { label: "Profile", score: readiness.profile || 0, icon: UserCheck, path: "/dashboard/profile" },
    { label: "Resume", score: readiness.resume || 0, icon: FileText, path: "/dashboard/resume" },
    { label: "Applications", score: readiness.applications || 0, icon: BookmarkCheck, path: "/dashboard/applications" },
    { label: "Interview", score: readiness.interview || 0, icon: Brain, path: "/dashboard/interview-coach" },
    { label: "Skills", score: readiness.skills || 0, icon: Sparkles, path: "/dashboard/career-copilot" },
    { label: "Portfolio", score: readiness.portfolio || 0, icon: FolderGit2, path: "/dashboard/resume" }
  ];

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">READINESS MATRIX</span>
          <h3>Platform Readiness Snapshot</h3>
        </div>
      </div>

      <div className="pipeline-conversion-summary-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginTop: "14px" }}>
        {matrixItems.map((item) => {
          const Icon = item.icon;
          const badge = getMetricBadge(item.score);
          return (
            <div
              key={item.label}
              className="summary-metric-item"
              style={{ cursor: "pointer", transition: "transform 0.15s ease", padding: "10px" }}
              onClick={() => navigate(item.path)}
              title={`Manage ${item.label}`}
            >
              <div className="flex-between">
                <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                  <Icon size={13} className="text-primary" /> {item.label}
                </span>
                <span className={`impact-badge ${badge.class}`} style={{ fontSize: "9px", padding: "1px 5px" }}>
                  {badge.label}
                </span>
              </div>
              <strong className="metric-val" style={{ fontSize: "18px", marginTop: "6px", display: "block" }}>
                {item.score}%
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CareerRisks = ({ risks = [] }) => {
  const navigate = useNavigate();

  if (risks.length === 0) {
    return (
      <div className="resume-section-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">RISK ENGINE</span>
            <h3>Detected Career Risks (0)</h3>
          </div>
        </div>
        <p className="no-data-text">No critical career blockers detected in your active pipeline!</p>
      </div>
    );
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow text-primary">RISK ENGINE</span>
          <h3>Detected Career Risks ({risks.length})</h3>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
        {risks.map((risk, idx) => (
          <div
            key={idx}
            className="suggestion-item-card"
            style={{ padding: "14px", borderLeft: risk.severity === "CRITICAL" ? "4px solid var(--error)" : "4px solid var(--warning)" }}
          >
            <div className="suggestion-header flex-between">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={16} className={risk.severity === "CRITICAL" ? "text-error" : "text-primary"} />
                <strong style={{ fontSize: "15px" }}>{risk.title}</strong>
              </div>
              <span className={`impact-badge ${risk.severity === "CRITICAL" ? "low" : "medium"}`} style={{ fontSize: "10px" }}>
                {risk.severity}
              </span>
            </div>

            <p className="suggestion-explanation" style={{ fontSize: "12px", margin: "6px 0 8px 0" }}>
              {risk.explanation}
            </p>

            <div className="flex-between">
              <span className="notif-subtext" style={{ fontSize: "12px", fontWeight: 600 }}>
                Recommendation: {risk.recommendation}
              </span>

              <button
                type="button"
                className="secondary-action-btn"
                style={{ padding: "4px 8px", fontSize: "11px" }}
                onClick={() => navigate(risk.deepLink || "/dashboard")}
              >
                <span>Resolve</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
