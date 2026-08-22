import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

const ChatInput = ({ onSend, loading = false }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="copilot-chat-input-box" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask AI Career Copilot anything about your skills, matches, or roadmap..."
        disabled={loading}
        aria-label="Ask Career Copilot"
      />

      <button
        type="submit"
        className={`chat-send-btn ${loading || !text.trim() ? "disabled" : ""}`}
        disabled={loading || !text.trim()}
        aria-label="Send message"
      >
        {loading ? (
          <Loader2 size={18} className="spin" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </form>
  );
};

export default ChatInput;
