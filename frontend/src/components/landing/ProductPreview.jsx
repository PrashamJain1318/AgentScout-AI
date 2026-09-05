import React from "react";
import { Sparkles, Target, Building2, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductPreview = () => {
  const navigate = useNavigate();

  return (
    <section className="product-preview-section" id="preview">
      <div className="section-header-center">
        <div className="section-kicker-badge">
          <Sparkles size={13} />
          <span>INTERACTIVE PRODUCT PREVIEW</span>
        </div>
        <h2 className="section-main-heading">
          Built For Modern Tech Candidates
        </h2>
        <p className="section-main-subtext">
          Experience how AgentScout-AI presents your career operating status, top opportunity matches, and prioritized next actions.
        </p>
      </div>

      <div className="mock-dashboard-frame">
        {/* Mock Topbar Header */}
        <div className="mock-frame-topbar">
          <div className="mock-traffic-lights">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>

          <div className="mock-topbar-address">
            <span>agentscout-ai.com/dashboard</span>
          </div>

          <div className="mock-topbar-user">
            <span className="mock-avatar">P</span>
            <span className="mock-name">Prasham J.</span>
          </div>
        </div>

        {/* Mock Content Body */}
        <div className="mock-frame-body">
          {/* Mock Hero Greeting */}
          <div className="mock-hero-banner">
            <div>
              <span className="mock-eyebrow">CAREER COMMAND CENTER</span>
              <h3 className="mock-banner-heading">Good morning, Prasham 👋</h3>
              <p className="mock-banner-text">
                Your AI Career Agent has analyzed your progress and updated your action priority.
              </p>
            </div>
            <div className="mock-readiness-widget">
              <div className="mock-rw-header">
                <span>Career Readiness</span>
                <strong>72%</strong>
              </div>
              <div className="mock-rw-bar">
                <div className="mock-rw-fill" style={{ width: "72%" }} />
              </div>
            </div>
          </div>

          {/* Mock Next Best Action Card */}
          <div className="mock-next-action-card">
            <div className="mock-na-header">
              <div className="mock-na-title">
                <Target size={18} className="text-purple" />
                <div>
                  <span className="mock-na-kicker">YOUR NEXT BEST ACTION</span>
                  <h4 className="mock-na-heading">🎯 Optimize Resume ATS Score</h4>
                </div>
              </div>
              <span className="mock-priority-badge">High Priority · 15 min</span>
            </div>
            <p className="mock-na-desc">
              Your ATS match score is 68%, below the 80% threshold for target Senior Frontend Developer positions.
            </p>
            <div className="mock-na-footer">
              <span className="mock-impact">Why this matters: Boosts callback rate by 3.4x</span>
              <button
                type="button"
                className="mock-cta-btn"
                onClick={() => navigate("/signup")}
              >
                <span>Take Action</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Mock Metrics & Opportunity Cards */}
          <div className="mock-grid-2col">
            <div className="mock-card">
              <div className="mock-card-header">
                <Building2 size={16} className="text-cyan" />
                <span className="mock-card-title">Top Opportunity Match</span>
              </div>
              <div className="mock-opp-row">
                <div>
                  <h5 className="mock-opp-role">Senior Frontend Engineer</h5>
                  <span className="mock-opp-company">Google · Remote</span>
                </div>
                <span className="mock-match-tag">92% Match</span>
              </div>
            </div>

            <div className="mock-card">
              <div className="mock-card-header">
                <Award size={16} className="text-emerald" />
                <span className="mock-card-title">Interview Readiness</span>
              </div>
              <div className="mock-readiness-score-row">
                <strong className="mock-large-score">78%</strong>
                <div className="mock-readiness-bars">
                  <span className="mr-label">Technical Prep: 82%</span>
                  <span className="mr-label">Behavioral Prep: 75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPreview;
