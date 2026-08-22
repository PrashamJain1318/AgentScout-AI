import { Radio, Search, AlertCircle } from "lucide-react";

export const MonitorEmptyState = ({ onRun }) => {
  return (
    <div className="empty-state-box" style={{ margin: "24px 0" }}>
      <Radio size={36} className="empty-icon text-primary" />
      <h4>No Matches Detected Yet</h4>
      <p>Click "Run Monitor Now" to scan current market opportunities against your candidate profile.</p>
      <button type="button" className="primary-action-btn" onClick={onRun}>
        Run Monitor Now
      </button>
    </div>
  );
};

export const MonitorSkeleton = () => {
  return (
    <div className="skeleton-details-body" style={{ minHeight: "360px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="skeleton-card" style={{ height: "100px" }} />
      <div className="skeleton-card" style={{ height: "180px" }} />
      <div className="skeleton-card" style={{ height: "180px" }} />
    </div>
  );
};
