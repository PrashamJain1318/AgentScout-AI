import { Sparkles } from "lucide-react";

export const getMatchMeta = (score = 0) => {
  const num = Math.max(0, Math.min(100, Number(score) || 0));

  if (num >= 90) {
    return { label: "Excellent Match", badgeClass: "match-excellent", color: "#10b981" };
  }
  if (num >= 75) {
    return { label: "Strong Match", badgeClass: "match-strong", color: "#6366f1" };
  }
  if (num >= 60) {
    return { label: "Moderate Match", badgeClass: "match-good", color: "#f59e0b" };
  }
  return { label: "Low Match", badgeClass: "match-potential", color: "#94a3b8" };
};

const MatchScore = ({ score = 0, size = "normal" }) => {
  const meta = getMatchMeta(score);
  const numScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

  return (
    <div className={`match-score-badge ${meta.badgeClass} ${size}`}>
      <Sparkles size={size === "large" ? 16 : 13} />
      <span className="score-number">{numScore}%</span>
      <span className="score-label">{meta.label}</span>
    </div>
  );
};

export default MatchScore;
