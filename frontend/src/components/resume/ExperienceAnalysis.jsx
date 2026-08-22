import { Briefcase, Check, AlertCircle } from "lucide-react";

const ExperienceAnalysis = ({ experience = [] }) => {
  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">WORK EXPERIENCE EVIDENCE</span>
          <h3>Extracted Experience Entries</h3>
        </div>
      </div>

      {experience.length === 0 ? (
        <p className="no-data-text">No structured work experience entries extracted from uploaded document.</p>
      ) : (
        <div className="experience-entries-list">
          {experience.map((exp, idx) => (
            <div key={idx} className="experience-entry-card">
              <div className="entry-header flex-between">
                <div>
                  <strong>{exp.role || "Role Title"}</strong>
                  <span className="entry-company"> — {exp.company || "Employer"}</span>
                </div>
                <span className="notif-subtext">{exp.startDate} - {exp.endDate || "Present"}</span>
              </div>

              {exp.description && <p className="entry-description">{exp.description}</p>}

              {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                <ul className="entry-achievements-list">
                  {exp.achievements.map((ach, aIdx) => (
                    <li key={aIdx}>{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceAnalysis;
