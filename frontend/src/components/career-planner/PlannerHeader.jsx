import { Target, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";

const PlannerHeader = ({ summary = "", completionPercentage = 0, onRefresh, refreshing = false }) => {
  return (
    <div className="application-assistant-header flex-between">
      <div>
        <div className="header-badge">
          <Target size={14} className="text-primary" />
          <span>AI CAREER ACTION PLANNER</span>
        </div>
        <h2>AI Career Action Planner</h2>
        <p className="subtitle-text">
          {summary || "Your personalized execution system to maximize job search success and candidate readiness."}
        </p>
      </div>

      <div className="flex-between" style={{ gap: "16px" }}>
        <div className="overall-readiness-pill flex-between" style={{ gap: "8px" }}>
          <CheckCircle2 size={16} />
          <span>{completionPercentage}% Executed</span>
        </div>

        <button
          type="button"
          className="secondary-action-btn"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          <span>{refreshing ? "Recalculating..." : "Refresh Plan"}</span>
        </button>
      </div>
    </div>
  );
};

export default PlannerHeader;
