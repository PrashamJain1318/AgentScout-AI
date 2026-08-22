import { useNavigate } from "react-router-dom";
import { CheckCheck, ExternalLink } from "lucide-react";
import NotificationItem from "./NotificationItem";
import NotificationSkeleton from "./NotificationSkeleton";
import NotificationEmptyState from "./NotificationEmptyState";

const NotificationDropdown = ({
  notifications = [],
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onClose,
}) => {
  const navigate = useNavigate();

  return (
    <div className="notification-dropdown-panel" onClick={(e) => e.stopPropagation()}>
      <div className="dropdown-header flex-between">
        <h4>Notifications</h4>
        <div className="header-actions">
          {notifications.some((n) => !n.read) && (
            <button
              type="button"
              className="text-action-btn"
              onClick={onMarkAllRead}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      <div className="dropdown-scroll-body">
        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          notifications.slice(0, 6).map((n) => (
            <NotificationItem
              key={n._id || n.id}
              notification={n}
              onMarkRead={onMarkRead}
              compact
            />
          ))
        )}
      </div>

      <div className="dropdown-footer flex-between">
        <button
          type="button"
          className="view-all-link-btn"
          onClick={() => {
            onClose();
            navigate("/dashboard/notifications");
          }}
        >
          <span>View All Activity Center</span>
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
