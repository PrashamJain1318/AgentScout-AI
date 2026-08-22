import { CheckSquare, Square, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TodayPlan = ({ dailyActions = [], onToggleAction }) => {
  const navigate = useNavigate();

  if (dailyActions.length === 0) {
    return (
      <div className="resume-section-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">DAILY EXECUTION</span>
            <h3>Today's Career Action Items</h3>
          </div>
        </div>
        <p className="no-data-text">No action items scheduled for today. Refresh your plan to populate actions.</p>
      </div>
    );
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">DAILY EXECUTION</span>
          <h3>Today's High-Impact Priorities ({dailyActions.length})</h3>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "16px" }}>
        {dailyActions.map((action) => {
          const isCompleted = action.status === "completed";
          const isSkipped = action.status === "skipped";

          return (
            <div
              key={action.id}
              className={`suggestion-item-card ${isCompleted ? "completed-item" : ""}`}
              style={{
                opacity: isCompleted || isSkipped ? 0.75 : 1,
                borderLeft: action.priority === "critical" ? "4px solid var(--danger)" : "4px solid var(--primary)"
              }}
            >
              <div className="suggestion-header flex-between">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    onClick={() => onToggleAction(action.id, isCompleted ? "pending" : "completed")}
                  >
                    {isCompleted ? (
                      <CheckSquare size={20} className="text-success" />
                    ) : (
                      <Square size={20} className="text-muted" />
                    )}
                  </button>
                  <strong style={{ fontSize: "15px", textDecoration: isCompleted ? "line-through" : "none" }}>
                    {action.title}
                  </strong>
                </div>

                <div className="flex-between" style={{ gap: "8px" }}>
                  <span className={`impact-badge ${action.priority || "medium"}`}>
                    {(action.priority || "MEDIUM").toUpperCase()}
                  </span>
                  <span className="step-pill active" style={{ fontSize: "11px" }}>
                    <Clock size={11} /> {action.estimatedMinutes || 15}m
                  </span>
                </div>
              </div>

              {action.description && (
                <p className="suggestion-explanation" style={{ margin: "8px 0 0 30px", fontSize: "13px" }}>
                  {action.description}
                </p>
              )}

              {action.deepLink && !isCompleted && (
                <div style={{ marginTop: "10px", marginLeft: "30px" }}>
                  <button
                    type="button"
                    className="section-link-btn"
                    onClick={() => navigate(action.deepLink)}
                  >
                    <span>Execute Action</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodayPlan;
