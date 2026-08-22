import { useState, useEffect } from "react";
import { CheckSquare, Square, CheckCircle2 } from "lucide-react";
import { updateChecklist } from "../../services/applicationAssistant.api";

const ApplicationChecklist = ({ opportunityId, initialChecklist = [] }) => {
  const [checklist, setChecklist] = useState(initialChecklist);

  useEffect(() => {
    if (Array.isArray(initialChecklist) && initialChecklist.length > 0) {
      setChecklist(initialChecklist);
    }
  }, [initialChecklist]);

  const toggleItem = async (itemId) => {
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    setChecklist(updated);

    if (opportunityId) {
      try {
        await updateChecklist(opportunityId, updated);
      } catch (err) {
        // Ignore fallback
      }
    }
  };

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length || 10;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">SUBMISSION CHECKLIST</span>
          <h3>Application Preparation Checklist</h3>
        </div>

        <div className="flex-between" style={{ gap: "8px" }}>
          <span className="notif-subtext">
            {completedCount} / {totalCount} Completed
          </span>
          <strong className="text-primary">{progressPct}% Ready</strong>
        </div>
      </div>

      <div className="progress-bar-bg" style={{ margin: "4px 0 12px 0" }}>
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="checklist-items-list flex-between" style={{ flexDirection: "column", gap: "8px", alignItems: "stretch" }}>
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`checklist-item-row ${item.completed ? "completed" : ""}`}
            onClick={() => toggleItem(item.id)}
            style={{
              padding: "10px 12px",
              background: item.completed ? "rgba(99, 102, 241, 0.04)" : "#f8fafc",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            {item.completed ? (
              <CheckCircle2 size={16} className="text-primary" />
            ) : (
              <Square size={16} className="text-muted" />
            )}

            <span style={{ fontSize: "13px", textDecoration: item.completed ? "line-through" : "none", color: item.completed ? "var(--text-muted)" : "var(--text)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationChecklist;
