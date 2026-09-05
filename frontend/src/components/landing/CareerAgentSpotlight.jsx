import React from "react";
import { Bot, ArrowRight, Sparkles, CheckCircle2, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const inputs = [
  "Resume & ATS Audit",
  "Candidate Core Skills",
  "Target Opportunities",
  "Application History",
  "Interview Scores",
  "Career Goals & Preferences",
];

const CareerAgentSpotlight = () => {
  const navigate = useNavigate();

  return (
    <section className="agent-spotlight-section" id="agent-spotlight">
      <div className="agent-spotlight-card-container">
        <div className="spotlight-left-content">
          <div className="spotlight-badge">
            <Bot size={14} />
            <span>MAJOR PRODUCT DIFFERENTIATOR</span>
          </div>

          <h2 className="spotlight-heading">
            Meet Your AI Career Agent 🤖
          </h2>

          <p className="spotlight-text">
            The AI Career Agent acts as your personal career decision engine. It connects information from across your entire career journey—resume, skills, matched roles, application readiness, and mock interview scores—to tell you exactly what action to take next.
          </p>

          <div className="spotlight-inputs-grid">
            {inputs.map((input, idx) => (
              <div key={idx} className="spotlight-input-chip">
                <CheckCircle2 size={13} className="chip-check-icon" />
                <span>{input}</span>
              </div>
            ))}
          </div>

          <div className="spotlight-cta-row">
            <button
              type="button"
              className="spotlight-primary-cta"
              onClick={() => navigate("/signup")}
            >
              <span>Meet Your AI Career Agent</span>
              <ArrowRight size={16} />
            </button>

            <div className="spotlight-safety-note">
              <Shield size={14} />
              <span>Strict Human Approval Boundaries</span>
            </div>
          </div>
        </div>

        {/* Right Flow Visualization */}
        <div className="spotlight-flow-visual">
          <div className="flow-step-card step-readiness">
            <span className="flow-kicker">STEP 1 — CAREER TELEMETRY</span>
            <div className="flow-card-row">
              <span className="flow-title">Career Readiness</span>
              <strong className="flow-value-highlight">72%</strong>
            </div>
            <div className="flow-mini-progress">
              <div className="flow-fill" style={{ width: "72%" }} />
            </div>
          </div>

          <div className="flow-arrow-down">
            <Sparkles size={16} />
            <span>AI REASONING ENGINE</span>
          </div>

          <div className="flow-step-card step-action">
            <span className="flow-kicker">STEP 2 — NEXT BEST ACTION</span>
            <h4 className="flow-action-title">🎯 Optimize Resume ATS Score</h4>
            <p className="flow-action-desc">
              Your ATS score is below 80% for target Senior Frontend Developer roles.
            </p>

            <div className="flow-action-meta">
              <span className="impact-badge-high">
                <Zap size={11} /> High Impact
              </span>
              <span className="time-meta">~15 min</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerAgentSpotlight;
