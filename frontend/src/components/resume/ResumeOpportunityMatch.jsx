import { useState, useEffect } from "react";
import { Sparkles, X, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react";
import { matchResumeToOpportunity } from "../../services/resume.api";

const ResumeOpportunityMatch = ({ opportunityId, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    const runMatch = async () => {
      setLoading(true);
      setErrorNotice(null);

      try {
        const res = await matchResumeToOpportunity(opportunityId);
        setAnalysis(res.analysis || null);
      } catch (err) {
        setErrorNotice(err.response?.data?.message || "Failed to analyze resume match against opportunity.");
      } finally {
        setLoading(false);
      }
    };

    if (opportunityId) {
      runMatch();
    }
  }, [opportunityId]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-card" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row flex-between">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={20} className="text-primary" />
            <h4 style={{ margin: 0 }}>Resume vs. Opportunity Analysis</h4>
          </div>
          <button type="button" className="notif-delete-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="skeleton-box" style={{ padding: "40px 20px" }}>
            Analyzing candidate resume fit against position requirements...
          </div>
        ) : errorNotice ? (
          <div className="card-apply-notice danger">
            <AlertCircle size={16} />
            <span>{errorNotice}</span>
          </div>
        ) : analysis ? (
          <div className="match-analysis-content-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="match-score-banner flex-between" style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <div>
                <strong>{analysis.jobTitle}</strong>
                <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>{analysis.company}</p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span className="kpi-label">Resume Match Score</span>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--primary)" }}>
                  {analysis.resumeMatchScore}%
                </div>
              </div>
            </div>

            {/* Matched Skills */}
            <div>
              <h5 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>Matching Skills Covered</h5>
              {analysis.matchedSkills.length === 0 ? (
                <p className="notif-subtext">No explicit skills overlapping with job requirements.</p>
              ) : (
                <div className="tags-chip-wrapper">
                  {analysis.matchedSkills.map((s, idx) => (
                    <span key={idx} className="tag-chip">
                      <CheckCircle size={12} /> {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Keywords */}
            {analysis.missingSkills.length > 0 && (
              <div>
                <h5 style={{ margin: "0 0 8px 0", fontSize: "13px" }} className="text-warning">Missing Job Requirements</h5>
                <div className="tags-chip-wrapper">
                  {analysis.missingSkills.map((s, idx) => (
                    <span key={idx} className="tag-chip warning">
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h5 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>Recommended Resume Adaptations</h5>
                <ul className="entry-achievements-list">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResumeOpportunityMatch;
