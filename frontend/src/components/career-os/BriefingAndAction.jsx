import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Target, AlertTriangle, Zap } from "lucide-react";

export const AICareerBriefing = ({ summary = "", stage = "", score = 0 }) => {
  return (
    <div className="resume-section-card" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", border: "1px solid var(--primary-light)" }}>
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} className="text-primary" />
          <h4 style={{ margin: 0, fontSize: "16px" }}>AI Executive Briefing</h4>
        </div>
      </div>
      <p className="suggestion-explanation" style={{ fontSize: "14px", fontWeight: 600, lineHeight: "1.5", margin: "10px 0 0 0", color: "#1e293b" }}>
        {summary || `You are currently in the ${stage.replace(/_/g, " ")} stage with a Career Score of ${score}/100.`}
      </p>
    </div>
  );
};

export const NextBestAction = ({ action = {} }) => {
  const navigate = useNavigate();
  const { title = "Review Priorities", description = "", impact = "high", deepLink = "/dashboard", reason = "" } = action;

  return (
    <div className="resume-section-card" style={{ border: "2px solid var(--primary)", position: "relative" }}>
      <div style={{ position: "absolute", top: -12, right: 20, background: "var(--primary)", color: "#ffffff", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
        ★ SINGLE HIGHEST-IMPACT ACTION
      </div>

      <div className="section-header-flex">
        <div>
          <span className="eyebrow text-primary">DECISION-ORIENTED EXECUTION</span>
          <h3 style={{ fontSize: "18px", marginTop: "2px" }}>{title}</h3>
        </div>
      </div>

      <p className="suggestion-explanation" style={{ fontSize: "13px", margin: "8px 0 12px 0" }}>
        {reason || description}
      </p>

      <div className="flex-between" style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <Zap size={14} className="text-primary" />
          <span>Expected Impact: <strong className="text-primary">{impact.toUpperCase()}</strong></span>
        </div>

        <button
          type="button"
          className="save-profile-btn"
          onClick={() => navigate(deepLink)}
        >
          <span>Execute Action</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
