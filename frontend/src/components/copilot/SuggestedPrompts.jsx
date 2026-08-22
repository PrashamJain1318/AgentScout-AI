import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Analyze my career profile",
  "What skills should I learn next?",
  "Why are my match scores low?",
  "Which opportunities should I apply to?",
  "Create a 30-day career plan",
  "Improve my professional summary",
  "Prepare me for an interview",
  "What projects should I build?"
];

const SuggestedPrompts = ({ onSelectPrompt, loading = false }) => {
  return (
    <div className="suggested-prompts-container">
      <div className="suggested-header">
        <Sparkles size={14} className="text-primary" />
        <span>Suggested AI Prompts:</span>
      </div>

      <div className="suggested-pills-row">
        {SUGGESTIONS.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            className="suggested-prompt-pill"
            onClick={() => onSelectPrompt(promptText)}
            disabled={loading}
          >
            {promptText}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
