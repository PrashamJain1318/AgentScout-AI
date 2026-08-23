import { useNavigate } from "react-router-dom";
import { BookmarkCheck, Sparkles, Brain, FileText, ArrowRight, CheckCircle2, AlertCircle, Calendar, Trophy } from "lucide-react";

export const ApplicationIntelligence = ({ state = {} }) => {
  const navigate = useNavigate();
  const { total = 0, active = 0, interviews = 0, offers = 0, responseRate = 0 } = state;

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookmarkCheck size={18} className="text-primary" />
          <h4 style={{ margin: 0 }}>Application Pipeline Intelligence</h4>
        </div>
        <button type="button" className="section-link-btn" onClick={() => navigate("/dashboard/applications")}>
          <span>Pipeline →</span>
        </button>
      </div>

      <div className="pipeline-conversion-summary-grid" style={{ marginTop: "12px" }}>
        <div className="summary-metric-item">
          <span className="metric-label">Submitted Applications</span>
          <strong className="metric-val">{total}</strong>
        </div>
        <div className="summary-metric-item">
          <span className="metric-label">Active Screening/Interview</span>
          <strong className="metric-val text-primary">{interviews}</strong>
        </div>
        <div className="summary-metric-item">
          <span className="metric-label">Offers Received</span>
          <strong className="metric-val text-success">{offers}</strong>
        </div>
        <div className="summary-metric-item">
          <span className="metric-label">Response Rate</span>
          <strong className="metric-val">{responseRate}%</strong>
        </div>
      </div>
    </div>
  );
};

export const SkillIntelligence = ({ state = {} }) => {
  const navigate = useNavigate();
  const { strengths = [], criticalGaps = [], coverageScore = 0 } = state;

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} className="text-primary" />
          <h4 style={{ margin: 0 }}>Skill Matrix & Coverage Intelligence</h4>
        </div>
        <button type="button" className="section-link-btn" onClick={() => navigate("/dashboard/career-copilot")}>
          <span>Skill Gap Engine →</span>
        </button>
      </div>

      <div className="flex-between" style={{ fontSize: "12px", margin: "10px 0 4px 0" }}>
        <span>Market Skill Coverage</span>
        <strong className="text-primary">{coverageScore}%</strong>
      </div>
      <div className="progress-bar-bg" style={{ height: "6px" }}>
        <div className="progress-bar-fill" style={{ width: `${coverageScore}%` }} />
      </div>

      <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
        <div style={{ flex: 1 }}>
          <span className="metric-label" style={{ fontSize: "11px" }}>Top Profile Strengths:</span>
          <div className="tags-chip-wrapper" style={{ marginTop: "4px" }}>
            {strengths.slice(0, 3).map((s, idx) => (
              <span key={idx} className="skill-chip matched-chip" style={{ fontSize: "11px" }}>
                <CheckCircle2 size={10} /> {s}
              </span>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <span className="metric-label" style={{ fontSize: "11px" }}>Critical Market Gaps:</span>
          <div className="tags-chip-wrapper" style={{ marginTop: "4px" }}>
            {criticalGaps.slice(0, 3).map((s, idx) => (
              <span key={idx} className="skill-chip missing-chip" style={{ fontSize: "11px" }}>
                + {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const InterviewIntelligence = ({ state = {} }) => {
  const navigate = useNavigate();
  const { readinessScore = 0, latestScore = 0, attempts = 0 } = state;

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Brain size={18} className="text-primary" />
          <h4 style={{ margin: 0 }}>Interview Readiness</h4>
        </div>
        <button type="button" className="section-link-btn" onClick={() => navigate("/dashboard/interview-coach")}>
          <span>Mock Practice →</span>
        </button>
      </div>

      <div className="pipeline-conversion-summary-grid" style={{ marginTop: "12px" }}>
        <div className="summary-metric-item">
          <span className="metric-label">Completed Sessions</span>
          <strong className="metric-val">{attempts}</strong>
        </div>
        <div className="summary-metric-item">
          <span className="metric-label">Latest Mock Score</span>
          <strong className="metric-val">{latestScore}%</strong>
        </div>
        <div className="summary-metric-item">
          <span className="metric-label">Overall Readiness</span>
          <strong className="metric-val text-success">{readinessScore}%</strong>
        </div>
      </div>
    </div>
  );
};

export const ResumeIntelligence = ({ state = {} }) => {
  const navigate = useNavigate();
  const { atsScore = 0, completeness = 0, impact = 0 } = state;

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={18} className="text-primary" />
          <h4 style={{ margin: 0 }}>Resume & ATS Intelligence</h4>
        </div>
        <button type="button" className="section-link-btn" onClick={() => navigate("/dashboard/resume")}>
          <span>Resume Dashboard →</span>
        </button>
      </div>

      <div className="pipeline-conversion-summary-grid" style={{ marginTop: "12px" }}>
        <div className="summary-metric-item">
          <span className="metric-label">ATS Compatibility</span>
          <strong className="metric-val text-success">{atsScore}%</strong>
        </div>
        <div className="summary-metric-item">
          <span className="metric-label">Completeness</span>
          <strong className="metric-val">{completeness}%</strong>
        </div>
        <div className="summary-metric-item">
          <span className="metric-label">Impact Score</span>
          <strong className="metric-val">{impact}%</strong>
        </div>
      </div>
    </div>
  );
};

export const CareerMilestones = ({ milestones = [] }) => {
  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={18} className="text-primary" />
          <h4 style={{ margin: 0 }}>Career Milestones & Trajectory</h4>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
        {milestones.map((m) => (
          <div key={m.id} style={{ fontSize: "12px" }}>
            <div className="flex-between">
              <strong className={m.completed ? "text-success" : ""}>
                {m.completed ? "✓ " : "• "}{m.title}
              </strong>
              <span>{m.current} / {m.target} {m.unit}</span>
            </div>
            <div className="progress-bar-bg" style={{ height: "5px", marginTop: "4px" }}>
              <div className="progress-bar-fill" style={{ width: `${m.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RecentChanges = ({ changes = [] }) => {
  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={18} className="text-primary" />
          <h4 style={{ margin: 0 }}>Recent Activity & Platform Timeline</h4>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
        {changes.slice(0, 4).map((c, idx) => (
          <div key={idx} className="notif-item compact" style={{ padding: "8px 12px" }}>
            <div className="notif-content flex-between">
              <div>
                <strong style={{ fontSize: "13px" }}>{c.title}</strong>
                <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>{c.description}</p>
              </div>
              <span className="notif-subtext" style={{ fontSize: "11px" }}>
                {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CareerOSSkeleton = () => {
  return (
    <div className="skeleton-details-body" style={{ minHeight: "450px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="skeleton-card" style={{ height: "120px" }} />
      <div className="skeleton-card" style={{ height: "80px" }} />
      <div className="skeleton-card" style={{ height: "160px" }} />
      <div className="skeleton-card" style={{ height: "200px" }} />
    </div>
  );
};
