import { Sparkles, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationAssistantEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="empty-state-box" style={{ padding: "48px 24px" }}>
      <Sparkles size={40} className="empty-icon text-primary" />
      <h4>Select an Opportunity to Begin Preparation</h4>
      <p style={{ maxWidth: "460px" }}>
        Choose an opportunity from the selector above or browse open opportunities to generate tailored cover letters, readiness scores, and application strategies.
      </p>

      <button
        type="button"
        className="primary-action-btn"
        onClick={() => navigate("/opportunities")}
        style={{ marginTop: "12px" }}
      >
        <Search size={16} />
        <span>Explore Opportunities Explorer</span>
      </button>
    </div>
  );
};

export default ApplicationAssistantEmptyState;
