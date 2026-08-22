import { Brain, RefreshCw, Sparkles } from "lucide-react";

const CareerOSHeader = ({ onRefresh, refreshing = false }) => {
  return (
    <div className="application-assistant-header flex-between">
      <div>
        <div className="header-badge">
          <Brain size={14} className="text-primary" />
          <span>AI CAREER OPERATING SYSTEM • COMMAND CENTER</span>
        </div>
        <h2>Career Operating System</h2>
        <p className="subtitle-text">
          Strategic decision engine unearthing high-impact actions, career risks, and application readiness.
        </p>
      </div>

      <div className="flex-between" style={{ gap: "12px" }}>
        <button
          type="button"
          className="save-profile-btn"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          <span>{refreshing ? "Rebuilding State..." : "Refresh Career OS"}</span>
        </button>
      </div>
    </div>
  );
};

export default CareerOSHeader;
