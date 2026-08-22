import { Search, MapPin, Sparkles, Building } from "lucide-react";

const OpportunitySelector = ({ opportunities = [], selectedOpportunity, onSelect }) => {
  return (
    <div className="opportunity-selector-card">
      <div className="selector-header flex-between">
        <label htmlFor="opp-select-dropdown" className="selector-title">
          <Building size={16} className="text-primary" />
          <span>Select Target Opportunity</span>
        </label>
        <span className="notif-subtext">{opportunities.length} Available Opportunities</span>
      </div>

      <div className="selector-input-wrapper">
        <select
          id="opp-select-dropdown"
          className="form-input selector-dropdown"
          value={selectedOpportunity?._id || selectedOpportunity?.id || ""}
          onChange={(e) => {
            const chosen = opportunities.find((o) => (o._id || o.id) === e.target.value);
            if (chosen) onSelect(chosen);
          }}
        >
          <option value="" disabled>
            -- Choose an opportunity to prepare application --
          </option>
          {opportunities.map((opp) => (
            <option key={opp._id || opp.id} value={opp._id || opp.id}>
              {opp.title} — {opp.company} ({opp.location || "Remote"})
            </option>
          ))}
        </select>
      </div>

      {selectedOpportunity && (
        <div className="selected-opp-preview flex-between">
          <div className="opp-info-group">
            <strong>{selectedOpportunity.title}</strong>
            <p className="notif-subtext">
              {selectedOpportunity.company} • <MapPin size={12} className="inline-icon" />{" "}
              {selectedOpportunity.location || "Remote"} • {selectedOpportunity.type || "Full-time"}
            </p>
          </div>

          <div className="opp-score-badge flex-between" style={{ gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <span className="kpi-label">Match Score</span>
              <strong className="text-primary" style={{ display: "block", fontSize: "16px" }}>
                {selectedOpportunity.matchScore || selectedOpportunity.score || 75}%
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitySelector;
