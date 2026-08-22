import { Sparkles, ArrowRight, Clock, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NextBestAction = ({ nextBestAction = null, aiReasoning = "", onComplete }) => {
  const navigate = useNavigate();

  if (!nextBestAction) {
    return (
      <div className="resume-section-card readiness-score-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow text-primary">NEXT BEST ACTION</span>
            <h3>Highest Priority Recommendation</h3>
          </div>
        </div>
        <p className="no-data-text">All primary actions executed! Refresh your plan to discover new recommendations.</p>
      </div>
    );
  }

  const { id, title, description, category, priority, estimatedMinutes = 15, deepLink = "", status } = nextBestAction;

  const isCompleted = status === "completed";

  return (
    <div className="resume-section-card readiness-score-card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", border: "2px solid var(--primary)" }}>
      <div className="section-header-flex">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} className="text-primary" />
            <span className="eyebrow text-primary" style={{ margin: 0 }}>DETERMINISTIC NEXT-BEST-ACTION</span>
          </div>
          <h2 style={{ marginTop: "4px" }}>{title}</h2>
        </div>

        <div className="flex-between" style={{ gap: "10px" }}>
          <span className={`impact-badge ${priority || "high"}`}>
            {(priority || "CRITICAL").toUpperCase()} PRIORITY
          </span>
          <span className="step-pill active" style={{ fontSize: "12px" }}>
            <Clock size={12} /> {estimatedMinutes} mins
          </span>
        </div>
      </div>

      <p className="suggestion-explanation" style={{ fontSize: "14px", color: "var(--text-main)", margin: "10px 0" }}>
        {description}
      </p>

      {aiReasoning && (
        <div className="selected-opp-preview" style={{ background: "#f1f5f9", marginTop: "12px" }}>
          <strong style={{ fontSize: "13px", color: "var(--primary)" }}>Why this was recommended:</strong>
          <p className="notif-subtext" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
            {aiReasoning}
          </p>
        </div>
      )}

      <div className="flex-between" style={{ marginTop: "16px" }}>
        <button
          type="button"
          className="secondary-action-btn"
          onClick={() => onComplete(id)}
          disabled={isCompleted}
        >
          <span>{isCompleted ? "Completed ✓" : "Mark Completed"}</span>
        </button>

        {deepLink && (
          <button
            type="button"
            className="save-profile-btn"
            onClick={() => navigate(deepLink)}
          >
            <span>Execute Action</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NextBestAction;
