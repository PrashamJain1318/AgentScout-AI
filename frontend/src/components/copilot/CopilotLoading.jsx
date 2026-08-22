import { Sparkles, Loader2 } from "lucide-react";

export const CopilotThinkingIndicator = () => {
  return (
    <div className="chat-message-row ai-row thinking-row">
      <div className="message-avatar ai-avatar">
        <Sparkles size={16} className="spin" />
      </div>

      <div className="message-content-wrapper">
        <span className="sender-name-label">AI CAREER COPILOT</span>
        <div className="thinking-dots-bubble">
          <Loader2 size={16} className="spin text-primary" />
          <span>Analyzing career data & synthesizing recommendations...</span>
        </div>
      </div>
    </div>
  );
};

export const CopilotSkeleton = () => {
  return (
    <div className="copilot-skeleton-container">
      <div className="skeleton-bar title-bar"></div>
      <div className="skeleton-bar text-bar"></div>
      <div className="skeleton-bar short-bar"></div>
    </div>
  );
};

export default CopilotThinkingIndicator;
