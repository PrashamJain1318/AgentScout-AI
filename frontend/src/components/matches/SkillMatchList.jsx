import { CheckCircle2, AlertCircle } from "lucide-react";

const SkillMatchList = ({ matchedSkills = [], missingSkills = [] }) => {
  const hasMatched = Array.isArray(matchedSkills) && matchedSkills.length > 0;
  const hasMissing = Array.isArray(missingSkills) && missingSkills.length > 0;

  if (!hasMatched && !hasMissing) return null;

  return (
    <div className="skill-match-list-container">
      {/* Matched Skills List */}
      {hasMatched && (
        <div className="skill-group matched-group">
          <span className="group-label">
            <CheckCircle2 size={13} className="text-success" /> Matched Skills ({matchedSkills.length})
          </span>
          <div className="skills-wrap">
            {matchedSkills.map((skill, idx) => (
              <span key={idx} className="skill-chip matched-chip">
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills List */}
      {hasMissing && (
        <div className="skill-group missing-group">
          <span className="group-label">
            <AlertCircle size={13} className="text-warning" /> Missing Skills ({missingSkills.length})
          </span>
          <div className="skills-wrap">
            {missingSkills.map((skill, idx) => (
              <span key={idx} className="skill-chip missing-chip">
                ○ {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillMatchList;
