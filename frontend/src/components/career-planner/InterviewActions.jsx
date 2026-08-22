import { Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InterviewActions = ({ actions = [] }) => {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return (
      <div className="resume-section-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">INTERVIEW INTELLIGENCE</span>
            <h3>Mock Interview Practice</h3>
          </div>
        </div>
        <p className="no-data-text">Your mock interview readiness is strong. Practice additional sessions anytime.</p>
        <button type="button" className="primary-action-btn" onClick={() => navigate("/dashboard/interview-coach")} style={{ marginTop: "12px" }}>
          <Brain size={16} /> Open Interview Coach
        </button>
      </div>
    );
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">INTERVIEW INTELLIGENCE</span>
          <h3>Interview Preparation Actions ({actions.length})</h3>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "16px" }}>
        {actions.map((act) => (
          <div key={act.id} className="suggestion-item-card flex-between">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Brain size={16} className="text-primary" />
                <strong>{act.title}</strong>
              </div>
              <p className="notif-subtext" style={{ margin: "4px 0 0 0" }}>
                {act.description}
              </p>
            </div>

            <button
              type="button"
              className="save-profile-btn"
              onClick={() => navigate(act.deepLink || "/dashboard/interview-coach")}
            >
              <span>Practice</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewActions;
