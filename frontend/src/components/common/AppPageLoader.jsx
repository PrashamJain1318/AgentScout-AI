import React from "react";
import { Loader2 } from "lucide-react";

const AppPageLoader = ({ text = "Loading AgentScout-AI Workspace..." }) => {
  return (
    <div
      className="app-page-loader-wrapper"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="app-page-loader-card">
        <div className="loader-brand-logo">
          <img
            src="/logo.jpg"
            alt="AgentScout AI"
            className="loader-logo-img"
          />
        </div>
        <div className="loader-spinner-box">
          <Loader2 className="spin-icon loader-spinner" size={24} />
        </div>
        <span className="loader-text">{text}</span>
      </div>
    </div>
  );
};

export default AppPageLoader;
