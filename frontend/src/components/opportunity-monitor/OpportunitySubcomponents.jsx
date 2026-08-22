import { Sparkles, Award } from "lucide-react";

export const OpportunityScore = ({ score = 0, category = "MODERATE" }) => {
  const getBadgeClass = (cat) => {
    if (cat === "EXCELLENT") return "excellent";
    if (cat === "STRONG") return "high";
    if (cat === "MODERATE") return "medium";
    return "low";
  };

  return (
    <div className="flex-between" style={{ gap: "8px" }}>
      <Sparkles size={16} className="text-primary" />
      <strong style={{ fontSize: "16px" }}>{score}% Match</strong>
      <span className={`impact-badge ${getBadgeClass(category)}`}>
        {category}
      </span>
    </div>
  );
};

export const OpportunityReasoning = ({ reasons = [], aiExplanation = "" }) => {
  return (
    <div className="suggestion-explanation" style={{ fontSize: "13px", marginTop: "8px" }}>
      <p style={{ margin: "0 0 6px 0", lineHeight: "1.4" }}>
        {aiExplanation || (reasons.length > 0 ? reasons[0] : "Matches candidate target role profile.")}
      </p>
    </div>
  );
};

export const OpportunityReadiness = ({ readinessScore = 0 }) => {
  return (
    <div className="flex-between" style={{ fontSize: "12px", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px" }}>
      <span>Resume Readiness</span>
      <strong className={readinessScore >= 70 ? "text-success" : "text-primary"}>
        {readinessScore}% Ready
      </strong>
    </div>
  );
};

export const NewOpportunityBadge = () => {
  return (
    <span className="impact-badge excellent" style={{ fontSize: "10px", padding: "2px 6px" }}>
      NEW
    </span>
  );
};
