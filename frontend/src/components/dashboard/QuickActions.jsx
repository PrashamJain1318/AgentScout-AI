import React from "react";
import { Search, FileText, Send, Mic, Bot } from "lucide-react";
import MotionButton from "../motion/MotionButton";
import StaggerContainer, { StaggerItem } from "../motion/StaggerContainer";

const QUICK_ACTIONS = [
  {
    id: "jobs",
    label: "Find Jobs",
    icon: Search,
    route: "/dashboard/opportunities",
    accent: "blue",
  },
  {
    id: "resume",
    label: "Analyze Resume",
    icon: FileText,
    route: "/dashboard/resume",
    accent: "purple",
  },
  {
    id: "application",
    label: "Prepare Application",
    icon: Send,
    route: "/dashboard/application-assistant",
    accent: "emerald",
  },
  {
    id: "interview",
    label: "Practice Interview",
    icon: Mic,
    route: "/dashboard/interview-coach",
    accent: "amber",
  },
  {
    id: "agent",
    label: "Ask AI Agent",
    icon: Bot,
    route: "/dashboard/agent",
    accent: "indigo",
  },
];

const QuickActions = ({ onNavigate }) => {
  return (
    <section className="db-quick-actions-bar" aria-label="Quick Navigation Actions">
      <StaggerContainer className="db-quick-actions-grid" staggerDelay={0.04}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <StaggerItem key={action.id}>
              <MotionButton
                className={`db-quick-action-btn accent-${action.accent}`}
                onClick={() => onNavigate(action.route)}
              >
                <div className="db-quick-action-icon">
                  <Icon size={16} />
                </div>
                <span className="db-quick-action-label">{action.label}</span>
              </MotionButton>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
};

export default QuickActions;
