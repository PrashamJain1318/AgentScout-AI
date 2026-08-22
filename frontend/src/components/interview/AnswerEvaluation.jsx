import { Award, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

const AnswerEvaluation = ({ evaluation = {} }) => {
  const {
    score = 0,
    evaluation: summary = "",
    strengths = [],
    weaknesses = [],
    idealAnswer = "",
    improvementTips = []
  } = evaluation;

  return (
    <div className="resume-section-card" style={{ marginTop: "20px", background: "#ffffff", border: "1px solid var(--primary-light)" }}>
      <div className="section-header-flex">
        <div>
          <span className="eyebrow text-primary">AI ANSWER EVALUATION</span>
          <h3>Response Feedback</h3>
        </div>

        <div className="overall-readiness-pill" style={{ background: score >= 7 ? "var(--success)" : "var(--primary)" }}>
          <Award size={16} />
          <span>{score} / 10 Points</span>
        </div>
      </div>

      <p className="suggestion-explanation" style={{ fontWeight: 600, fontSize: "13px", marginTop: "8px" }}>
        {summary}
      </p>

      <div className="form-row-2col" style={{ marginTop: "12px" }}>
        <div>
          <h5 style={{ margin: "0 0 6px 0", color: "var(--success)", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={14} /> Key Strengths
          </h5>
          <ul className="entry-achievements-list">
            {strengths.map((str, idx) => (
              <li key={idx}>{typeof str === "object" ? str.title || str.name || "" : String(str)}</li>
            ))}
          </ul>
        </div>

        <div>
          <h5 style={{ margin: "0 0 6px 0", color: "var(--warning)", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={14} /> Areas for Improvement
          </h5>
          <ul className="entry-achievements-list">
            {weaknesses.map((wk, idx) => (
              <li key={idx}>{typeof wk === "object" ? wk.title || wk.reason || "" : String(wk)}</li>
            ))}
          </ul>
        </div>
      </div>

      {idealAnswer && (
        <div style={{ marginTop: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px" }}>
          <strong className="text-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Lightbulb size={14} /> Ideal Answer Framework:
          </strong>
          <p style={{ margin: "4px 0 0 0", lineHeight: "1.5" }}>{idealAnswer}</p>
        </div>
      )}
    </div>
  );
};

export default AnswerEvaluation;
