import React from "react";
import { Sparkles, Calendar, Activity } from "lucide-react";
import FadeIn from "../motion/FadeIn";

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

  const rawName = user?.firstName || (user?.name ? user.name.split(" ")[0] : null);
  const nameDisplay = rawName ? `, ${rawName}` : "";
  const greeting = getGreeting();
  const currentDate = getFormattedDate();
  const rawRole = user?.targetRole || user?.profile?.targetRole || user?.headline;
  const hasRole = Boolean(rawRole && rawRole.trim());
  const isAgentActive = osSnapshot?.agentState?.status !== "DISABLED";

  return (
    <FadeIn direction="down" distance={8}>
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
            {greeting}{nameDisplay} 👋
          </h1>

          <p className="db-welcome-subheading">
            {hasRole ? (
              <>
                Your career trajectory for <strong>{rawRole}</strong> is moving forward. Here is your personalized intelligence briefing.
              </>
            ) : (
              <>
                Set your target role in profile settings to unlock full personalized career intelligence telemetry.
              </>
            )}
          </p>
        </div>

        <div className="db-welcome-sparkle-decoration">
          <Sparkles size={24} className="db-sparkle-icon" />
        </div>
      </header>
    </FadeIn>
  );
};

export default DashboardWelcome;
