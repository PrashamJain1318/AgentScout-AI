import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

const MatchExplanation = ({ explanation = null, reasons = [], recommendation = "" }) => {
  const summaryText = explanation?.summary || recommendation || "Your technical skills and work preferences strongly align with this opportunity.";
  const whyMatches = explanation?.whyYouMatch || reasons || [];
  const skillGaps = explanation?.skillGaps || [];
  const recTips = explanation?.interviewTips || explanation?.recommendation ? [explanation.recommendation] : [];

  return (
    <div className="match-explanation-box">
      {/* Overview Header */}
      <div className="explanation-header">
        <Sparkles size={18} className="sparkle-icon" />
        <h4>Why You Match This Role</h4>
      </div>

      <p className="summary-paragraph">{summaryText}</p>

      {/* Strong Matches List */}
      {whyMatches.length > 0 && (
        <div className="explanation-section">
          <h5><CheckCircle2 size={15} className="text-emerald" /> Strong Alignments</h5>
          <ul className="explanation-bullet-list">
            {whyMatches.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skill Gaps List */}
      {skillGaps.length > 0 && (
        <div className="explanation-section">
          <h5><AlertTriangle size={15} className="text-amber" /> Skill Gaps to Address</h5>
          <ul className="explanation-bullet-list">
            {skillGaps.map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Improvements */}
      {recTips.length > 0 && (
        <div className="explanation-section">
          <h5><Lightbulb size={15} className="text-indigo" /> AI Recommendation</h5>
          <ul className="explanation-bullet-list">
            {recTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MatchExplanation;
