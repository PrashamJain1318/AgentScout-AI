export const NotificationSkeleton = () => {
  return (
    <div className="notification-skeleton-container">
      <div className="notif-skeleton-item">
        <div className="skeleton-icon-box"></div>
        <div className="skeleton-text-col">
          <div className="skeleton-bar title-bar"></div>
          <div className="skeleton-bar msg-bar"></div>
        </div>
      </div>
      <div className="notif-skeleton-item">
        <div className="skeleton-icon-box"></div>
        <div className="skeleton-text-col">
          <div className="skeleton-bar title-bar"></div>
          <div className="skeleton-bar msg-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSkeleton;
