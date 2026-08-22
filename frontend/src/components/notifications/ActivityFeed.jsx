import NotificationItem from "./NotificationItem";
import NotificationSkeleton from "./NotificationSkeleton";
import NotificationEmptyState from "./NotificationEmptyState";

const groupNotificationsByDate = (notifications = []) => {
  const groups = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  notifications.forEach((item) => {
    if (!item.createdAt) {
      groups.Earlier.push(item);
      return;
    }
    const d = new Date(item.createdAt);
    const dStr = d.toDateString();

    if (dStr === todayStr) {
      groups.Today.push(item);
    } else if (dStr === yesterdayStr) {
      groups.Yesterday.push(item);
    } else {
      groups.Earlier.push(item);
    }
  });

  return groups;
};

const ActivityFeed = ({
  notifications = [],
  loading = false,
  onMarkRead,
  onDelete,
}) => {
  if (loading) return <NotificationSkeleton />;

  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  const grouped = groupNotificationsByDate(notifications);

  return (
    <div className="activity-feed-timeline">
      {Object.entries(grouped).map(([groupTitle, items]) => {
        if (items.length === 0) return null;

        return (
          <div key={groupTitle} className="timeline-group">
            <h5 className="timeline-group-header">{groupTitle}</h5>

            <div className="timeline-items-list">
              {items.map((item) => (
                <NotificationItem
                  key={item._id || item.id}
                  notification={item}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
