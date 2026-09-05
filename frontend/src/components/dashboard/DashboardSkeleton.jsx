import React from "react";

const DashboardSkeleton = ({ height = "120px" }) => {
  return (
    <div
      className="dashboard-skeleton-card"
      style={{ height }}
      aria-hidden="true"
    >
      <div className="skeleton-pulse-line" style={{ width: "40%", height: "16px" }} />
      <div className="skeleton-pulse-line" style={{ width: "80%", height: "12px", marginTop: "12px" }} />
      <div className="skeleton-pulse-line" style={{ width: "60%", height: "12px", marginTop: "8px" }} />
    </div>
  );
};

export default DashboardSkeleton;
