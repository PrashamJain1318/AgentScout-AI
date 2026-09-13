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
  const rawName = user?.firstName || (user?.name ? user.name.split(" ")[0] : null);
  const nameDisplay = rawName ? `, ${rawName}` : "";
  const greeting = getGreeting();
  const currentDate = getFormattedDate();
  const rawRole = user?.targetRole || user?.profile?.targetRole || user?.headline;
  const hasRole = Boolean(rawRole && rawRole.trim());

  const stage = personalization?.currentStage
    ? personalization.currentStage.replace(/_/g, " ")
    : "PROFILE BUILDING";
  const momentumScore = typeof personalization?.momentum?.score === "number" ? personalization.momentum.score : null;

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
              {momentumScore !== null ? `${momentumScore}% Momentum` : "No Activity Yet"}
            </span>
          </div>

          <h1 className="db-welcome-heading">
            {greeting}{nameDisplay} 👋
          </h1>

          <p className="db-welcome-subheading">
            {hasRole ? (
              <>
                Targeting <strong>{rawRole}</strong> — AgentScout OS has personalized your daily action roadmap based on real-time career intelligence.
              </>
            ) : (
              <>
                Set your target role in profile settings to unlock full personalized career intelligence telemetry.
              </>
            )}
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
