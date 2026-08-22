import { AlertTriangle, Target } from "lucide-react";

const ApplicationGaps = ({ gaps = [], missingSkills = [] }) => {
  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow font-bold text-warning">GAP ANALYSIS</span>
          <h3>Missing Requirements & Gaps</h3>
        </div>
      </div>

      {gaps.length === 0 && missingSkills.length === 0 ? (
        <p className="no-data-text">No high-priority application gaps detected.</p>
      ) : (
        <div className="suggestions-list-box">
          {missingSkills.length > 0 && (
            <div className="resume-gaps-banner">
              <h5>
                <AlertTriangle size={15} className="inline-icon text-warning" />
                Missing Job Requirements
              </h5>
              <div className="tags-chip-wrapper" style={{ marginTop: "8px" }}>
                {missingSkills.map((s, idx) => (
                  <span key={idx} className="tag-chip warning">
                    + {typeof s === "object" ? s.name || s.title || "" : String(s)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {gaps.map((gap, idx) => (
            <div key={idx} className="suggestion-item-card">
              <p className="suggestion-explanation" style={{ color: "var(--text)" }}>
                {typeof gap === "object" ? gap.title || gap.reason || "" : String(gap)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationGaps;
