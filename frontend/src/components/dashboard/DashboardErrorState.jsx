import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const DashboardErrorState = ({ title, message, onRetry }) => {
  return (
    <div className="db-error-fallback-card">
      <div className="db-error-icon-box">
        <AlertCircle size={20} />
      </div>
      <div className="db-error-content">
        <h4 className="db-error-title">{title || "Unable to Load Component Data"}</h4>
        <p className="db-error-message">{message || "We encountered a temporary connection issue. Your telemetry will refresh automatically."}</p>
      </div>
      {onRetry && (
        <button type="button" className="db-error-retry-btn" onClick={onRetry}>
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default DashboardErrorState;
