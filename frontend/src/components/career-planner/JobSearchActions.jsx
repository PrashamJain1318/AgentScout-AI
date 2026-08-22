import { Search, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobSearchActions = ({ actions = [] }) => {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return (
      <div className="resume-section-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">JOB SEARCH INTELLIGENCE</span>
            <h3>Opportunity Recommendations</h3>
          </div>
        </div>
        <p className="no-data-text">No active job search actions pending. Explore opportunities in the explorer.</p>
        <button type="button" className="primary-action-btn" onClick={() => navigate("/opportunities")} style={{ marginTop: "12px" }}>
          <Search size={16} /> Explore Opportunities
        </button>
      </div>
    );
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">JOB SEARCH INTELLIGENCE</span>
          <h3>Priority Target Opportunities ({actions.length})</h3>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "16px" }}>
        {actions.map((act) => (
          <div key={act.id} className="suggestion-item-card flex-between">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} className="text-primary" />
                <strong>{act.title}</strong>
              </div>
              <p className="notif-subtext" style={{ margin: "4px 0 0 0" }}>
                {act.description}
              </p>
            </div>

            <button
              type="button"
              className="save-profile-btn"
              onClick={() => navigate(act.deepLink || "/opportunities")}
            >
              <span>Execute</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobSearchActions;
