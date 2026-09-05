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
  const events = Array.isArray(recentActivities) && recentActivities.length > 0
    ? recentActivities.slice(0, 4)
    : [
        {
          id: "act-1",
          type: "RESUME",
          title: "ATS Resume Health Analyzed",
          message: "Resume keywords updated for Senior Frontend Engineer role.",
          time: "2 hours ago",
        },
        {
          id: "act-2",
          type: "MATCH",
          title: "New High-Match Opportunity Found",
          message: "94% match for Staff Software Engineer at Acme Corp.",
          time: "4 hours ago",
        },
        {
          id: "act-3",
          type: "INTERVIEW",
          title: "System Design Practice Completed",
          message: "Scored 84% on distributed caching simulation.",
          time: "Yesterday",
        },
        {
          id: "act-4",
          type: "AGENT",
          title: "AI Career Agent Telemetry Cycle",
          message: "Evaluated 14 new active market postings.",
          time: "1 day ago",
        },
      ];

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
          onClick={() => onNavigate("/dashboard/analytics")}
        >
          <span>View Analytics</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="db-activity-skeleton-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="db-activity-item-skeleton" />
          ))}
        </div>
      ) : (
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
      )}
    </section>
  );
};

export default SmartActivityFeed;
