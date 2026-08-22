import { useState, useEffect } from "react";
import { HelpCircle, Sparkles, Copy, Check, AlertCircle } from "lucide-react";
import { generateApplicationAnswers } from "../../services/applicationAssistant.api";

const ApplicationAnswers = ({ opportunityId, initialAnswers = [] }) => {
  const [answers, setAnswers] = useState(initialAnswers);
  const [generating, setGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    if (Array.isArray(initialAnswers) && initialAnswers.length > 0) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);

  const handleGenerate = async () => {
    if (!opportunityId) return;
    setGenerating(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      const res = await generateApplicationAnswers(opportunityId);
      setAnswers(res.applicationAnswers || []);
      setNotice("Application question answers generated.");
    } catch (err) {
      setErrorNotice("Failed to generate application answers.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">APPLICATION QUESTIONS</span>
          <h3>Job-Specific Application Answers</h3>
        </div>

        <button
          type="button"
          className="save-profile-btn"
          onClick={handleGenerate}
          disabled={generating || !opportunityId}
        >
          <Sparkles size={14} />
          <span>{generating ? "Generating Answers..." : answers.length > 0 ? "Regenerate Answers" : "Generate Answers"}</span>
        </button>
      </div>

      {notice && (
        <div className="card-apply-notice success" style={{ margin: 0 }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="card-apply-notice danger" style={{ margin: 0 }}>
          <AlertCircle size={16} />
          <span>{errorNotice}</span>
        </div>
      )}

      {generating ? (
        <div className="skeleton-box" style={{ padding: "30px" }}>
          Generating custom interview & application question responses...
        </div>
      ) : answers.length === 0 ? (
        <p className="no-data-text">No application answers generated yet. Click "Generate Answers" above.</p>
      ) : (
        <div className="suggestions-list-box">
          {answers.map((item, idx) => (
            <div key={idx} className="suggestion-item-card">
              <div className="suggestion-header flex-between">
                <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <HelpCircle size={14} className="text-primary" />
                  <span>{item.question}</span>
                </strong>

                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => handleCopy(item.answer, idx)}
                  style={{ padding: "4px 8px" }}
                >
                  {copiedIdx === idx ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <p className="suggestion-explanation" style={{ color: "var(--text)", marginTop: "6px" }}>
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationAnswers;
