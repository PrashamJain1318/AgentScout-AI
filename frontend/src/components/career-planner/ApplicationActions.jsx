import { BookmarkCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationActions = ({ actions = [] }) => {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">APPLICATION PIPELINE</span>
          <h3>Pipeline Velocity & Strategy Actions ({actions.length})</h3>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "16px" }}>
        {actions.map((act) => (
          <div key={act.id} className="suggestion-item-card flex-between">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BookmarkCheck size={16} className="text-primary" />
                <strong>{act.title}</strong>
              </div>
              <p className="notif-subtext" style={{ margin: "4px 0 0 0" }}>
                {act.description}
              </p>
            </div>

            <button
              type="button"
              className="save-profile-btn"
              onClick={() => navigate(act.deepLink || "/dashboard/applications")}
            >
              <span>View Pipeline</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationActions;
