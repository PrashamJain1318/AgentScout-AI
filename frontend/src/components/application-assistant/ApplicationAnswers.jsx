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

    const hasEdits = answers.some((a) => a.isEdited);
    if (hasEdits) {
      const confirmOverwrite = window.confirm(
        "You have manually edited some answers. Generating new answers will overwrite your changes. Do you want to proceed?"
      );
      if (!confirmOverwrite) return;
    }

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
          <div className="card-apply-notice info" style={{ marginBottom: "16px" }}>
            <HelpCircle size={16} />
            <span>AI-generated answers are drafts. Please review and edit before submitting.</span>
          </div>
          {answers.map((item, idx) => (
            <div key={idx} className="suggestion-item-card">
              <div className="suggestion-header-row">
                <h4 className="suggestion-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <HelpCircle size={14} className="text-primary" />
                  <span>{item.question}</span>
                </h4>

                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => handleCopy(item.answer, idx)}
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                >
                  {copiedIdx === idx ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div style={{ marginTop: "12px" }}>
                <textarea
                  className="form-input"
                  style={{ width: "100%", minHeight: "100px", fontFamily: "inherit", lineHeight: "1.5" }}
                  value={item.answer}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[idx].answer = e.target.value;
                    newAnswers[idx].isEdited = true;
                    setAnswers(newAnswers);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationAnswers;
