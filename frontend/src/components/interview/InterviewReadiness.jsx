import { Brain, Award, Sparkles, CheckCircle2 } from "lucide-react";

const InterviewReadiness = ({ readinessData = {} }) => {
  const {
    readinessScore = 75,
    technicalScore = 75,
    behavioralScore = 80,
    communicationScore = 82,
    problemSolvingScore = 78,
    resumeKnowledgeScore = 80,
    latestScore = 0,
    interviewCount = 0,
    recommendations = []
  } = readinessData;

  const getStatusText = (score) => {
    if (score >= 85) return "Exceptional Interview Readiness";
    if (score >= 75) return "Strong Interview Readiness";
    if (score >= 60) return "Moderate Readiness — Practice Recommended";
    return "Needs Preparation";
  };

  return (
    <div className="resume-section-card readiness-score-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">INTERVIEW READINESS INTELLIGENCE</span>
          <h3>Overall Interview Performance Score</h3>
        </div>

        <div className="overall-readiness-pill">
          <Brain size={16} />
          <span>{readinessScore}% Ready</span>
        </div>
      </div>

      <div className="selected-opp-preview flex-between" style={{ marginTop: "12px" }}>
        <div>
          <strong style={{ fontSize: "14px" }} className="text-primary">
            {getStatusText(readinessScore)}
          </strong>
          <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>
            Based on {interviewCount} completed mock interview session{interviewCount === 1 ? "" : "s"} & profile data.
          </p>
        </div>

        {latestScore > 0 && (
          <div style={{ textAlign: "right" }}>
            <span className="kpi-label">Latest Session</span>
            <strong className="text-success" style={{ display: "block", fontSize: "16px" }}>
              {latestScore}%
            </strong>
          </div>
        )}
      </div>

      <div className="readiness-breakdown-grid" style={{ marginTop: "16px" }}>
        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Technical Proficiency</span>
            <strong>{technicalScore}%</strong>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${technicalScore}%` }} />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Behavioral (STAR Method)</span>
            <strong>{behavioralScore}%</strong>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${behavioralScore}%` }} />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Communication & Clarity</span>
            <strong>{communicationScore}%</strong>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${communicationScore}%` }} />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Problem Solving & Architecture</span>
            <strong>{problemSolvingScore}%</strong>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${problemSolvingScore}%` }} />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="flex-between">
            <span className="metric-label">Resume & Project Knowledge</span>
            <strong>{resumeKnowledgeScore}%</strong>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${resumeKnowledgeScore}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewReadiness;
