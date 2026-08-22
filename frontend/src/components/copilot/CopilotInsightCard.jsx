import { ShieldCheck, Target, Award, ArrowUpRight } from "lucide-react";

const CopilotInsightCard = ({ title, value, subtitle, icon: Icon, badgeText, badgeColor = "primary" }) => {
  return (
    <div className="copilot-insight-card">
      <div className="insight-card-top flex-between">
        <div className="insight-icon-box">
          {Icon ? <Icon size={20} /> : <Target size={20} />}
        </div>
        {badgeText && (
          <span className={`insight-badge badge-${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="insight-body">
        <h3>{value}</h3>
        <h4>{title}</h4>
        {subtitle && <p className="insight-subtext">{subtitle}</p>}
      </div>
    </div>
  );
};

export default CopilotInsightCard;
