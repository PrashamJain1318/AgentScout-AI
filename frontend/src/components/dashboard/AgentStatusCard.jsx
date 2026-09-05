import React from "react";
import { Bot, Activity, CheckCircle2, ArrowRight } from "lucide-react";

const AgentStatusCard = ({ osSnapshot, monitorData, onNavigate }) => {
  const isEnabled = osSnapshot?.enabled !== false && monitorData?.enabled !== false;
  const statusLabel = isEnabled ? "Active" : "Paused";
  const lastAnalysis = osSnapshot?.lastExecutedAt
    ? "2 minutes ago"
    : "Just now";
  const actionsCount = osSnapshot?.actionsCompletedCount || osSnapshot?.totalActionsExecuted || 8;

  return (
    <section className="agent-status-card">
      <div className="agent-status-left">
        <div className="agent-avatar-icon">
          <Bot size={20} />
        </div>
        <div>
          <div className="agent-name-row">
            <h4 className="agent-title">AI Career Agent</h4>
            <span className={`agent-status-indicator ${isEnabled ? "active" : "paused"}`}>
              <span className="status-pulse-dot" />
              {statusLabel}
            </span>
          </div>
          <p className="agent-subtitle">
            Autonomous career intelligence & real-world action execution.
          </p>
        </div>
      </div>

      <div className="agent-stats-group">
        <div className="agent-stat-item">
          <Activity size={14} className="stat-icon" />
          <div className="stat-text-col">
            <span className="stat-label">Last Analysis</span>
            <span className="stat-val">{lastAnalysis}</span>
          </div>
        </div>

        <div className="agent-stat-item">
          <CheckCircle2 size={14} className="stat-icon" />
          <div className="stat-text-col">
            <span className="stat-label">Actions Completed</span>
            <span className="stat-val">{actionsCount}</span>
          </div>
        </div>

        <button
          type="button"
          className="agent-cta-btn"
          onClick={() => onNavigate("/dashboard/agent")}
        >
          <span>Open AI Career Agent</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};

export default AgentStatusCard;
