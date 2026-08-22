import { AlertCircle, RefreshCw } from "lucide-react";

const ApplicationAssistantError = ({ message, onRetry }) => {
  return (
    <div className="inline-error-state" style={{ margin: "24px 0" }}>
      <AlertCircle size={20} />
      <span>{message || "Unable to load Application Assistant workspace."}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="retry-btn">
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};

export default ApplicationAssistantError;
