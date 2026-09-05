import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../layout/ThemeToggle";

const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="landing-footer">
      <div className="landing-footer-container">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <Link to="/" className="landing-brand">
            <img
              src="/logo.jpg"
              alt="AgentScout-AI Logo"
              className="landing-brand-logo"
            />
            <div className="landing-brand-text">
              <span className="landing-brand-title">AgentScout-AI</span>
              <span className="landing-brand-tag">CAREER OPERATING SYSTEM</span>
            </div>
          </Link>
          <p className="footer-brand-desc">
            Your Personal AI Career Operating System for opportunity matching, ATS resume intelligence, and interview preparation.
          </p>

          <div className="footer-theme-toggle-row">
            <span>Theme:</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Links Columns */}
        <div className="footer-links-grid">
          {/* Column 1: Product */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => navigate("/signup")}>
                  Career Intelligence
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/signup")}>
                  Opportunities Explorer
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/signup")}>
                  Resume Intelligence
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/signup")}>
                  AI Interview Coach
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => navigate("/signup")}>
                  AI Career Agent
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/signup")}>
                  Career Action Planner
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/signup")}>
                  Opportunity Monitor
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/signup")}>
                  Career Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Account */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">Account</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/login">Sign In</Link>
              </li>
              <li>
                <Link to="/signup">Create Account</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <span className="copyright-text">
            © {new Date().getFullYear()} AgentScout-AI. All rights reserved. Your Personal AI Career Operating System.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
