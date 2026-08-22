import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Award,
  Briefcase,
  RefreshCw,
  Calendar,
  BadgeCheck,
  Target,
  Bot,
  User,
  Bell,
  Trash2,
  Check,
} from "lucide-react";

export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 60) return "Just now";
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} minutes ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hours ago`;
  if (diffSecs < 172800) return "Yesterday";
  if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)} days ago`;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const iconMap = {
  new_match: { icon: Sparkles, color: "text-primary", bg: "bg-indigo-light" },
  excellent_match: { icon: Award, color: "text-success", bg: "bg-emerald-light" },
  application_created: { icon: Briefcase, color: "text-indigo", bg: "bg-indigo-light" },
  application_status: { icon: RefreshCw, color: "text-warning", bg: "bg-amber-light" },
  interview: { icon: Calendar, color: "text-primary", bg: "bg-indigo-light" },
  offer: { icon: BadgeCheck, color: "text-success", bg: "bg-emerald-light" },
  skill_gap: { icon: Target, color: "text-warning", bg: "bg-amber-light" },
  copilot: { icon: Bot, color: "text-indigo", bg: "bg-indigo-light" },
  profile: { icon: User, color: "text-muted", bg: "bg-gray-light" },
  system: { icon: Bell, color: "text-muted", bg: "bg-gray-light" },
};

const NotificationItem = ({
  notification,
  onMarkRead = null,
  onDelete = null,
  compact = false,
}) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const { _id, id, type, title, message, read, createdAt, link } = notification;
  const notifId = _id || id;

  const iconConfig = iconMap[type] || iconMap.system;
  const IconComponent = iconConfig.icon;

  const handleClick = (e) => {
    e.stopPropagation();

    if (!read && onMarkRead) {
      onMarkRead(notifId);
    }

    if (link) {
      navigate(link);
    }
  };

  return (
    <div
      className={`notification-item-card ${read ? "read" : "unread"} ${compact ? "compact" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className={`notif-type-icon ${iconConfig.bg} ${iconConfig.color}`}>
        <IconComponent size={compact ? 16 : 18} />
      </div>

      <div className="notif-content">
        <div className="notif-header-row">
          <span className={`notif-title ${read ? "read-title" : "unread-title"}`}>
            {title}
          </span>
          <span className="notif-time-text">{formatRelativeTime(createdAt)}</span>
        </div>

        <p className="notif-message-text">{message}</p>
      </div>

      <div className="notif-actions-col">
        {!read && (
          <button
            type="button"
            className="notif-read-indicator-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onMarkRead) onMarkRead(notifId);
            }}
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}

        {onDelete && !compact && (
          <button
            type="button"
            className="notif-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notifId);
            }}
            title="Delete notification"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
