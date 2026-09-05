import React from "react";
import { Bot, ArrowRight, Zap, Shield, Activity } from "lucide-react";
import MotionButton from "../motion/MotionButton";
import AnimatedNumber from "../motion/AnimatedNumber";

const CareerAgentWidget = ({ osSnapshot, monitorData, onNavigate }) => {
  const agentStatus = osSnapshot?.agentState?.status || "ACTIVE";
  const agentMode = osSnapshot?.agentState?.mode || "AUTONOMOUS";
  const pendingActions = osSnapshot?.actionState?.pendingActionsCount || 3;
  const recentNote =
    osSnapshot?.agentState?.lastActivityNote ||
    "Agent monitored 14 new postings & matched 3 high-priority opportunities today.";

  return (
    <section className="db-agent-widget-card">
      <div className="db-card-header-row">
        <div className="db-card-title-group">
          <div className="db-card-icon-badge color-purple">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="db-card-title">AI Career Agent</h3>
            <div className="db-agent-status-badges">
              <span className={`status-pill ${agentStatus.toLowerCase()}`}>
                <Activity size={10} className="db-pulse-icon" />
                {agentStatus}
              </span>
              <span className="mode-pill">
                <Shield size={10} />
                {agentMode}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="db-card-action-link"
          onClick={() => onNavigate("/dashboard/agent")}
        >
          <span>Agent Center</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="db-agent-widget-body">
        <p className="db-agent-note">"{recentNote}"</p>

        <div className="db-agent-metrics-row">
          <div className="db-agent-stat">
            <AnimatedNumber value={pendingActions} className="stat-value" />
            <span className="stat-label">Pending Actions</span>
          </div>

          <div className="db-agent-stat">
            <span className="stat-value">94.2%</span>
            <span className="stat-label">Match Precision</span>
          </div>

          <div className="db-agent-stat">
            <span className="stat-value">24/7</span>
            <span className="stat-label">Active Monitoring</span>
          </div>
        </div>
      </div>

      <MotionButton
        className="db-agent-full-cta"
        onClick={() => onNavigate("/dashboard/agent")}
      >
        <Zap size={14} />
        <span>Open AI Agent Control Center</span>
        <ArrowRight size={14} />
      </MotionButton>
    </section>
  );
};

export default CareerAgentWidget;
