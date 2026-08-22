import { Radio, RefreshCw, Play, Pause, Sparkles } from "lucide-react";

const MonitorHeader = ({ monitor = {}, onToggleMonitor, onRunMonitor, running = false }) => {
  const isEnabled = monitor.enabled !== false;

  return (
    <div className="application-assistant-header flex-between">
      <div>
        <div className="header-badge">
          <Radio size={14} className="text-primary" />
          <span>AI OPPORTUNITY MONITOR & JOB SEARCH AGENT</span>
        </div>
        <h2>AI Opportunity Monitor</h2>
        <p className="subtitle-text">
          AgentScout continuously watches market opportunities and ranks them against your profile.
        </p>
      </div>

      <div className="flex-between" style={{ gap: "12px" }}>
        <button
          type="button"
          className="secondary-action-btn"
          onClick={onRunMonitor}
          disabled={running}
        >
          <RefreshCw size={14} className={running ? "spin" : ""} />
          <span>{running ? "Scanning..." : "Run Monitor Now"}</span>
        </button>

        <button
          type="button"
          className={isEnabled ? "secondary-action-btn" : "save-profile-btn"}
          onClick={onToggleMonitor}
        >
          {isEnabled ? <Pause size={14} /> : <Play size={14} />}
          <span>{isEnabled ? "Pause Monitoring" : "Enable Monitoring"}</span>
        </button>
      </div>
    </div>
  );
};

export default MonitorHeader;
