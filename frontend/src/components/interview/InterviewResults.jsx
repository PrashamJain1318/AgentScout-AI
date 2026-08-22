import { Trophy, Award, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";

const InterviewResults = ({ results = {}, onRetry, onViewHistory }) => {
  const {
    overallScore = 0,
    readinessScore = 0,
    categoryScores = {},
    strengths = [],
    weaknesses = [],
    recommendations = [],
    interviewType = "Mock Interview",
    difficulty = "Intermediate"
  } = results;

  const {
    technical = 0,
    behavioral = 0,
    communication = 0,
    problemSolving = 0,
    roleKnowledge = 0,
    resumeKnowledge = 0
  } = categoryScores;

  return (
    <div className="resume-section-card readiness-score-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow text-success">MOCK INTERVIEW COMPLETED</span>
          <h2>Final Session Results & Feedback</h2>
        </div>

        <div className="flex-between" style={{ gap: "10px" }}>
          <button type="button" className="secondary-action-btn" onClick={onRetry}>
            <RefreshCw size={14} />
            <span>Practice Another Session</span>
          </button>
          {onViewHistory && (
            <button type="button" className="save-profile-btn" onClick={onViewHistory}>
              <span>View Interview History</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="pipeline-conversion-summary-grid" style={{ marginTop: "16px" }}>
        <div className="summary-metric-item">
          <span className="metric-label">Overall Mock Score</span>
          <strong className="metric-val text-primary" style={{ fontSize: "28px" }}>
            {overallScore}%
          </strong>
        </div>

        <div className="summary-metric-item">
          <span className="metric-label">Interview Readiness</span>
          <strong className="metric-val text-success" style={{ fontSize: "28px" }}>
            {readinessScore}%
          </strong>
        </div>

        <div className="summary-metric-item">
          <span className="metric-label">Interview Type</span>
          <strong className="metric-val" style={{ fontSize: "16px", marginTop: "6px" }}>
            {interviewType} ({difficulty})
          </strong>
        </div>
      </div>

      <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Category Performance Breakdown</h4>
      <div className="readiness-breakdown-grid">
        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Technical Competency</span>
            <strong>{technical}%</strong>
          </div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${technical}%` }} /></div>
        </div>

        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Behavioral (STAR Method)</span>
            <strong>{behavioral}%</strong>
          </div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${behavioral}%` }} /></div>
        </div>

        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Communication Clarity</span>
            <strong>{communication}%</strong>
          </div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${communication}%` }} /></div>
        </div>

        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Problem Solving & Trade-offs</span>
            <strong>{problemSolving}%</strong>
          </div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${problemSolving}%` }} /></div>
        </div>

        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Role Knowledge</span>
            <strong>{roleKnowledge}%</strong>
          </div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${roleKnowledge}%` }} /></div>
        </div>
      </div>

      <div className="form-row-2col" style={{ marginTop: "20px" }}>
        <div className="suggestion-item-card">
          <h5 style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px 0" }}>
            <CheckCircle2 size={16} /> Key Performance Strengths
          </h5>
          <ul className="entry-achievements-list">
            {strengths.map((str, idx) => (
              <li key={idx}>{typeof str === "object" ? str.title || str.name || "" : String(str)}</li>
            ))}
          </ul>
        </div>

        <div className="suggestion-item-card">
          <h5 style={{ color: "var(--warning)", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px 0" }}>
            <AlertTriangle size={16} /> Focus Areas to Improve
          </h5>
          <ul className="entry-achievements-list">
            {weaknesses.map((wk, idx) => (
              <li key={idx}>{typeof wk === "object" ? wk.title || wk.reason || "" : String(wk)}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <h5 style={{ margin: "0 0 8px 0" }}>Actionable Preparation Recommendations</h5>
        <ul className="entry-achievements-list">
          {recommendations.map((rec, idx) => (
            <li key={idx}>{typeof rec === "object" ? rec.title || rec.recommendation || "" : String(rec)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InterviewResults;
