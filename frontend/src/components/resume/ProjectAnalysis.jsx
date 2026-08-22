import { Code, ExternalLink } from "lucide-react";

const ProjectAnalysis = ({ projects = [] }) => {
  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">TECHNICAL PROJECTS EVIDENCE</span>
          <h3>Extracted Projects & Code Artifacts</h3>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="no-data-text">No technical projects detected in resume text.</p>
      ) : (
        <div className="projects-entries-list">
          {projects.map((proj, idx) => (
            <div key={idx} className="project-entry-card">
              <div className="entry-header flex-between">
                <strong>{proj.name || `Project #${idx + 1}`}</strong>
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="view-all-link-btn">
                    <span>View Repository</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {proj.description && <p className="entry-description">{proj.description}</p>}

              {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                <div className="tags-chip-wrapper" style={{ marginTop: "8px" }}>
                  {proj.technologies.map((tech, tIdx) => (
                    <span key={tIdx} className="tag-chip">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectAnalysis;
