import { Sparkles, Calendar, CheckCircle2 } from "lucide-react";

const OpportunityDigest = ({ digest = {} }) => {
  const { summary = "", topOpportunity = null } = digest;

  if (!summary) return null;

  return (
    <div className="resume-section-card" style={{ background: "#f8fafc", border: "1px solid var(--primary-light)" }}>
      <div className="section-header-flex">
        <div>
          <span className="eyebrow text-primary">DAILY OPPORTUNITY DIGEST</span>
          <h3>Market Scan Summary</h3>
        </div>

        <Calendar size={16} className="text-primary" />
      </div>

      <p className="suggestion-explanation" style={{ fontWeight: 600, fontSize: "14px", marginTop: "8px", lineHeight: "1.5" }}>
        {summary}
      </p>

      {topOpportunity && (
        <div style={{ marginTop: "12px", padding: "12px", background: "#ffffff", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <strong className="text-primary" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={14} /> Top Recommended Opportunity Today:
          </strong>
          <h4 style={{ margin: "4px 0 2px 0", fontSize: "15px" }}>
            {topOpportunity.opportunity?.title} — {topOpportunity.opportunity?.company}
          </h4>
          <span className="impact-badge excellent" style={{ fontSize: "11px" }}>
            {topOpportunity.fit?.score}% EXCELLENT MATCH
          </span>
        </div>
      )}
    </div>
  );
};

export default OpportunityDigest;
