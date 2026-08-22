import { Sparkles, Target, FileText, CheckCircle } from "lucide-react";

const ApplicationAssistantHeader = () => {
  return (
    <div className="application-assistant-header flex-between">
      <div>
        <div className="header-badge">
          <Sparkles size={14} className="text-primary" />
          <span>AI APPLICATION ASSISTANT</span>
        </div>
        <h2>Application Assistant</h2>
        <p className="subtitle-text">
          Build a stronger application for every opportunity with AI-powered readiness intelligence.
        </p>
      </div>

      <div className="assistant-workflow-steps">
        <div className="step-pill active">
          <Target size={13} />
          <span>1. Readiness</span>
        </div>
        <div className="step-pill active">
          <FileText size={13} />
          <span>2. Tailoring</span>
        </div>
        <div className="step-pill active">
          <CheckCircle size={13} />
          <span>3. Apply</span>
        </div>
      </div>
    </div>
  );
};

export default ApplicationAssistantHeader;
