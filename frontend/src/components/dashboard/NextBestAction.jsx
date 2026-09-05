import React from "react";
import { Target, Clock, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import MotionCard from "../motion/MotionCard";
import MotionButton from "../motion/MotionButton";

const NextBestAction = ({ osSnapshot, plannerData, onNavigate }) => {
  const rawAction =
    osSnapshot?.actionState?.nextBestAction ||
    plannerData?.nextBestAction ||
    null;

  const actionTitle = rawAction?.title || "Improve Your Resume ATS Score";
  const actionDesc =
    rawAction?.description ||
    rawAction?.reason ||
    "Your current ATS match score is 68%. Adding missing technical keywords for target Senior roles will increase recruiter callback rates.";
  const priority = rawAction?.priority || "HIGH";
  const estimatedTime = rawAction?.estimatedTime || rawAction?.duration || "15 min";
  const impact = rawAction?.impact || "HIGH_IMPACT";
  const targetRoute = rawAction?.actionUrl || rawAction?.route || "/dashboard/resume";

  return (
    <MotionCard className="db-next-action-card" hoverElevation={-3}>
      <div className="db-next-action-header">
        <div className="db-next-action-title-box">
          <div className="db-next-action-icon">
            <Target size={22} />
          </div>
          <div>
            <span className="db-next-action-kicker">🎯 YOUR NEXT BEST ACTION</span>
            <h2 className="db-next-action-heading">{actionTitle}</h2>
          </div>
        </div>

        <div className="db-next-action-pills">
          <span className={`db-priority-pill priority-${priority.toLowerCase()}`}>
            <Zap size={12} />
            {priority === "HIGH" ? "High Priority" : "Recommended"}
          </span>

          <span className="db-time-pill">
            <Clock size={12} />
            {estimatedTime}
          </span>
        </div>
      </div>

      <p className="db-next-action-body">{actionDesc}</p>

      <div className="db-next-action-footer">
        <div className="db-next-action-reasoning">
          <CheckCircle2 size={15} className="db-reasoning-icon" />
          <div>
            <strong className="reasoning-title">Why this matters:</strong>
            <span className="reasoning-text">
              {impact === "HIGH_IMPACT" || priority === "HIGH"
                ? "Boosting ATS keyword coverage directly increases interview response rates by up to 3.4x."
                : "Improves overall candidate readiness and opportunity match score quality."}
            </span>
          </div>
        </div>

        <MotionButton
          className="db-next-action-btn"
          onClick={() => onNavigate(targetRoute)}
        >
          <span>Take Action Now</span>
          <ArrowRight size={16} />
        </MotionButton>
      </div>
    </MotionCard>
  );
};

export default NextBestAction;
