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
              <div className="suggestion-header flex-between">
                <strong>{item.title}</strong>
                <span className={`impact-badge ${item.impactLevel || "medium"}`}>
                  {item.impactLevel?.toUpperCase() || "MEDIUM"} IMPACT
                </span>
              </div>

              <p className="suggestion-explanation">{item.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeImprovements;
