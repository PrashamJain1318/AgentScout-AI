import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  RefreshCw,
  Filter,
} from "lucide-react";
import ActivityFeed from "../components/notifications/ActivityFeed";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "../services/notifications.api";

const FILTER_TABS = [
  { id: "all", label: "All Activity" },
  { id: "unread", label: "Unread" },
  { id: "applications", label: "Applications" },
  { id: "matches", label: "Matches" },
  { id: "career", label: "Career & Copilot" },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionNotice, setActionNotice] = useState("");

  const fetchNotificationList = async (pageNum = 1) => {
    setLoading(true);
    setActionNotice("");

    try {
      const params = { page: pageNum, limit: 20 };
      if (activeTab === "unread") params.read = false;
      if (activeTab === "applications") params.type = "application_created";
      if (activeTab === "matches") params.type = "new_match";
      if (activeTab === "career") params.type = "copilot";

      const data = await getNotifications(params);
      const list = data.notifications || data.data || [];
      setNotifications(list);

      if (data.pagination) {
        setTotalPages(data.pagination.pages || 1);
        setPage(data.pagination.page || 1);
      }
    } catch (err) {
      setActionNotice("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationList(1);
  }, [activeTab]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setActionNotice("All notifications marked as read.");
    } catch (err) {
      // Ignore
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
    } catch (err) {
      // Ignore
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      await clearAllNotifications();
      setNotifications([]);
      setActionNotice("All notifications cleared.");
    } catch (err) {
      // Ignore
    }
  };

  // Search filter
  const filteredNotifications = notifications.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.message?.toLowerCase().includes(q) ||
      n.type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="notifications-page">
      
      {/* Header Bar */}
      <div className="notifications-header-bar flex-between">
        <div>
          <div className="header-badge">
            <Bell size={14} className="text-primary" />
            <span>CAREER ACTIVITY CENTER</span>
          </div>
          <h2>Notifications & Activity Log</h2>
          <p className="subtitle-text">
            Stay updated with application updates, new AI matches, skill gap alerts, and Copilot guidance.
          </p>
        </div>

        <div className="header-actions-row">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={handleMarkAllRead}
            disabled={!notifications.some((n) => !n.read)}
          >
            <CheckCheck size={16} />
            <span>Mark All Read</span>
          </button>

          <button
            type="button"
            className="secondary-action-btn danger"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="card-apply-notice success" style={{ margin: "0" }}>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="notifications-controls-bar flex-between">

        {/* Filter Tabs */}
        <div className="filter-tabs-row">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`filter-tab-pill ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="search-field-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity..."
          />
        </div>

      </div>

      {/* Activity Timeline List */}
      <div className="notifications-body-card">
        <ActivityFeed
          notifications={filteredNotifications}
          loading={loading}
          onMarkRead={handleMarkRead}
          onDelete={handleDeleteNotification}
        />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-bar flex-between">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => fetchNotificationList(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>

          <span className="pagination-text">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => fetchNotificationList(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default Notifications;
