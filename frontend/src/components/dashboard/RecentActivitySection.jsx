import React from "react";
import { Bell, CheckCircle2, Sparkles, Briefcase, Mic, ArrowRight } from "lucide-react";

const defaultActivities = [
  {
    id: "a1",
    type: "RESUME",
    icon: CheckCircle2,
    title: "Resume analyzed & ATS score updated",
    timestamp: "2 hours ago",
  },
  {
    id: "a2",
    type: "MATCH",
    icon: Sparkles,
    title: "New 92% match discovered at Google",
    timestamp: "Yesterday",
  },
  {
    id: "a3",
    type: "APPLICATION",
    icon: Briefcase,
    title: "Application draft & cover letter prepared",
    timestamp: "Yesterday",
  },
  {
    id: "a4",
    type: "INTERVIEW",
    icon: Mic,
    title: "Mock interview practice session completed",
    timestamp: "2 days ago",
  },
];

const RecentActivitySection = ({ recentActivities, loading, onNavigate }) => {
  const displayActivities =
    Array.isArray(recentActivities) && recentActivities.length > 0
      ? recentActivities.slice(0, 4).map((item, idx) => ({
          id: item._id || item.id || `act-${idx}`,
          title: item.title || item.message || "Notification Activity",
          timestamp: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently",
          icon: item.type === "MATCH" ? Sparkles : item.type === "APPLICATION" ? Briefcase : CheckCircle2,
        }))
      : defaultActivities;

  return (
    <section className="dashboard-section-card">
      <div className="section-title-header">
        <div className="section-title-group">
          <Bell size={18} className="section-title-icon" />
          <h3 className="section-heading">Recent Activity</h3>
        </div>

        <button
          type="button"
          className="section-view-all-btn"
          onClick={() => onNavigate("/notifications")}
        >
          <span>View All Activity</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="activity-skeleton-list">
          <div className="activity-skeleton-item" />
          <div className="activity-skeleton-item" />
          <div className="activity-skeleton-item" />
        </div>
      ) : (
        <div className="activity-timeline-list">
          {displayActivities.map(({ id, title, timestamp, icon: Icon }) => (
            <div key={id} className="activity-timeline-item">
              <div className="activity-icon-bullet">
                <Icon size={14} />
              </div>

              <div className="activity-content-col">
                <span className="activity-title-text">{title}</span>
                <span className="activity-time-stamp">{timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentActivitySection;
