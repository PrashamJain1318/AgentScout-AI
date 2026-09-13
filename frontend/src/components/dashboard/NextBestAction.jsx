import React from "react";
import { Target, Clock, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import MotionCard from "../motion/MotionCard";
import MotionButton from "../motion/MotionButton";

const getDerivedAction = (osSnapshot, plannerData, user, resumeData, applicationsCount) => {
  const rawAction = osSnapshot?.actionState?.nextBestAction || plannerData?.nextBestAction;
  if (rawAction?.title) {
    return {
      title: rawAction.title,
      description: rawAction.description || rawAction.reason || "Action recommended by AI Career Intelligence.",
      priority: rawAction.priority || "HIGH",
      estimatedTime: rawAction.estimatedTime || rawAction.duration || "10 min",
      impact: rawAction.impact || "HIGH_IMPACT",
      targetRoute: rawAction.actionUrl || rawAction.route || "/dashboard",
      btnText: "Take Action Now"
    };
  }

  // Dynamic derivation based on real authenticated user state
  const hasTargetRole = Boolean(user?.targetRole || user?.profile?.targetRole || user?.headline);
  const hasResume = Boolean(resumeData && (resumeData._id || resumeData.fileName || resumeData.parsedText));
  const hasApps = (applicationsCount || 0) > 0;

  if (!hasTargetRole) {
    return {
      title: "Set Your Target Career Role",
      description: "Specify your target position and job preferences to activate tailored opportunity matching.",
      priority: "HIGH",
      estimatedTime: "2 min",
      impact: "HIGH_IMPACT",
      targetRoute: "/dashboard/profile",
      btnText: "Set Target Role"
    };
  }

  if (!hasResume) {
    return {
      title: "Upload Your Resume",
      description: "Upload your resume to calculate ATS match scores, extract skills, and enable application assistance.",
      priority: "HIGH",
      estimatedTime: "5 min",
      impact: "HIGH_IMPACT",
      targetRoute: "/dashboard/resume",
      btnText: "Upload Resume"
    };
  }

  if (!hasApps) {
    return {
      title: "Explore High-Match Opportunities",
      description: "Browse AI-recommended job and internship opportunities matched against your candidate profile.",
      priority: "MEDIUM",
      estimatedTime: "10 min",
      impact: "HIGH_IMPACT",
      targetRoute: "/dashboard/opportunities",
      btnText: "Explore Opportunities"
    };
  }

  return {
    title: "Review Career Intelligence & Roadmap",
    description: "Your candidate profile and telemetry are active. Review your proactive intelligence briefing.",
    priority: "RECOMMENDED",
    estimatedTime: "5 min",
    impact: "MEDIUM_IMPACT",
    targetRoute: "/dashboard/intelligence",
    btnText: "View Intelligence"
  };
};

const NextBestAction = ({ osSnapshot, plannerData, user, resumeData, applicationsCount, onNavigate }) => {
  const action = getDerivedAction(osSnapshot, plannerData, user, resumeData, applicationsCount);

  return (
    <MotionCard className="db-next-action-card" hoverElevation={-3}>
      <div className="db-next-action-header">
        <div className="db-next-action-title-box">
          <div className="db-next-action-icon">
            <Target size={22} />
          </div>
          <div>
            <span className="db-next-action-kicker">🎯 YOUR NEXT BEST ACTION</span>
            <h2 className="db-next-action-heading">{action.title}</h2>
          </div>
        </div>

        <div className="db-next-action-pills">
          <span className={`db-priority-pill priority-${(action.priority || "HIGH").toLowerCase()}`}>
            <Zap size={12} />
            {action.priority === "HIGH" ? "High Priority" : "Recommended"}
          </span>

          <span className="db-time-pill">
            <Clock size={12} />
            {action.estimatedTime}
          </span>
        </div>
      </div>

      <p className="db-next-action-body">{action.description}</p>

      <div className="db-next-action-footer">
        <div className="db-next-action-reasoning">
          <CheckCircle2 size={15} className="db-reasoning-icon" />
          <div>
            <strong className="reasoning-title">Why this matters:</strong>
            <span className="reasoning-text">
              {action.impact === "HIGH_IMPACT" || action.priority === "HIGH"
                ? "Completing foundational setup steps unlocks higher match precision and telemetry scoring."
                : "Keeps your candidate application pipeline and readiness metrics up to date."}
            </span>
          </div>
        </div>

        <MotionButton
          className="db-next-action-btn"
          onClick={() => onNavigate(action.targetRoute)}
        >
          <span>{action.btnText}</span>
          <ArrowRight size={16} />
        </MotionButton>
      </div>
    </MotionCard>
  );
};

export default NextBestAction;
