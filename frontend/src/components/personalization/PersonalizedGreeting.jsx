import React from "react";
import { Sparkles, Calendar, Zap, RefreshCw, CheckCircle2 } from "lucide-react";
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

const PersonalizedGreeting = ({ user, personalization, onRefresh, refreshing }) => {
  const firstName = user?.firstName || user?.name || "Candidate";
  const greeting = getGreeting();
  const currentDate = getFormattedDate();
  const targetRole = user?.targetRole || user?.headline || "Software Engineer";

  const stage = personalization?.currentStage?.replace(/_/g, " ") || "RESUME OPTIMIZATION";
  const momentumScore = personalization?.momentum?.score || 70;

  return (
    <FadeIn direction="down" distance={10}>
      <header className="db-welcome-card personalized-header-glow">
        <div className="db-welcome-left">
          <div className="db-welcome-badge-row">
            <span className="db-welcome-date">
              <Calendar size={13} />
              {currentDate}
            </span>
            <span className="stage-pill-badge">
              <CheckCircle2 size={12} />
              {stage}
            </span>
            <span className="momentum-pill-badge">
              <Zap size={12} />
              {momentumScore}% Momentum
            </span>
          </div>

          <h1 className="db-welcome-heading">
            {greeting}, {firstName} 👋
          </h1>

          <p className="db-welcome-subheading">
            Targeting <strong>{targetRole}</strong> — AgentScout OS has personalized your daily action roadmap based on real-time career intelligence.
          </p>
        </div>

        <div className="header-actions-group">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="refresh-personalization-btn"
              title="Refresh Adaptive Intelligence"
            >
              <RefreshCw size={14} className={refreshing ? "spin-icon" : ""} />
              <span>{refreshing ? "Syncing..." : "Sync AI"}</span>
            </button>
          )}
          <div className="db-welcome-sparkle-decoration">
            <Sparkles size={24} className="db-sparkle-icon" />
          </div>
        </div>
      </header>
    </FadeIn>
  );
};

export default PersonalizedGreeting;
