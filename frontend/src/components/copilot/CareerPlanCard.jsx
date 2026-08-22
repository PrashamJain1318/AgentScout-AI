import { Calendar, CheckCircle2, Flag } from "lucide-react";

const CareerPlanCard = ({ roadmap }) => {
  if (!roadmap || !Array.isArray(roadmap.weeks)) return null;

  return (
    <div className="career-plan-card">
      <div className="plan-header">
        <Calendar size={18} className="text-primary" />
        <h4>{roadmap.title || "30-Day Learning Roadmap"}</h4>
      </div>

      <div className="weeks-timeline-list">
        {roadmap.weeks.map((w, idx) => (
          <div key={idx} className="roadmap-week-item">
            <div className="week-badge-col">
              <span className="week-pill">Week {w.week}</span>
            </div>

            <div className="week-details-col">
              <h5 className="focus-title">{w.focus}</h5>

              {Array.isArray(w.tasks) && (
                <ul className="tasks-list">
                  {w.tasks.map((task, tIdx) => (
                    <li key={tIdx}>
                      <CheckCircle2 size={13} className="task-check-icon" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              )}

              {w.outcome && (
                <div className="outcome-box">
                  <Flag size={13} />
                  <span><strong>Expected Outcome:</strong> {w.outcome}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerPlanCard;
