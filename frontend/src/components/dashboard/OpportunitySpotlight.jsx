import React from "react";
import { Flame, MapPin, Sparkles, ArrowRight, Building2 } from "lucide-react";

const OpportunitySpotlight = ({ recommendations, loading, error, onNavigate }) => {
  const displayOpps = Array.isArray(recommendations) ? recommendations.slice(0, 3) : [];

  return (
    <section className="dashboard-section-card">
      <div className="section-title-header">
        <div className="section-title-group">
          <Flame size={18} className="section-title-icon text-flame" />
          <h3 className="section-heading">Top Opportunities For You</h3>
        </div>

        <button
          type="button"
          className="section-view-all-btn"
          onClick={() => onNavigate("/opportunities")}
        >
          <span>Explore All Opportunities</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="spotlight-skeleton-list">
          <div className="spotlight-skeleton-item" />
          <div className="spotlight-skeleton-item" />
          <div className="spotlight-skeleton-item" />
        </div>
      ) : error ? (
        <div className="dashboard-error-state">
          <span>{error}</span>
          <button type="button" onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : displayOpps.length === 0 ? (
        <div className="dashboard-empty-state">
          <Sparkles size={28} className="empty-icon" />
          <p className="empty-text">Your AI Agent is scanning active market sources for your top matches.</p>
          <button
            type="button"
            className="empty-cta-btn"
            onClick={() => onNavigate("/opportunities")}
          >
            Explore Opportunities
          </button>
        </div>
      ) : (
        <div className="spotlight-grid">
          {displayOpps.map((opp) => {
            const matchScore = opp.matchScore || opp.score || 88;
            const company = opp.company || opp.companyName || "Top Tech Company";
            const title = opp.title || opp.role || "Senior Software Engineer";
            const location = opp.location || opp.workplaceType || "Remote";
            const oppId = opp._id || opp.id;

            return (
              <div key={oppId} className="spotlight-card">
                <div className="spotlight-card-header">
                  <div className="spotlight-company-info">
                    <div className="spotlight-company-logo">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h4 className="spotlight-role-title">{title}</h4>
                      <span className="spotlight-company-name">{company}</span>
                    </div>
                  </div>

                  <div className="spotlight-match-badge">
                    <Sparkles size={11} />
                    <span>{matchScore}% Match</span>
                  </div>
                </div>

                <div className="spotlight-card-footer">
                  <span className="spotlight-location">
                    <MapPin size={12} />
                    {location}
                  </span>

                  <button
                    type="button"
                    className="spotlight-action-btn"
                    onClick={() => onNavigate(oppId ? `/opportunities/${oppId}` : "/opportunities")}
                  >
                    <span>View Opportunity</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OpportunitySpotlight;
