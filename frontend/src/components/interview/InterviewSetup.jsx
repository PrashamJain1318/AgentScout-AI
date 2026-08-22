import { useState } from "react";
import { Sparkles, Target, Settings, PlayCircle, Building } from "lucide-react";

const InterviewSetup = ({ opportunities = [], selectedOpp = null, onStart, loading = false }) => {
  const [opportunityId, setOpportunityId] = useState(selectedOpp?._id || selectedOpp?.id || "");
  const [interviewType, setInterviewType] = useState("Mixed Mock Interview");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({
      opportunityId: opportunityId || null,
      interviewType,
      difficulty,
      questionCount: Number(questionCount)
    });
  };

  return (
    <div className="opportunity-selector-card">
      <div className="selector-header flex-between">
        <div className="selector-title">
          <Settings size={18} className="text-primary" />
          <span>Configure Mock Interview Session</span>
        </div>
        <span className="notif-subtext">Personalized AI Session</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="form-group">
          <label htmlFor="target-opp-select">
            <Building size={13} className="inline-icon text-primary" /> Target Opportunity (Optional)
          </label>
          <select
            id="target-opp-select"
            className="form-input selector-dropdown"
            value={opportunityId}
            onChange={(e) => setOpportunityId(e.target.value)}
          >
            <option value="">-- General Software Engineering Mock Interview --</option>
            {opportunities.map((opp) => (
              <option key={opp._id || opp.id} value={opp._id || opp.id}>
                {opp.title} — {opp.company} ({opp.location || "Remote"})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row-3col">
          <div className="form-group">
            <label htmlFor="type-select">Interview Type</label>
            <select
              id="type-select"
              className="form-input"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="Mixed Mock Interview">Mixed Mock Interview</option>
              <option value="Technical">Technical Interview</option>
              <option value="Behavioral">Behavioral (STAR Method)</option>
              <option value="HR">HR & Culture Fit</option>
              <option value="System Design">System Design & Architecture</option>
              <option value="Coding">Live Coding & Logic</option>
              <option value="Project Discussion">Project Deep Dive</option>
              <option value="Resume Deep Dive">Resume Deep Dive</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="diff-select">Difficulty Level</label>
            <select
              id="diff-select"
              className="form-input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Beginner">Beginner (Entry Level)</option>
              <option value="Intermediate">Intermediate (Mid Level)</option>
              <option value="Advanced">Advanced (Senior / Lead)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="count-select">Number of Questions</label>
            <select
              id="count-select"
              className="form-input"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              <option value={5}>5 Questions (Express Mock)</option>
              <option value={10}>10 Questions (Standard Mock)</option>
              <option value={15}>15 Questions (Full Mock)</option>
              <option value={20}>20 Questions (Marathon Mock)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="primary-action-btn"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", padding: "12px 16px", marginTop: "4px" }}
        >
          <PlayCircle size={18} />
          <span>{loading ? "Initializing AI Mock Session..." : "Start AI Mock Interview"}</span>
        </button>
      </form>
    </div>
  );
};

export default InterviewSetup;
