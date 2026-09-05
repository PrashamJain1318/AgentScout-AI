import React from "react";
import { Search, FileText, Send, Mic, Bot } from "lucide-react";
import MotionButton from "../motion/MotionButton";

const ACTIONS = [
  { id: "jobs", label: "Jobs", icon: Search, route: "/dashboard/opportunities" },
  { id: "resume", label: "Resume", icon: FileText, route: "/dashboard/resume" },
  { id: "apply", label: "Apply", icon: Send, route: "/dashboard/application-assistant" },
  { id: "interview", label: "Interview", icon: Mic, route: "/dashboard/interview-coach" },
  { id: "agent", label: "AI Agent", icon: Bot, route: "/dashboard/agent" },
];

const MobileQuickActions = ({ onNavigate }) => {
  return (
    <div className="mobile-scroll-quick-actions">
      <div className="mobile-actions-track">
        {ACTIONS.map((act) => {
          const Icon = act.icon;
          return (
            <MotionButton
              key={act.id}
              className="mobile-action-pill"
              onClick={() => onNavigate(act.route)}
            >
              <Icon size={15} />
              <span>{act.label}</span>
            </MotionButton>
          );
        })}
      </div>
    </div>
  );
};

export default MobileQuickActions;
