import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const ComponentErrorFallback = ({
  title = "Section Unavailable",
  message = "Something went wrong while loading this section.",
  onRetry
}) => {
  return (
    <div className="component-error-fallback" role="alert">
      <div className="fallback-icon-wrap">
        <AlertCircle size={20} className="fallback-alert-icon" />
      </div>
      <div className="fallback-text-box">
        <h4 className="fallback-title">{title}</h4>
        <p className="fallback-message">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="fallback-retry-btn">
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ComponentErrorFallback;
