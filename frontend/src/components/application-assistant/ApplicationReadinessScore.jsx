import { Sparkles, Trophy, Target, Award } from "lucide-react";

const ApplicationReadinessScore = ({ readinessScore = 0, breakdown = {} }) => {
  const {
    resumeAlignment = 0,
    skillCoverage = 0,
    experienceAlignment = 0,
    portfolioStrength = 0,
    profileAlignment = 0,
  } = breakdown;

  return (
    <div className="resume-section-card readiness-score-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">APPLICATION READINESS</span>
          <h3>Overall Readiness Intelligence</h3>
        </div>

        <div className="overall-readiness-pill">
          <Sparkles size={16} />
          <span>{readinessScore}% Ready</span>
        </div>
      </div>

      <div className="readiness-breakdown-grid">
        <div className="breakdown-item">
          <div className="breakdown-header">
            <span className="metric-label">Resume Alignment</span>
            <strong style={{ color: "var(--accent-purple)" }}>{resumeAlignment}%</strong>
          </div>
          <div className="hero-progress-track">
            <div className="hero-progress-fill" style={{ width: `${resumeAlignment}%` }} />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span className="metric-label">Skill Coverage</span>
            <strong style={{ color: "var(--accent-purple)" }}>{skillCoverage}%</strong>
          </div>
          <div className="hero-progress-track">
            <div className="hero-progress-fill" style={{ width: `${skillCoverage}%` }} />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span className="metric-label">Experience Alignment</span>
            <strong style={{ color: "var(--accent-purple)" }}>{experienceAlignment}%</strong>
          </div>
          <div className="hero-progress-track">
            <div className="hero-progress-fill" style={{ width: `${experienceAlignment}%` }} />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span className="metric-label">Portfolio Strength</span>
            <strong style={{ color: "var(--accent-purple)" }}>{portfolioStrength}%</strong>
          </div>
          <div className="hero-progress-track">
            <div className="hero-progress-fill" style={{ width: `${portfolioStrength}%` }} />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span className="metric-label">Profile Alignment</span>
            <strong style={{ color: "var(--accent-purple)" }}>{profileAlignment}%</strong>
          </div>
          <div className="hero-progress-track">
            <div className="hero-progress-fill" style={{ width: `${profileAlignment}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReadinessScore;
