import React from "react";
import { CheckSquare, Clock, ArrowRight } from "lucide-react";
import AnimatedProgress from "../motion/AnimatedProgress";
import MotionCard from "../motion/MotionCard";

const TodayCareerPlan = ({ plannerData, onNavigate }) => {
  const actionsList = Array.isArray(plannerData?.todayPlan?.actions)
    ? plannerData.todayPlan.actions.slice(0, 4)
    : Array.isArray(plannerData?.actions)
    ? plannerData.actions.slice(0, 4)
    : [];

  const completedCount = actionsList.filter((a) => a.completed).length;
  const totalCount = actionsList.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <section className="db-today-plan-card">
      <div className="db-card-header-row">
        <div className="db-card-title-group">
          <div className="db-card-icon-badge color-indigo">
            <CheckSquare size={18} />
          </div>
          <div>
            <h3 className="db-card-title">Today's Career Plan</h3>
            <span className="db-card-subtitle">
              {totalCount > 0
                ? `${completedCount} of ${totalCount} completed (${progressPercent}%)`
                : "Personalized Daily Action Roadmap"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="db-card-action-link"
          onClick={() => onNavigate("/dashboard/career-planner")}
        >
          <span>{totalCount > 0 ? "Full Plan" : "Create Plan"}</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="db-plan-progress-track">
        <AnimatedProgress value={progressPercent} height={6} />
      </div>

      {totalCount > 0 ? (
        <ul className="db-plan-list">
          {actionsList.map((item) => (
            <MotionCard
              key={item.id || item.title}
              className={`db-plan-item ${item.completed ? "is-completed" : ""}`}
              onClick={() => onNavigate("/dashboard/career-planner")}
              hoverElevation={-1}
            >
              <div className="db-plan-checkbox">
                {item.completed ? (
                  <div className="checkbox-checked">✓</div>
                ) : (
                  <div className="checkbox-unchecked" />
                )}
              </div>

              <div className="db-plan-content">
                <span className="db-plan-title">{item.title}</span>
                <div className="db-plan-meta">
                  <span className="db-plan-time">
                    <Clock size={11} />
                    {item.estimatedTime || item.duration || "10 min"}
                  </span>
                  <span className={`db-plan-priority-tag tag-${(item.priority || "MEDIUM").toLowerCase()}`}>
                    {item.priority || "MEDIUM"}
                  </span>
                </div>
              </div>
            </MotionCard>
          ))}
        </ul>
      ) : (
        <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 my-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Your personalized daily plan will appear here as you set career goals.
          </p>
          <button
            onClick={() => onNavigate("/dashboard/career-planner")}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Create Career Plan
          </button>
        </div>
      )}
    </section>
  );
};

export default TodayCareerPlan;
