import ApplicationStatusBadge from "./ApplicationStatusBadge";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ApplicationTimeline = ({ timeline = [], currentStatus = "saved", createdAt = null }) => {
  // If no timeline array exists, generate initial events from real document timestamps
  let items = Array.isArray(timeline) && timeline.length > 0 ? timeline : [];

  if (items.length === 0) {
    items = [
      {
        status: "saved",
        date: createdAt || new Date(),
        note: "Application saved to portfolio",
      },
    ];

    if (currentStatus && currentStatus !== "saved") {
      items.push({
        status: currentStatus,
        date: new Date(),
        note: `Moved to ${currentStatus}`,
      });
    }
  }

  return (
    <div className="application-timeline-container">
      <h4 className="timeline-title">Application Pipeline History</h4>

      <div className="timeline-items-list">
        {items.map((item, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-marker-line">
              <div className="marker-dot" />
              {idx < items.length - 1 && <div className="connector-line" />}
            </div>

            <div className="timeline-content-box">
              <div className="timeline-item-header">
                <ApplicationStatusBadge status={item.status} size="small" />
                <span className="timeline-date-text">{formatDate(item.date)}</span>
              </div>

              {item.note && <p className="timeline-note-text">{item.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
