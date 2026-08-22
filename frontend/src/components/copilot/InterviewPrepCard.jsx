import { BookOpen, HelpCircle, CheckCircle2 } from "lucide-react";

const InterviewPrepCard = ({ prep }) => {
  if (!prep) return null;

  return (
    <div className="interview-prep-card">
      <div className="prep-header flex-between">
        <div>
          <h4>Interview Preparation Guide</h4>
          <span className="target-role-sub">{prep.targetRole} @ {prep.company}</span>
        </div>
        <BookOpen size={20} className="text-primary" />
      </div>

      {Array.isArray(prep.topics) && prep.topics.length > 0 && (
        <div className="prep-section">
          <h5>Core Assessment Focus</h5>
          <ul className="bullet-list">
            {prep.topics.map((t, idx) => (
              <li key={idx}>• {t}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(prep.technicalQuestions) && prep.technicalQuestions.length > 0 && (
        <div className="prep-section">
          <h5>Technical Interview Questions</h5>
          <div className="questions-list">
            {prep.technicalQuestions.map((q, idx) => (
              <div key={idx} className="question-item">
                <HelpCircle size={14} className="text-indigo" />
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(prep.tips) && prep.tips.length > 0 && (
        <div className="prep-section">
          <h5>Strategic Preparation Tips</h5>
          <ul className="bullet-list">
            {prep.tips.map((tip, idx) => (
              <li key={idx}>
                <CheckCircle2 size={13} className="text-success inline-icon" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InterviewPrepCard;
