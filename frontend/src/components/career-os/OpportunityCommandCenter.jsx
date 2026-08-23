import { useNavigate } from "react-router-dom";
import { Sparkles, MapPin, ExternalLink, ArrowRight, CheckSquare, Brain } from "lucide-react";

const OpportunityCommandCenter = ({ opportunities = [] }) => {
  const navigate = useNavigate();

  if (opportunities.length === 0) {
    return (
      <div className="resume-section-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">OPPORTUNITY COMMAND CENTER</span>
            <h3>Top Recommended Opportunities</h3>
          </div>
        </div>
        <p className="no-data-text">No opportunities detected yet. Complete profile skills to unlock AI opportunity recommendations.</p>
      </div>
    );
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">OPPORTUNITY COMMAND CENTER</span>
          <h3>Top Prioritized Target Roles ({opportunities.length})</h3>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={() => navigate("/dashboard/opportunity-monitor")}
        >
          <span>View All Monitored Opportunities</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
        {opportunities.slice(0, 4).map((opp) => {
          const matchScore = opp.matchScore || opp.score || 85;
          return (
            <div key={opp._id || opp.id} className="suggestion-item-card flex-between" style={{ padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="company-logo-placeholder font-bold" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
                  {opp.company ? opp.company.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <strong style={{ fontSize: "15px" }}>{opp.title}</strong>
                  <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>
                    {opp.company} • <MapPin size={11} className="inline-icon" /> {opp.location || "Remote"}
                  </p>
                </div>
              </div>

              <div className="flex-between" style={{ gap: "12px" }}>
                <span className="impact-badge excellent" style={{ fontSize: "11px" }}>
                  <Sparkles size={11} /> {matchScore}% MATCH
                </span>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    className="secondary-action-btn"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                    onClick={() => navigate(`/dashboard/application-assistant?opportunity=${opp._id || opp.id}`)}
                  >
                    <CheckSquare size={11} /> Prepare
                  </button>

                  <button
                    type="button"
                    className="secondary-action-btn"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                    onClick={() => navigate(`/dashboard/interview-coach`)}
                  >
                    <Brain size={11} /> Practice
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpportunityCommandCenter;
