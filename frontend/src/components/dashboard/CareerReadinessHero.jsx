import React from "react";
import { TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";

const getSafeScore = (val, defaultVal = 75) => {
  const num = Number(val);
  if (Number.isFinite(num)) {
    return Math.min(100, Math.max(0, Math.round(num)));
  }
  return defaultVal;
};

const CareerReadinessHero = ({ osSnapshot, onNavigate }) => {
  const overallScore = getSafeScore(
    osSnapshot?.readinessMetrics?.overall || osSnapshot?.careerScore,
    78
  );

  const metrics = [
    {
      label: "Resume ATS",
      score: getSafeScore(osSnapshot?.readinessMetrics?.resume || 78),
      color: "var(--accent-purple)",
    },
    {
      label: "Skills Match",
      score: getSafeScore(osSnapshot?.readinessMetrics?.skills || 84),
      color: "var(--primary)",
    },
    {
      label: "Experience",
      score: getSafeScore(osSnapshot?.readinessMetrics?.experience || 72),
      color: "var(--success)",
    },
    {
      label: "Interview",
      score: getSafeScore(osSnapshot?.readinessMetrics?.interview || 68),
      color: "var(--warning)",
    },
  ];

  return (
    <section className="db-readiness-hero">
      <div className="db-readiness-main flex-1">
        <div className="db-readiness-tag">
          <ShieldCheck size={14} />
          <span>CAREER READINESS TELEMETRY</span>
        </div>

        <div className="db-readiness-score-display">
          <span className="db-readiness-score-num">{overallScore}%</span>
          <div className="db-readiness-score-text">
            <h3>Strong Opportunity Readiness</h3>
            <p>You are making solid progress toward target Senior & Staff level opportunities.</p>
          </div>
        </div>

        <div className="db-readiness-bar-container">
          <div className="db-readiness-bar-track">
            <div
              className="db-readiness-bar-fill"
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        <div className="db-readiness-breakdown-row">
          {metrics.map((m) => (
            <div key={m.label} className="db-readiness-mini-metric">
              <span className="mini-metric-label">{m.label}</span>
              <span className="mini-metric-val">{m.score}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="db-readiness-side-cta">
        <div className="db-readiness-badge">
          <TrendingUp size={16} />
          <span>+4% this week</span>
        </div>
        <button
          type="button"
          className="db-readiness-btn"
          onClick={() => onNavigate("/dashboard/career-os")}
        >
          <span>View Full Career OS</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};

export default CareerReadinessHero;
