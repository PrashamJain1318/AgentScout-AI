import React from "react";
import { Sparkles, Calendar, Activity } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getFormattedDate = () => {
  const options = { weekday: "long", month: "short", day: "numeric" };
  return new Date().toLocaleDateString("en-US", options);
};

const DashboardWelcome = ({ user, osSnapshot }) => {
  const firstName = user?.firstName || user?.name || "Candidate";
  const greeting = getGreeting();
  const currentDate = getFormattedDate();
  const targetRole = user?.targetRole || user?.headline || "Software Engineer";
  const isAgentActive = osSnapshot?.agentState?.status !== "DISABLED";

  return (
    <header className="db-welcome-card">
      <div className="db-welcome-left">
        <div className="db-welcome-badge-row">
          <span className="db-welcome-date">
            <Calendar size={13} />
            {currentDate}
          </span>
          <span className={`db-ai-status-pill ${isAgentActive ? "active" : "idle"}`}>
            <Activity size={12} className="db-pulse-icon" />
            {isAgentActive ? "AI Career Intelligence Active" : "AI Agent Idle"}
          </span>
        </div>

        <h1 className="db-welcome-heading">
          {greeting}, {firstName} 👋
        </h1>

        <p className="db-welcome-subheading">
          Your career trajectory for <strong>{targetRole}</strong> is moving forward. Here is your personalized intelligence briefing.
        </p>
      </div>

      <div className="db-welcome-sparkle-decoration">
        <Sparkles size={24} className="db-sparkle-icon" />
      </div>
    </header>
  );
};

export default DashboardWelcome;
