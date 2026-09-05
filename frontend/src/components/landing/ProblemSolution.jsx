import React from "react";
import { XCircle, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

const traditionalPoints = [
  "Search hundreds of job boards manually",
  "Apply blindly with static un-optimized resumes",
  "Track status across messy manual spreadsheets",
  "Guess why recruiters never respond or reject",
  "Prepare for interviews alone without feedback",
];

const agentScoutPoints = [
  "AI Opportunity Monitor tracks matched roles 24/7",
  "Resume Intelligence audits ATS compatibility & missing skills",
  "AI Application Assistant tailors cover letters & answers",
  "Interview Coach conducts realistic mock sessions with scoring",
  "AI Career Agent recommends Your Next Best Action automatically",
];

const ProblemSolution = () => {
  return (
    <section className="problem-solution-section" id="problem">
      <div className="section-header-center">
        <div className="section-kicker-badge">
          <AlertTriangle size={13} />
          <span>THE FRAGMENTED CAREER PROCESS</span>
        </div>
        <h2 className="section-main-heading">
          Job Searching Shouldn't Feel Like Guesswork.
        </h2>
        <p className="section-main-subtext">
          Traditional job portals leave candidates searching in the dark. AgentScout-AI unifies your career journey into a single intelligent system.
        </p>
      </div>

      <div className="comparison-grid">
        {/* Left: Traditional Card */}
        <div className="comparison-card traditional-card">
          <div className="card-header-row">
            <div className="card-header-icon red-icon">
              <XCircle size={20} />
            </div>
            <div>
              <span className="card-kicker text-danger">TRADITIONAL METHOD</span>
              <h3 className="card-heading">Fragmented & Manual Search</h3>
            </div>
          </div>

          <ul className="comparison-list">
            {traditionalPoints.map((item, idx) => (
              <li key={idx} className="comparison-item traditional-item">
                <span className="bullet-icon cross">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: AgentScout Card */}
        <div className="comparison-card agentscout-card">
          <div className="card-header-row">
            <div className="card-header-icon purple-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="card-kicker text-purple">AGENTSCOUT-AI METHOD</span>
              <h3 className="card-heading">AI Career Operating System</h3>
            </div>
          </div>

          <ul className="comparison-list">
            {agentScoutPoints.map((item, idx) => (
              <li key={idx} className="comparison-item agentscout-item">
                <CheckCircle2 size={16} className="bullet-icon check" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
