import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard/opportunities": "Opportunities",
  "/dashboard/career-planner": "Career Plan",
  "/dashboard/agent": "AI Career Agent",
  "/dashboard/profile": "Profile",
  "/dashboard/resume": "Resume Intelligence",
  "/dashboard/applications": "Applications",
  "/dashboard/matches": "Matches",
  "/dashboard/application-assistant": "Application Assistant",
  "/dashboard/interview-coach": "Interview Coach",
  "/dashboard/opportunity-monitor": "Opportunity Monitor",
  "/dashboard/analytics": "Analytics",
  "/dashboard/notifications": "Notifications",
  "/dashboard/settings": "Settings",
};

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const title = ROUTE_TITLES[location.pathname] || "AgentScout-AI";

  return (
    <header className="mobile-top-header">
      <div className="mobile-header-left">
        <button
          type="button"
          className="mobile-brand-btn"
          onClick={() => navigate("/dashboard")}
        >
          <img src="/logo.jpg" alt="AgentScout AI" className="mobile-logo-img" />
          <span className="mobile-brand-name">AgentScout</span>
        </button>
      </div>

      <div className="mobile-header-center">
        <span className="mobile-page-title">{title}</span>
      </div>

      <div className="mobile-header-right">
        <button
          type="button"
          className="mobile-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="mobile-icon-btn"
          onClick={() => navigate("/dashboard/notifications")}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
