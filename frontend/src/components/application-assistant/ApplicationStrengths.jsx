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
        <ul className="entry-achievements-list">
          {strengths.map((str, idx) => (
            <li key={idx} style={{ marginBottom: "8px" }}>
              <CheckCircle2 size={14} className="inline-icon text-success" />
              <span>{typeof str === "object" ? str.title || str.name || "" : String(str)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApplicationStrengths;
