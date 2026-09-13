import React from "react";
import { Bot, ArrowRight, Zap, Shield, Activity } from "lucide-react";
import MotionButton from "../motion/MotionButton";
import AnimatedNumber from "../motion/AnimatedNumber";

const CareerAgentWidget = ({ osSnapshot, monitorData, onNavigate }) => {
  const isAgentConfigured = Boolean(osSnapshot?.agentState && osSnapshot?.agentState?.lastActivityNote);
  const agentStatus = isAgentConfigured ? (osSnapshot?.agentState?.status || "ACTIVE") : "IDLE";
  const agentMode = osSnapshot?.agentState?.mode || "ASSISTED";
  const pendingActions = osSnapshot?.actionState?.pendingActionsCount ?? 0;
  const recentNote = osSnapshot?.agentState?.lastActivityNote || "Your Career Agent is waiting for your career profile.";
  const matchPrecision = osSnapshot?.agentState?.precision ?? null;
  const monitoredCount = monitorData?.recommendations?.length ?? 0;

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

        {isAgentConfigured ? (
          <div className="db-agent-metrics-row">
            <div className="db-agent-stat">
              <AnimatedNumber value={pendingActions} className="stat-value" />
              <span className="stat-label">Pending Actions</span>
            </div>

            <div className="db-agent-stat">
              <span className="stat-value">{matchPrecision !== null ? `${matchPrecision}%` : "N/A"}</span>
              <span className="stat-label">Match Precision</span>
            </div>

            <div className="db-agent-stat">
              <span className="stat-value">{monitoredCount > 0 ? monitoredCount : "0"}</span>
              <span className="stat-label">Monitored Roles</span>
            </div>
          </div>
        ) : (
          <div className="p-3 text-center rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 my-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Set target role to activate autonomous opportunity tracking.
            </p>
          </div>
        )}
      </div>

      <MotionButton
        className="db-agent-full-cta"
        onClick={() => onNavigate(isAgentConfigured ? "/dashboard/agent" : "/dashboard/profile")}
      >
        <Zap size={14} />
        <span>{isAgentConfigured ? "Open AI Agent Control Center" : "Complete Profile"}</span>
        <ArrowRight size={14} />
      </MotionButton>
    </section>
  );
};

export default CareerAgentWidget;
