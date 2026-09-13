import { CheckCircle2, Award } from "lucide-react";

const ApplicationStrengths = ({ strengths = [] }) => {
  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow font-bold text-success">CANDIDATE ADVANTAGES</span>
          <h3>Matching Application Strengths</h3>
        </div>
      </div>

      {strengths.length === 0 ? (
        <p className="no-data-text">Complete your candidate profile and upload a resume to identify key application strengths.</p>
      ) : (
        <div className="suggestions-list-box">
          {strengths.map((str, idx) => (
            <div key={idx} className="suggestion-item-card" style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}>
              <div className="file-icon-box" style={{ width: "32px", height: "32px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                <CheckCircle2 size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "14px", color: "var(--text)" }}>
                  {typeof str === "object" ? str.title || str.name || "" : String(str)}
                </strong>
                {typeof str === "object" && str.explanation && (
                  <p className="suggestion-explanation" style={{ marginTop: "4px" }}>{str.explanation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationStrengths;
