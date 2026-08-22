import { FileText, ArrowRight } from "lucide-react";

const ResumeTailoring = ({ recommendations = [] }) => {
  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">RESUME ALIGNMENT</span>
          <h3>Tailored Resume Recommendations</h3>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <p className="no-data-text">Your resume is well-aligned with this opportunity.</p>
      ) : (
        <div className="suggestions-list-box">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="suggestion-item-card">
              <div className="suggestion-header flex-between">
                <strong>{rec.type || "Tailoring Step"}</strong>
                <span className={`impact-badge ${rec.priority || "medium"}`}>
                  {(rec.priority || "MEDIUM").toUpperCase()} PRIORITY
                </span>
              </div>

              <p className="suggestion-explanation" style={{ fontWeight: 600 }}>{rec.reason}</p>

              <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", marginTop: "4px" }}>
                <strong>Suggested Action:</strong> {rec.suggestedAction}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeTailoring;
