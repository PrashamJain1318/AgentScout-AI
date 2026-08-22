import { useState } from "react";
import { Sparkles, Check, AlertCircle } from "lucide-react";
import { generateApplicationStrategy } from "../../services/applicationAssistant.api";

const ApplicationStrategy = ({ opportunityId, initialStrategy = null }) => {
  const [strategy, setStrategy] = useState(initialStrategy);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!opportunityId) return;
    setGenerating(true);

    try {
      const res = await generateApplicationStrategy(opportunityId);
      setStrategy(res.applicationStrategy || null);
    } catch (err) {
      // Ignore
    } finally {
      setGenerating(false);
    }
  };

  const currentStrategy = strategy || initialStrategy;
  const recommendation = currentStrategy?.recommendation || "Apply now";
  const priority = currentStrategy?.priority || "High";
  const keyActionSteps = currentStrategy?.keyActionSteps || [
    "Lead with strongest matching technical skills.",
    "Highlight key project accomplishments.",
    "Submit tailored cover letter."
  ];

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">APPLICATION STRATEGY</span>
          <h3>AI Submission Strategy</h3>
        </div>

        <button
          type="button"
          className="secondary-action-btn"
          onClick={handleGenerate}
          disabled={generating || !opportunityId}
        >
          <Sparkles size={14} />
          <span>{generating ? "Updating Strategy..." : "Refresh Strategy"}</span>
        </button>
      </div>

      <div className="suggestion-item-card flex-between">
        <div>
          <span className="notif-subtext">AI Recommendation</span>
          <h4 style={{ margin: "2px 0 0 0" }} className="text-primary">
            {recommendation}
          </h4>
        </div>

        <span className={`impact-badge ${priority.toLowerCase()}`}>
          {priority.toUpperCase()} PRIORITY
        </span>
      </div>

      <div style={{ marginTop: "8px" }}>
        <h5 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>Actionable Preparation Steps</h5>
        <ul className="entry-achievements-list">
          {keyActionSteps.map((step, idx) => (
            <li key={idx}>{typeof step === "object" ? step.title || step.step || "" : String(step)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ApplicationStrategy;
