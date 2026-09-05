import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Brain,
  Radio,
  Target,
  Search,
  Sparkles,
  BookmarkCheck,
  BriefcaseBusiness,
  BarChart3,
  FileText,
  CheckSquare,
  Settings,
  UserRound,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navigationSections = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "AI INTELLIGENCE",
    items: [
      {
        label: "Career Intelligence",
        path: "/dashboard/career-intelligence",
        icon: Sparkles,
      },
      {
        label: "AI Career Agent",
        path: "/dashboard/agent",
        icon: Bot,
      },
      {
        label: "Career OS",
        path: "/dashboard/career-os",
        icon: Brain,
      },
      {
        label: "Opportunity Monitor",
        path: "/dashboard/opportunity-monitor",
        icon: Radio,
      },
      {
        label: "Career Planner",
        path: "/dashboard/career-planner",
        icon: Target,
      },
    ],
  },
  {
    title: "CAREER",
    items: [
      {
        label: "Opportunities",
        path: "/opportunities",
        icon: Search,
      },
      {
        label: "Matches",
        path: "/dashboard/matches",
        icon: Sparkles,
      },
      {
        label: "Applications",
        path: "/dashboard/applications",
        icon: BookmarkCheck,
      },
      {
        label: "App Assistant",
        path: "/dashboard/application-assistant",
        icon: CheckSquare,
      },
      {
        label: "Interview Coach",
        path: "/dashboard/interview-coach",
        icon: Brain,
      },
      {
        label: "Resume",
        path: "/dashboard/resume",
        icon: FileText,
      },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      {
        label: "Analytics",
        path: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        label: "Profile",
        path: "/profile",
        icon: UserRound,
      },
      {
        label: "Settings",
        path: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname]);

  const isItemActive = (navPath) => {
    const current = location.pathname;

    if (navPath === "/dashboard") {
      return current === "/dashboard" || current === "/dashboard/";
    }

    if (navPath === "/dashboard/career-intelligence" || navPath === "/dashboard/intelligence") {
      return (
        current === "/career-intelligence" ||
        current === "/dashboard/career-intelligence" ||
        current === "/intelligence" ||
        current === "/dashboard/intelligence" ||
        current.startsWith("/career-intelligence/") ||
        current.startsWith("/dashboard/career-intelligence/") ||
        current.startsWith("/intelligence/") ||
        current.startsWith("/dashboard/intelligence/")
      );
    }

    if (navPath === "/dashboard/agent") {
      return (
        current === "/agent" ||
        current === "/dashboard/agent" ||
        current.startsWith("/agent/") ||
        current.startsWith("/dashboard/agent/")
      );
    }

    if (navPath === "/dashboard/career-os") {
      return (
        current === "/career-os" ||
        current === "/dashboard/career-os" ||
        current.startsWith("/career-os/") ||
        current.startsWith("/dashboard/career-os/")
      );
    }

    if (navPath === "/dashboard/application-agent") {
      return (
        current === "/application-agent" ||
        current === "/dashboard/application-agent" ||
        current.startsWith("/application-agent/") ||
        current.startsWith("/dashboard/application-agent/")
      );
    }

    if (navPath === "/dashboard/opportunity-monitor") {
      return (
        current === "/opportunity-monitor" ||
        current === "/dashboard/opportunity-monitor" ||
        current.startsWith("/opportunity-monitor/") ||
        current.startsWith("/dashboard/opportunity-monitor/")
      );
    }

    if (navPath === "/dashboard/career-planner") {
      return (
        current === "/career-planner" ||
        current === "/dashboard/career-planner" ||
        current.startsWith("/career-planner/") ||
        current.startsWith("/dashboard/career-planner/")
      );
    }

    if (navPath === "/opportunities") {
      return (
        current === "/opportunities" ||
        current === "/dashboard/opportunities" ||
        current.startsWith("/opportunities/") ||
        current.startsWith("/dashboard/opportunities/")
      );
    }

    if (navPath === "/dashboard/matches") {
      return (
        current === "/matches" ||
        current === "/dashboard/matches" ||
        current.startsWith("/matches/") ||
        current.startsWith("/dashboard/matches/") ||
        current === "/ai-search"
      );
    }

    if (navPath === "/dashboard/applications") {
      return (
        current === "/applications" ||
        current === "/dashboard/applications" ||
        current.startsWith("/applications/") ||
        current.startsWith("/dashboard/applications/")
      );
    }

    if (navPath === "/dashboard/application-assistant") {
      return (
        current === "/application-assistant" ||
        current === "/dashboard/application-assistant" ||
        current.startsWith("/application-assistant/") ||
        current.startsWith("/dashboard/application-assistant/")
      );
    }

    if (navPath === "/dashboard/interview-coach") {
      return (
        current === "/interview-coach" ||
        current === "/dashboard/interview-coach" ||
        current.startsWith("/interview-coach/") ||
        current.startsWith("/dashboard/interview-coach/")
      );
    }

    if (navPath === "/dashboard/career-copilot") {
      return (
        current === "/career-copilot" ||
        current === "/dashboard/career-copilot" ||
        current.startsWith("/career-copilot/") ||
        current.startsWith("/dashboard/career-copilot/")
      );
    }

    if (navPath === "/dashboard/analytics") {
      return (
        current === "/analytics" ||
        current === "/dashboard/analytics" ||
        current.startsWith("/analytics/") ||
        current.startsWith("/dashboard/analytics/")
      );
    }

    if (navPath === "/dashboard/resume") {
      return (
        current === "/resume" ||
        current === "/dashboard/resume" ||
        current.startsWith("/resume/") ||
        current.startsWith("/dashboard/resume/")
      );
    }

    if (navPath === "/dashboard/settings") {
      return (
        current === "/settings" ||
        current === "/dashboard/settings" ||
        current.startsWith("/settings/") ||
        current.startsWith("/dashboard/settings/")
      );
    }

    if (navPath === "/profile") {
      return (
        current === "/profile" ||
        current === "/dashboard/profile"
      );
    }

    return false;
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="brand">
          <img
            src="/logo.jpg"
            alt="AgentScout AI Logo"
            className="brand-logo-img"
          />

          <div className="brand-text">
            <h1 className="brand-title">AgentScout-AI</h1>
            <span className="brand-subtitle">YOUR AI CAREER PARTNER</span>
          </div>

          {onCloseMobile && (
            <button
              type="button"
              className="mobile-close-btn"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navigationSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-header">{section.title}</div>
              <div className="sidebar-section-items">
                {section.items.map(({ label, path, icon: Icon }) => {
                  const active = isItemActive(path);

                  return (
                    <NavLink
                      key={path}
                      to={path}
                      className={`nav-item ${active ? "active" : ""}`}
                    >
                      <Icon size={18} className="nav-icon" />
                      <span>{label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={logout}
            className="nav-item logout-btn"
            aria-label="Sign out of AgentScout"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
