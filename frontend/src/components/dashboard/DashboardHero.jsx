import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const DashboardHero = ({ user, osSnapshot, onNavigate }) => {
  const firstName = user?.firstName || user?.name || "Candidate";
  const greeting = getGreeting();
  const careerScore = osSnapshot?.careerScore || osSnapshot?.readinessMetrics?.overall || 72;
  const isAnalyzing = osSnapshot?.status === "ANALYZING";

  return (
    <div className="dashboard-hero-card">
      <div className="hero-left-content">
        <div className="hero-badge">
          <Sparkles size={13} className="hero-sparkle-icon" />
          <span>AI CAREER COMMAND</span>
        </div>
        <h1 className="hero-greeting">
          {greeting}, {firstName} 👋
        </h1>
        <p className="hero-subtitle">
          {isAnalyzing
            ? "Your AI Career Agent is actively analyzing active job market telemetry..."
            : "Your AI Career Agent has analyzed your progress and prioritized your next move."}
        </p>
      </div>

      <div className="hero-score-widget">
        <div className="hero-score-header">
          <span className="hero-score-label">Career Readiness</span>
          <strong className="hero-score-value">{careerScore}%</strong>
        </div>
        <div className="hero-progress-track">
          <div
            className="hero-progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, careerScore))}%` }}
          />
        </div>
        <button
          type="button"
          className="hero-action-link"
          onClick={() => onNavigate("/dashboard/agent")}
        >
          <span>Open Agent Center</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default DashboardHero;
