import { AlertCircle, ArrowUpRight } from "lucide-react";

const SkillGapCard = ({ skillGaps = [] }) => {
  if (!Array.isArray(skillGaps) || skillGaps.length === 0) {
    return (
      <div className="skill-gap-card">
        <h4>Skill Gap Analysis</h4>
        <p className="no-gaps-text">No major skill gaps identified across target opportunities.</p>
      </div>
    );
  }

  return (
    <div className="skill-gap-card">
      <div className="card-header-title">
        <AlertCircle size={18} className="text-warning" />
        <h4>Skill Gap Analysis</h4>
      </div>

      <div className="skill-gaps-list">
        {skillGaps.map((item, idx) => (
          <div key={idx} className="skill-gap-item">
            <div className="gap-header">
              <span className="gap-skill-name">{item.skill}</span>
              <span className={`importance-badge ${item.importance === "high" ? "high" : "med"}`}>
                {item.importance} priority
              </span>
            </div>

            <p className="gap-reason-text">{item.reason}</p>

            {Array.isArray(item.relatedRoles) && item.relatedRoles.length > 0 && (
              <div className="related-roles-row">
                <span className="roles-label">Required by:</span>
                {item.relatedRoles.slice(0, 2).map((role, rIdx) => (
                  <span key={rIdx} className="role-tag">{role}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillGapCard;
