import React from "react";
import { Target, Clock, Zap, ArrowRight } from "lucide-react";

const NextBestActionCard = ({ osSnapshot, plannerData, onNavigate }) => {
  // Determine next action from OS snapshot, planner, or default recommendation
  const rawAction =
    osSnapshot?.actionState?.nextBestAction ||
    plannerData?.nextBestAction ||
    null;

  const actionTitle = rawAction?.title || "Optimize Your Resume ATS Score";
  const actionDesc =
    rawAction?.description ||
    rawAction?.reason ||
    "Your current ATS match score is below the recommended 80% threshold for target Senior Frontend roles.";
  const priority = rawAction?.priority || "HIGH";
  const estimatedTime = rawAction?.estimatedTime || rawAction?.duration || "15 min";
  const impact = rawAction?.impact || "HIGH_IMPACT";
  const targetRoute = rawAction?.actionUrl || rawAction?.route || "/dashboard/resume";

  return (
    <section className="next-action-hero-card">
      <div className="next-action-header-row">
        <div className="next-action-title-group">
          <div className="next-action-icon-box">
            <Target size={20} />
          </div>
          <div>
            <span className="next-action-kicker">🎯 YOUR NEXT BEST ACTION</span>
            <h2 className="next-action-heading">{actionTitle}</h2>
          </div>
        </div>

        <div className="next-action-badges-row">
          <span className={`priority-pill priority-${priority.toLowerCase()}`}>
            <Zap size={12} />
            {priority === "HIGH" ? "High Priority" : "Recommended"}
          </span>

          <span className="time-pill">
            <Clock size={12} />
            {estimatedTime}
          </span>
        </div>
      </div>

      <p className="next-action-description">{actionDesc}</p>

      <div className="next-action-footer-row">
        <div className="next-action-impact-info">
          <span className="impact-label">Why this matters:</span>
          <span className="impact-text">
            {impact === "HIGH_IMPACT" || priority === "HIGH"
              ? "High Impact — Boosting ATS match score directly increases recruiter interview callback rates by 3.4x."
              : "Increases career alignment and candidate pipeline completeness."}
          </span>
        </div>

        <button
          type="button"
          className="next-action-cta-btn"
          onClick={() => onNavigate(targetRoute)}
        >
          <span>Take Action</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default NextBestActionCard;
