import React from "react";
import { Sparkles, MapPin, Building, ArrowRight, ExternalLink } from "lucide-react";
import MotionCard from "../motion/MotionCard";
import MotionButton from "../motion/MotionButton";
import StaggerContainer, { StaggerItem } from "../motion/StaggerContainer";
import AnimatedNumber from "../motion/AnimatedNumber";

const TopOpportunities = ({ recommendations, loading, error, onNavigate }) => {
  const topList = Array.isArray(recommendations) ? recommendations.slice(0, 3) : [];

  return (
    <section className="db-top-opps-section">
      <div className="db-section-header-row">
        <div>
          <h3 className="db-section-title">Top Recommended Opportunities</h3>
          <p className="db-section-subtitle">AI-matched target positions tailored to your profile</p>
        </div>
        <button
          type="button"
          className="db-link-btn"
          onClick={() => onNavigate("/dashboard/opportunities")}
        >
          <span>View All Opportunities</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="db-opps-skeleton-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="db-opp-card-skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="db-opps-error-card">
          <p>{error}</p>
          <MotionButton
            className="db-retry-btn"
            onClick={() => onNavigate("/dashboard/opportunities")}
          >
            Explore Opportunities
          </MotionButton>
        </div>
      ) : topList.length === 0 ? (
        <div className="db-opps-empty-card">
          <Sparkles size={24} className="db-empty-sparkle" />
          <h4>Your opportunity intelligence is getting ready</h4>
          <p>We are matching your resume and profile against active postings.</p>
          <MotionButton
            className="db-empty-action-btn"
            onClick={() => onNavigate("/dashboard/opportunities")}
          >
            Explore All Postings →
          </MotionButton>
        </div>
      ) : (
        <StaggerContainer className="db-opps-cards-grid" staggerDelay={0.06}>
          {topList.map((opp) => {
            const title = opp.title || opp.jobTitle || "Software Engineer";
            const company = opp.company || opp.companyName || "Technology Partner";
            const location = opp.location || opp.workplaceType || "Remote";
            const matchScore = opp.matchScore || opp.score || 88;

            return (
              <StaggerItem key={opp._id || opp.id || title}>
                <MotionCard className="db-opp-item-card">
                  <div className="db-opp-card-header">
                    <div className="db-opp-match-badge">
                      <Sparkles size={12} />
                      <AnimatedNumber value={matchScore} suffix="% Match" duration={600} />
                    </div>
                    <span className="db-opp-location">
                      <MapPin size={12} />
                      {location}
                    </span>
                  </div>

                  <h4 className="db-opp-title">{title}</h4>

                  <div className="db-opp-company">
                    <Building size={13} />
                    <span>{company}</span>
                  </div>

                  <div className="db-opp-card-actions">
                    <MotionButton
                      className="db-opp-btn-secondary"
                      onClick={() => onNavigate(`/dashboard/opportunities`)}
                    >
                      <span>View</span>
                      <ExternalLink size={12} />
                    </MotionButton>
                    <MotionButton
                      className="db-opp-btn-primary"
                      onClick={() => onNavigate("/dashboard/application-assistant")}
                    >
                      <span>Prepare Application</span>
                      <ArrowRight size={12} />
                    </MotionButton>
                  </div>
                </MotionCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </section>
  );
};

export default TopOpportunities;
