import { Sparkles, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

const getMatchLabel = (score) => {
  if (!score || score <= 0) return null;
  if (score >= 90) return { text: `${score}% Excellent Match`, class: "match-excellent" };
  if (score >= 75) return { text: `${score}% Strong Match`, class: "match-strong" };
  if (score >= 60) return { text: `${score}% Good Match`, class: "match-good" };
  return { text: `${score}% Potential Match`, class: "match-potential" };
};

const AIInsightCard = ({ matchData = null, opportunity = null }) => {
  if (!matchData && !opportunity) return null;

  const score = matchData?.score || opportunity?.matchScore || opportunity?.score || 0;
  const matchLabel = getMatchLabel(score);

  const matchedSkills = matchData?.matchedSkills || opportunity?.matchedSkills || [];
  const missingSkills = matchData?.missingSkills || opportunity?.missingSkills || [];
  const reasons = matchData?.reasons || matchData?.explanation?.whyYouMatch || [];
  const summary = matchData?.explanation?.summary || matchData?.recommendation || "";

  return (
    <div className="ai-insight-card">
      <div className="insight-card-header">
        <div className="header-title-group">
          <Sparkles size={18} className="sparkle-active" />
          <h4>Why this opportunity matches you</h4>
        </div>
        {matchLabel && (
          <span className={`match-badge-large ${matchLabel.class}`}>
            {matchLabel.text}
          </span>
        )}
      </div>

      {summary && <p className="insight-summary-text">{summary}</p>}

      {/* Matched Skills */}
      {matchedSkills.length > 0 && (
        <div className="skills-match-block">
          <span className="skills-block-label text-success">
            <CheckCircle2 size={13} /> Matched Skills ({matchedSkills.length})
          </span>
          <div className="skills-chips-wrap">
            {matchedSkills.map((skill, idx) => (
              <span key={idx} className="matched-skill-pill">
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="skills-match-block">
          <span className="skills-block-label text-warning">
            <AlertCircle size={13} /> Missing Skills ({missingSkills.length})
          </span>
          <div className="skills-chips-wrap">
            {missingSkills.map((skill, idx) => (
              <span key={idx} className="missing-skill-pill">
                ○ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Reasons */}
      {reasons.length > 0 && (
        <div className="reasons-block">
          <span className="skills-block-label">
            <Lightbulb size={13} /> Key AI Match Reasons
          </span>
          <ul className="reasons-list">
            {reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIInsightCard;
