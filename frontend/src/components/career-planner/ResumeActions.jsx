import { FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResumeActions = ({ actions = [] }) => {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return (
      <div className="resume-section-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">RESUME INTELLIGENCE</span>
            <h3>Resume ATS Optimization</h3>
          </div>
        </div>
        <p className="no-data-text">Your resume ATS score meets high competitive standards.</p>
        <button type="button" className="secondary-action-btn" onClick={() => navigate("/dashboard/resume")} style={{ marginTop: "12px" }}>
          <FileText size={16} /> Open Resume Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">RESUME INTELLIGENCE</span>
          <h3>Resume & Portfolio Actions ({actions.length})</h3>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "16px" }}>
        {actions.map((act) => (
          <div key={act.id} className="suggestion-item-card flex-between">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} className="text-primary" />
                <strong>{act.title}</strong>
              </div>
              <p className="notif-subtext" style={{ margin: "4px 0 0 0" }}>
                {act.description}
              </p>
            </div>

            <button
              type="button"
              className="save-profile-btn"
              onClick={() => navigate(act.deepLink || "/dashboard/resume")}
            >
              <span>Optimize</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeActions;
