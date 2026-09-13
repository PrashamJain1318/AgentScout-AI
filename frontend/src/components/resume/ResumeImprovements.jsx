import { Sparkles, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

const ResumeImprovements = ({ suggestions = [], gaps = [] }) => {
  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">AI AUDIT RECOMMENDATIONS</span>
          <h3>ATS & Content Improvements</h3>
        </div>
      </div>

      {gaps.length > 0 && (
        <div className="resume-gaps-banner">
          <h5>
            <AlertTriangle size={16} className="inline-icon text-warning" />
            Detected Resume Gaps
          </h5>
          <ul>
            {gaps.map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length === 0 ? (
        <div className="empty-state-box">
          <CheckCircle size={32} className="empty-icon text-success" />
          <h4>Excellent Resume Structure</h4>
          <p>No high-priority ATS warnings or missing sections identified.</p>
        </div>
      ) : (
        <div className="suggestions-list-box">
          {suggestions.map((item, idx) => (
            <div key={idx} className="suggestion-item-card">
              <div className="suggestion-header-row">
                <h4 className="suggestion-title">{item.title}</h4>
                <span className={`impact-badge ${item.impactLevel || "medium"}`}>
                  {item.impactLevel?.toUpperCase() || "MEDIUM"} IMPACT
                </span>
              </div>

              <div style={{ marginTop: "8px" }}>
                <p className="suggestion-explanation" style={{ fontWeight: 600, color: "var(--text)" }}>Problem:</p>
                <p className="suggestion-explanation">{item.explanation || "Area for improvement identified in your resume structure."}</p>
              </div>

              <div style={{ marginTop: "4px" }}>
                <p className="suggestion-explanation" style={{ fontWeight: 600, color: "var(--text)" }}>Why it matters:</p>
                <p className="suggestion-explanation">{item.whyItMatters || "Recruiters and ATS systems look for this to evaluate your fit."}</p>
              </div>

              <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                <button type="button" className="secondary-action-btn" style={{ fontSize: "12px", padding: "6px 12px" }}>
                  <span>{item.recommendedAction || "Improve Section"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeImprovements;
