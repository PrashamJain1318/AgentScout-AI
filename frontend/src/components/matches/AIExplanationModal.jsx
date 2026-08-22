import { useEffect } from "react";
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Loader2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import MatchScore from "./MatchScore";

const AIExplanationModal = ({
  isOpen,
  onClose,
  match,
  explanation,
  loading,
  error,
  onRetry,
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const opp = match?.opportunity || {};
  const score = match?.score || 0;
  const matchLevel = match?.matchLevel || "";

  const summary = explanation?.summary || match?.explanation?.summary || match?.recommendation || "";
  const whyYouMatch = explanation?.whyYouMatch || match?.explanation?.whyYouMatch || match?.reasons || [];
  const skillGaps = explanation?.skillGaps || match?.explanation?.skillGaps || match?.missingSkills || [];
  const recStatement = explanation?.recommendation || match?.explanation?.recommendation || "";
  const interviewTips = explanation?.interviewTips || match?.explanation?.interviewTips || [];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container dark-modal" onClick={(e) => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="ai-modal-badge">
              <Sparkles size={16} className="sparkle-active" />
              <span>GEMINI AI MATCH INSIGHTS</span>
            </div>
            <h3 id="modal-title">{opp.title || "Opportunity AI Analysis"}</h3>
            <span className="company-subtitle">{opp.company || "Company"}</span>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close AI Explanation Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="modal-body">
          {loading ? (
            <div className="ai-loading-state-box">
              <Loader2 size={36} className="spin text-primary" />
              <h4>Analyzing your profile against this opportunity...</h4>
              <p>Evaluating technical skills, experience alignment, and career preferences using Gemini AI.</p>
            </div>
          ) : error ? (
            <div className="ai-error-state-box">
              <AlertCircle size={36} className="text-danger" />
              <h4>Unable to generate explanation</h4>
              <p>Something went wrong while retrieving your AI match insights.</p>
              {onRetry && (
                <button type="button" onClick={onRetry} className="retry-btn">
                  <RefreshCw size={14} /> Try Again
                </button>
              )}
            </div>
          ) : (
            <div className="modal-insights-content">

              {/* Match Score Summary Bar */}
              <div className="modal-score-banner">
                <MatchScore score={score} matchLevel={matchLevel} size="large" />
                {recStatement && <p className="banner-rec-text">{recStatement}</p>}
              </div>

              {/* Executive Summary Box */}
              {summary && (
                <div className="insight-section-box">
                  <div className="section-box-title">
                    <Sparkles size={16} className="text-indigo" />
                    <strong>Executive Summary</strong>
                  </div>
                  <p className="summary-p">{summary}</p>
                </div>
              )}

              {/* Why You Match / Strengths */}
              {whyYouMatch.length > 0 && (
                <div className="insight-section-box">
                  <div className="section-box-title">
                    <CheckCircle2 size={16} className="text-emerald" />
                    <strong>Why You Match / Key Strengths</strong>
                  </div>
                  <ul className="insight-bullets-list">
                    {whyYouMatch.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skill Gaps */}
              {skillGaps.length > 0 && (
                <div className="insight-section-box">
                  <div className="section-box-title">
                    <AlertTriangle size={16} className="text-amber" />
                    <strong>Skill Gaps & Areas to Highlight</strong>
                  </div>
                  <ul className="insight-bullets-list gap-bullets">
                    {skillGaps.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Interview Preparation Tips */}
              {interviewTips.length > 0 && (
                <div className="insight-section-box">
                  <div className="section-box-title">
                    <Lightbulb size={16} className="text-amber" />
                    <strong>Interview Preparation Tips</strong>
                  </div>
                  <ul className="insight-bullets-list">
                    {interviewTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="secondary-action-btn" onClick={onClose}>
            Close
          </button>

          {opp.applicationUrl && (
            <button
              type="button"
              className="save-profile-btn"
              onClick={() => {
                window.open(opp.applicationUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <span>Apply for Opportunity</span>
              <Briefcase size={15} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIExplanationModal;
