import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Compass, ArrowLeft, LayoutDashboard, Sparkles } from "lucide-react";
import PageTransition from "../components/motion/PageTransition";
import ThemeToggle from "../components/layout/ThemeToggle";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <PageTransition className="not-found-page-container">
      <div className="not-found-card-box">
        <div className="not-found-header-bar">
          <div className="not-found-brand">
            <img src="/logo.jpg" alt="AgentScout AI" className="not-found-logo" />
            <span className="not-found-brand-name">AGENTSCOUT-AI</span>
          </div>
          <ThemeToggle compact={true} />
        </div>

        <div className="not-found-illustration-box">
          <div className="compass-glow-wrap">
            <Compass size={64} className="not-found-compass-icon" />
          </div>
          <span className="error-code-badge">404 PATH NOT FOUND</span>
        </div>

        <div className="not-found-text-content">
          <h1 className="not-found-title">Looks like this career path doesn't exist.</h1>
          <p className="not-found-subtitle">
            The page or opportunity endpoint you are looking for has been moved, archived, or is no longer available.
          </p>
        </div>

        <div className="not-found-actions-row">
          <button
            onClick={() => navigate(-1)}
            className="not-found-secondary-btn"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link to="/dashboard" className="not-found-primary-btn">
            <LayoutDashboard size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <div className="not-found-footer-tip">
          <Sparkles size={14} className="inline-sparkle" />
          <span>Need help finding a role? Use the AI Career Copilot from your dashboard.</span>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
