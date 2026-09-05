import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="db-skeleton-container" aria-label="Loading Dashboard">
      <div className="db-skeleton-welcome" />
      <div className="db-skeleton-quick-actions" />
      <div className="db-skeleton-hero" />
      <div className="db-skeleton-next-action" />
      <div className="db-skeleton-health-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="db-skeleton-health-card" />
        ))}
      </div>
      <div className="db-skeleton-opps-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="db-skeleton-opp-card" />
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
