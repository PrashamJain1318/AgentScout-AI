import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const pageTitles = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/career-os": "Career Operating System",
  "/career-os": "Career Operating System",
  "/dashboard/profile": "Candidate Profile",
  "/profile": "Candidate Profile",
  "/opportunities": "Opportunities Explorer",
  "/ai-search": "AI Job Matches",
  "/applications": "Applications Tracker",
  "/career-copilot": "Career Copilot",
  "/dashboard/notifications": "Notifications & Activity Center",
  "/notifications": "Notifications & Activity Center",
  "/dashboard/analytics": "Career Analytics",
  "/analytics": "Career Analytics",
  "/dashboard/settings": "Candidate Settings",
  "/settings": "Candidate Settings",
  "/dashboard/resume": "Resume & Portfolio Intelligence",
  "/resume": "Resume & Portfolio Intelligence",
  "/dashboard/application-assistant": "AI Application Assistant",
  "/application-assistant": "AI Application Assistant",
  "/dashboard/interview-coach": "AI Interview Coach",
  "/interview-coach": "AI Interview Coach",
  "/dashboard/career-planner": "AI Career Action Planner",
  "/career-planner": "AI Career Action Planner",
  "/dashboard/opportunity-monitor": "AI Opportunity Monitor",
  "/opportunity-monitor": "AI Opportunity Monitor",
};

const Topbar = ({ onToggleMobile, isMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const title = pageTitles[location.pathname] || "AgentScout AI";

  const firstName =
    user?.firstName ||
    user?.name ||
    "Candidate";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onToggleMobile}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
        >
          <Menu size={22} />
        </button>

        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-actions">
        <NotificationBell />

        <button
          type="button"
          className="user-chip-button"
          onClick={() => navigate("/profile")}
          title="View candidate profile"
          aria-label="View candidate profile"
        >
          <div className="avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <span className="user-name">{firstName}</span>
        </button>

        <button
          className="icon-button logout-icon-button"
          type="button"
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
