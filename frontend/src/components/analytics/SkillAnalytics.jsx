import { useNavigate } from "react-router-dom";
import { Target, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

const SkillAnalytics = ({ data, loading = false, error = null }) => {
  const navigate = useNavigate();

  if (loading) return <div className="analytics-section-card skeleton-box">Loading skill intelligence...</div>;

  if (error) {
    return (
      <div className="analytics-section-card inline-error-state">
        <AlertCircle size={20} />
        <span>Skill analytics currently unavailable.</span>
      </div>
    );
  }

  const skillData = data || {};
  const strengths = skillData.topStrengths || [];
  const gaps = skillData.topSkillGaps || [];

  return (
    <div className="analytics-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">SKILL INTELLIGENCE</span>
          <h3>Technical Skill Matrix & Market Gaps</h3>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={() => navigate("/dashboard/career-copilot")}
        >
          <span>Improve with Career Copilot</span>
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="skills-analytics-grid">

        {/* Strongest Skills Matrix */}
        <div className="skill-matrix-box">
          <h4>
            <CheckCircle2 size={16} className="text-success inline-icon" />
            Top Skill Strengths
          </h4>

          {strengths.length === 0 ? (
            <p className="no-data-text">Add skills to your candidate profile to unlock strength analytics.</p>
          ) : (
            <div className="skills-bars-list">
              {strengths.slice(0, 5).map((item, idx) => (
                <div key={idx} className="skill-bar-item">
                  <div className="skill-name-row">
                    <span className="skill-label-text">{item.skill}</span>
                    <span className="skill-percentage-text">{item.percentage}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill bg-indigo" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High-Demand Missing Skills */}
        <div className="skill-matrix-box">
          <h4>
            <Target size={16} className="text-warning inline-icon" />
            High Demand Missing Skills
          </h4>

          {gaps.length === 0 ? (
            <p className="no-data-text">No significant skill gaps identified across target opportunities.</p>
          ) : (
            <div className="skills-bars-list">
              {gaps.slice(0, 5).map((item, idx) => (
                <div key={idx} className="skill-bar-item">
                  <div className="skill-name-row">
                    <span className="skill-label-text">{item.skill}</span>
                    <span className="skill-percentage-text text-warning">{item.count} opportunities</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill bg-warning" style={{ width: `${Math.min(100, item.count * 20)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SkillAnalytics;
