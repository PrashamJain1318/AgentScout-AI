import { Trophy, TrendingUp, TrendingDown, Minus, ShieldCheck, Activity } from "lucide-react";

export const CareerScore = ({ score = 0, stage = "PROFILE_BUILDING" }) => {
  return (
    <div className="resume-section-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div className="ats-gauge-container" style={{ width: "76px", height: "76px", flexShrink: 0 }}>
          <div className="ats-score-circle" style={{ width: "76px", height: "76px", fontSize: "22px" }}>
            <span>{score}</span>
          </div>
        </div>

        <div>
          <span className="eyebrow">COMPOSITE SCORE</span>
          <h3 style={{ margin: "2px 0" }}>Career Health Score</h3>
          <p className="notif-subtext" style={{ margin: 0 }}>
            Weighted benchmark based on profile, resume ATS, match fit, and interview readiness.
          </p>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <span className="eyebrow text-primary">CURRENT STAGE</span>
        <div className="header-badge" style={{ marginTop: "4px", fontSize: "13px", padding: "6px 12px", background: "var(--primary-light)", color: "var(--primary-dark)" }}>
          <ShieldCheck size={14} />
          <strong>{stage.replace(/_/g, " ")}</strong>
        </div>
      </div>
    </div>
  );
};

export const CareerMomentum = ({ momentum = {} }) => {
  const { score = 50, trend = "STABLE", changePercentage = 0 } = momentum;

  const renderTrendIcon = () => {
    if (trend === "UP") return <TrendingUp size={16} className="text-success" />;
    if (trend === "DOWN") return <TrendingDown size={16} className="text-primary" />;
    return <Minus size={16} className="text-muted" />;
  };

  return (
    <div className="summary-metric-item" style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
      <div className="flex-between">
        <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Activity size={14} className="text-primary" /> Career Momentum
        </span>
        {renderTrendIcon()}
      </div>
      <div className="flex-between" style={{ marginTop: "6px" }}>
        <strong className="metric-val" style={{ fontSize: "20px" }}>{score}/100</strong>
        <span className={changePercentage >= 0 ? "text-success" : "text-primary"} style={{ fontSize: "12px", fontWeight: 700 }}>
          {changePercentage >= 0 ? `+${changePercentage}%` : `${changePercentage}%`} this week
        </span>
      </div>
    </div>
  );
};
