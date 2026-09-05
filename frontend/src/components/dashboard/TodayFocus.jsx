import React from "react";
import { CheckCircle2, Circle, ArrowRight, Target } from "lucide-react";

const defaultTasks = [
  {
    id: "t1",
    title: "Complete candidate profile skills",
    status: "completed",
    priority: "High Priority",
    estimatedTime: "5 min",
  },
  {
    id: "t2",
    title: "Improve Resume ATS Score for target roles",
    status: "pending",
    priority: "High Priority",
    estimatedTime: "15 min",
  },
  {
    id: "t3",
    title: "Apply to Top Matched Senior Frontend Role",
    status: "pending",
    priority: "Medium Priority",
    estimatedTime: "10 min",
  },
];

const TodayFocus = ({ plannerData, onNavigate }) => {
  const rawTasks = plannerData?.todayTasks || plannerData?.tasks || [];
  const displayTasks = rawTasks.length > 0
    ? rawTasks.slice(0, 3).map((t, idx) => ({
        id: t._id || t.id || `task-${idx}`,
        title: t.title || t.name || "Career Action Item",
        status: t.completed || t.status === "COMPLETED" ? "completed" : "pending",
        priority: t.priority === "HIGH" ? "High Priority" : "Medium Priority",
        estimatedTime: t.estimatedTime || t.duration || "10 min",
      }))
    : defaultTasks;

  return (
    <section className="dashboard-section-card">
      <div className="section-title-header">
        <div className="section-title-group">
          <Target size={18} className="section-title-icon" />
          <h3 className="section-heading">Today's Focus</h3>
        </div>

        <button
          type="button"
          className="section-view-all-btn"
          onClick={() => onNavigate("/dashboard/career-planner")}
        >
          <span>View Full Career Plan</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="tasks-focus-list">
        {displayTasks.map((task) => {
          const isDone = task.status === "completed";

          return (
            <div key={task.id} className={`task-focus-item ${isDone ? "is-completed" : ""}`}>
              <div className="task-left">
                {isDone ? (
                  <CheckCircle2 size={18} className="task-check-icon completed" />
                ) : (
                  <Circle size={18} className="task-check-icon pending" />
                )}
                <span className="task-title-text">{task.title}</span>
              </div>

              <div className="task-meta-right">
                <span className={`task-priority-badge ${task.priority.toLowerCase().includes("high") ? "high" : "medium"}`}>
                  {task.priority}
                </span>
                <span className="task-time-label">· {task.estimatedTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TodayFocus;
