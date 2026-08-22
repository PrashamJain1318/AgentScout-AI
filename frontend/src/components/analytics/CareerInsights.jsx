import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowUpRight, UserCheck, Target, Briefcase, RefreshCw, Award } from "lucide-react";

const iconComponentMap = {
  UserCheck,
  Target,
  Briefcase,
  RefreshCw,
  Award,
  Sparkles
};

const CareerInsights = ({ insights = [], loading = false }) => {
  const navigate = useNavigate();

  if (loading) return <div className="analytics-section-card skeleton-box">Generating career insights...</div>;

  if (!Array.isArray(insights) || insights.length === 0) {
    return null;
  }

  return (
    <div className="analytics-section-card">
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={20} className="text-primary" />
          <h3>AI Career Intelligence Recommendations</h3>
        </div>
      </div>

      <div className="insights-cards-list" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {insights.map((item, idx) => {
          const IconComp = iconComponentMap[item.icon] || Sparkles;

          return (
            <div key={idx} className="insight-recommendation-item">
              <div className="insight-icon-col">
                <IconComp size={20} className="text-primary" />
              </div>

              <div className="insight-content-col">
                <h5>{item.title}</h5>
                <p>{item.explanation}</p>
              </div>

              {item.cta && item.link && (
                <button
                  type="button"
                  className="secondary-action-btn insight-cta-btn"
                  onClick={() => navigate(item.link)}
                >
                  <span>{item.cta}</span>
                  <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CareerInsights;
