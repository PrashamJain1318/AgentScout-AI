import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  Target,
  Bot,
  Menu,
  User,
  FileText,
  Send,
  Mic,
  Activity,
  Bell,
  Settings,
  ShieldCheck,
  Award,
} from "lucide-react";
import BottomSheet from "../mobile/BottomSheet";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home, route: "/dashboard" },
  { id: "jobs", label: "Jobs", icon: Briefcase, route: "/dashboard/opportunities" },
  { id: "plan", label: "Plan", icon: Target, route: "/dashboard/career-planner" },
  { id: "agent", label: "AI Agent", icon: Bot, route: "/dashboard/agent" },
  { id: "more", label: "More", icon: Menu, isMoreTrigger: true },
];

const MORE_LINKS = [
  { id: "profile", label: "Profile", icon: User, route: "/dashboard/profile", color: "blue" },
  { id: "resume", label: "Resume ATS", icon: FileText, route: "/dashboard/resume", color: "purple" },
  { id: "applications", label: "Applications", icon: Send, route: "/dashboard/applications", color: "emerald" },
  { id: "matches", label: "Match Engine", icon: Award, route: "/dashboard/matches", color: "amber" },
  { id: "assistant", label: "App Assistant", icon: Send, route: "/dashboard/application-assistant", color: "indigo" },
  { id: "interview", label: "Interview Coach", icon: Mic, route: "/dashboard/interview-coach", color: "rose" },
  { id: "monitor", label: "Opportunity Monitor", icon: ShieldCheck, route: "/dashboard/opportunity-monitor", color: "cyan" },
  { id: "analytics", label: "Career Analytics", icon: Activity, route: "/dashboard/analytics", color: "teal" },
  { id: "notifications", label: "Notifications", icon: Bell, route: "/dashboard/notifications", color: "amber" },
  { id: "settings", label: "Settings", icon: Settings, route: "/dashboard/settings", color: "slate" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleNavClick = (item) => {
    if (item.isMoreTrigger) {
      setIsMoreOpen(true);
    } else {
      setIsMoreOpen(false);
      navigate(item.route);
    }
  };

  const handleMoreLinkClick = (route) => {
    setIsMoreOpen(false);
    navigate(route);
  };

  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
        <div className="mobile-bottom-nav-grid">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              !item.isMoreTrigger &&
              (location.pathname === item.route ||
                (item.route !== "/dashboard" && location.pathname.startsWith(item.route)));

            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav-btn ${isActive ? "is-active" : ""}`}
                onClick={() => handleNavClick(item)}
              >
                <div className="mobile-nav-icon-wrapper">
                  <Icon size={20} />
                  {isActive && <div className="mobile-nav-active-dot" />}
                </div>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <BottomSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="Career OS Navigation"
      >
        <div className="more-drawer-grid">
          {MORE_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.route;
            return (
              <button
                key={link.id}
                type="button"
                className={`more-drawer-item color-${link.color} ${isActive ? "is-active" : ""}`}
                onClick={() => handleMoreLinkClick(link.route)}
              >
                <div className="more-item-icon">
                  <Icon size={20} />
                </div>
                <span className="more-item-label">{link.label}</span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
};

export default MobileBottomNav;
