import { useNavigate } from "react-router-dom";
import { BellOff, Search } from "lucide-react";

const NotificationEmptyState = ({ title = "You're all caught up 🎉", message = "No new career activity right now." }) => {
  const navigate = useNavigate();

  return (
    <div className="notification-empty-box">
      <div className="empty-bell-icon">
        <BellOff size={36} />
      </div>

      <h4>{title}</h4>
      <p>{message}</p>

      <button
        type="button"
        className="primary-action-btn"
        onClick={() => navigate("/dashboard/opportunities")}
      >
        <Search size={16} />
        <span>Explore Opportunities</span>
      </button>
    </div>
  );
};

export default NotificationEmptyState;
