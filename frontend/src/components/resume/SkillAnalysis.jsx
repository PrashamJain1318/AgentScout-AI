import { CheckCircle2, Target, Sparkles } from "lucide-react";

const SkillAnalysis = ({ extractedData = {}, scores = {} }) => {
  const detectedSkills = extractedData.skills || [];
  const coverageScore = scores.skillsCoverage || 0;

  // Sample missing skills check based on detected skills
  const targetMarketSkills = ["Docker", "TypeScript", "AWS", "Kubernetes", "GraphQL", "CI/CD"];
  const missingSkills = targetMarketSkills.filter(
    (s) => !detectedSkills.some((ds) => ds.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">SKILL INTELLIGENCE</span>
          <h3>Extracted Skills & Market Coverage</h3>
        </div>

        <span className="stat-pill primary">
          Skills Coverage: <strong>{coverageScore}%</strong>
        </span>
      </div>

      <div className="skills-analysis-grid">
        {/* Detected Skills */}
        <div className="skill-column-card">
          <h4>
            <CheckCircle2 size={16} className="text-success inline-icon" />
            Detected Resume Skills ({detectedSkills.length})
          </h4>

          {detectedSkills.length === 0 ? (
            <p className="no-data-text">No technical skills detected in document text.</p>
          ) : (
            <div className="tags-chip-wrapper">
              {detectedSkills.map((skill, idx) => (
                <span key={idx} className="tag-chip">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* High Demand Missing Skills */}
        <div className="skill-column-card">
          <h4>
            <Target size={16} className="text-warning inline-icon" />
            Suggested Market Skills
          </h4>

          {missingSkills.length === 0 ? (
            <p className="no-data-text">Your resume includes key high-demand technical skills.</p>
          ) : (
            <div className="tags-chip-wrapper">
              {missingSkills.map((skill, idx) => (
                <span key={idx} className="tag-chip warning">
                  + {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillAnalysis;
