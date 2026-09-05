import React from "react";
import { CheckSquare, Clock, ArrowRight, Sparkles } from "lucide-react";

const TodayCareerPlan = ({ plannerData, onNavigate }) => {
  const actionsList = Array.isArray(plannerData?.todayPlan?.actions)
    ? plannerData.todayPlan.actions.slice(0, 4)
    : Array.isArray(plannerData?.actions)
    ? plannerData.actions.slice(0, 4)
    : [
        {
          id: "act-1",
          title: "Improve Resume Keywords for Target Role",
          estimatedTime: "15 min",
          completed: true,
          priority: "HIGH",
        },
        {
          id: "act-2",
          title: "Apply to Top Matched Senior Position",
          estimatedTime: "10 min",
          completed: true,
          priority: "HIGH",
        },
        {
          id: "act-3",
          title: "Practice System Design & TypeScript Interview",
          estimatedTime: "20 min",
          completed: false,
          priority: "MEDIUM",
        },
        {
          id: "act-4",
          title: "Review Opportunity Monitor Alerts",
          estimatedTime: "5 min",
          completed: false,
          priority: "LOW",
        },
      ];

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
              {completedCount} of {totalCount} completed ({progressPercent}%)
            </span>
          </div>
        </div>

        <button
          type="button"
          className="db-card-action-link"
          onClick={() => onNavigate("/dashboard/career-planner")}
        >
          <span>Full Plan</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="db-plan-progress-track">
        <div
          className="db-plan-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ul className="db-plan-list">
        {actionsList.map((item) => (
          <li
            key={item.id || item.title}
            className={`db-plan-item ${item.completed ? "is-completed" : ""}`}
            onClick={() => onNavigate("/dashboard/career-planner")}
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
                  {item.estimatedTime || "10 min"}
                </span>
                <span className={`db-plan-priority-tag tag-${(item.priority || "MEDIUM").toLowerCase()}`}>
                  {item.priority || "MEDIUM"}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TodayCareerPlan;
