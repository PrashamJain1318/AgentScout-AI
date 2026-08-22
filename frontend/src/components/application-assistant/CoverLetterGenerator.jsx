import { useState, useEffect } from "react";
import { FileText, Copy, RefreshCw, Check, Sparkles, AlertCircle } from "lucide-react";
import { generateCoverLetter } from "../../services/applicationAssistant.api";

const CoverLetterGenerator = ({ opportunityId, initialCoverLetter = null }) => {
  const [tone, setTone] = useState(initialCoverLetter?.tone || "Professional");
  const [length, setLength] = useState(initialCoverLetter?.length || "Medium");
  const [content, setContent] = useState(initialCoverLetter?.content || "");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    if (initialCoverLetter?.content) {
      setContent(initialCoverLetter.content);
    }
  }, [initialCoverLetter]);

  const handleGenerate = async () => {
    if (!opportunityId) return;
    setGenerating(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      const res = await generateCoverLetter(opportunityId, { tone, length });
      setContent(res.coverLetter?.content || "");
      setNotice("Tailored cover letter generated successfully.");
    } catch (err) {
      setErrorNotice("Failed to generate cover letter.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">COVER LETTER GENERATOR</span>
          <h3>AI-Tailored Cover Letter</h3>
        </div>

        <div className="flex-between" style={{ gap: "8px" }}>
          {content && (
            <button type="button" className="secondary-action-btn" onClick={handleCopy}>
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Cover Letter"}</span>
            </button>
          )}

          <button
            type="button"
            className="save-profile-btn"
            onClick={handleGenerate}
            disabled={generating || !opportunityId}
          >
            <Sparkles size={14} />
            <span>{generating ? "Generating..." : content ? "Regenerate Cover Letter" : "Generate Cover Letter"}</span>
          </button>
        </div>
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

      <div className="form-row-2col">
        <div className="form-group">
          <label htmlFor="tone-select">Tone Style</label>
          <select id="tone-select" className="form-input" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="Professional">Professional</option>
            <option value="Confident">Confident</option>
            <option value="Concise">Concise</option>
            <option value="Enthusiastic">Enthusiastic</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="length-select">Cover Letter Length</label>
          <select id="length-select" className="form-input" value={length} onChange={(e) => setLength(e.target.value)}>
            <option value="Short">Short (Concise)</option>
            <option value="Medium">Medium (Standard)</option>
            <option value="Detailed">Detailed (In-depth)</option>
          </select>
        </div>
      </div>

      <div className="cover-letter-preview-box">
        {generating ? (
          <div className="skeleton-box" style={{ padding: "40px" }}>
            Writing company-specific cover letter using actual candidate experience...
          </div>
        ) : content ? (
          <textarea
            className="form-input"
            style={{ width: "100%", minHeight: "220px", fontFamily: "inherit", lineHeight: "1.6" }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <p className="no-data-text" style={{ padding: "20px 0" }}>
            No cover letter generated yet. Select tone and click "Generate Cover Letter".
          </p>
        )}
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
