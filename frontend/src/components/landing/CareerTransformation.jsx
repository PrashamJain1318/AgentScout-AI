import React from "react";
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const beforeList = [
  "Confused by hundreds of open postings",
  "Sending identical un-tailored resumes",
  "Tracking applications on manual spreadsheets",
  "Unsure why recruiters don't respond",
  "Preparing for interviews blindly without feedback",
];

const afterList = [
  "Focused daily action plan & AI Career Agent guidance",
  "ATS-audited resume & tailored cover letters",
  "Automated application pipeline tracking",
  "Clear match compatibility & missing skill insights",
  "AI Interview Coach mock practice with score breakdown",
];

const CareerTransformation = () => {
  const navigate = useNavigate();

  return (
    <section className="transformation-section">
      <div className="section-header-center">
        <div className="section-kicker-badge">
          <span>THE AGENTSCOUT TRANSFORMATION</span>
        </div>
        <h2 className="section-main-heading">
          Transform How You Navigate Your Career
        </h2>
        <p className="section-main-subtext">
          Move from fragmented manual job searching to an AI-powered career operating system.
        </p>
      </div>

      <div className="transformation-cards-container">
        {/* Before Card */}
        <div className="transformation-card card-before">
          <div className="transformation-card-header">
            <span className="transform-emoji">😵</span>
            <div>
              <span className="transform-kicker text-muted">BEFORE AGENTSCOUT-AI</span>
              <h3 className="transform-title">Fragmented & Overwhelmed</h3>
            </div>
          </div>

          <ul className="transform-list">
            {beforeList.map((item, idx) => (
              <li key={idx} className="transform-item item-before">
                <XCircle size={16} className="text-danger flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Transition Divider Arrow */}
        <div className="transform-arrow-divider">
          <ArrowRight size={24} />
        </div>

        {/* After Card */}
        <div className="transformation-card card-after">
          <div className="transformation-card-header">
            <span className="transform-emoji">🚀</span>
            <div>
              <span className="transform-kicker text-purple">AFTER AGENTSCOUT-AI</span>
              <h3 className="transform-title">Focused & AI-Powered</h3>
            </div>
          </div>

          <ul className="transform-list">
            {afterList.map((item, idx) => (
              <li key={idx} className="transform-item item-after">
                <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="transform-action-btn"
            onClick={() => navigate("/signup")}
          >
            <span>Upgrade Your Career Journey</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CareerTransformation;
