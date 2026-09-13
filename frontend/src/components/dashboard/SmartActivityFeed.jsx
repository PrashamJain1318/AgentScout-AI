import React from "react";
import { Bell, FileCheck, Sparkles, Mic, Bot, ArrowRight } from "lucide-react";

const getEventIcon = (type) => {
  switch (type?.toUpperCase()) {
    case "MATCH":
      return Sparkles;
    case "RESUME":
      return FileCheck;
    case "INTERVIEW":
      return Mic;
    case "AGENT":
      return Bot;
    default:
      return Bell;
  }
};

const SmartActivityFeed = ({ recentActivities, loading, onNavigate }) => {
  const events = Array.isArray(recentActivities) ? recentActivities.slice(0, 4) : [];

  return (
    <section className="db-activity-feed-section">
      <div className="db-section-header-row">
        <div>
          <h3 className="db-section-title">Smart Activity Feed</h3>
          <p className="db-section-subtitle">Recent career telemetry & AI agent actions</p>
        </div>
        <button
          type="button"
          className="db-link-btn"
          onClick={() => onNavigate("/dashboard/notifications")}
        >
          <span>View All Activity</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="db-activity-skeleton-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="db-activity-item-skeleton" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="db-activity-list">
          {events.map((event) => {
            const Icon = getEventIcon(event.type || event.category);
            return (
              <div key={event.id || event._id || event.title} className="db-activity-item">
                <div className="db-activity-icon-wrapper">
                  <Icon size={15} />
                </div>
                <div className="db-activity-details">
                  <div className="db-activity-top-line">
                    <span className="db-activity-title">{event.title || event.heading}</span>
                    <span className="db-activity-time">{event.time || event.createdAt || "Just now"}</span>
                  </div>
                  <p className="db-activity-msg">{event.message || event.description || event.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No career activity yet.
          </p>
        </div>
      )}
    </section>
  );
};

export default SmartActivityFeed;
