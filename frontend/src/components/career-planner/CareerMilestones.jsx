import { Trophy, CheckCircle2 } from "lucide-react";

const CareerMilestones = ({ milestones = [] }) => {
  if (milestones.length === 0) return null;

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">CAREER MILESTONES</span>
          <h3>Milestone Progress Tracking</h3>
        </div>
      </div>

      <div className="readiness-breakdown-grid" style={{ marginTop: "16px" }}>
        {milestones.map((m) => (
          <div key={m.id} className="breakdown-item">
            <div className="flex-between">
              <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {m.completed ? <CheckCircle2 size={14} className="text-success" /> : <Trophy size={14} className="text-muted" />}
                {m.title}
              </span>
              <strong>{m.current} / {m.target} {m.unit}</strong>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${m.percentage}%`,
                  background: m.completed ? "var(--success)" : "var(--primary)"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerMilestones;
