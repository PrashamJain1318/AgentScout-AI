import { User, Sparkles } from "lucide-react";

const ChatMessage = ({ message }) => {
  if (!message) return null;

  const isUser = message.sender === "user" || message.role === "user";
  const content = message.text || message.content || message.response || "";

  return (
    <div className={`chat-message-row ${isUser ? "user-row" : "ai-row"}`}>
      <div className={`message-avatar ${isUser ? "user-avatar" : "ai-avatar"}`}>
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      <div className="message-content-wrapper">
        <div className="message-header-meta">
          <span className="sender-name-label">
            {isUser ? "You" : "AI CAREER COPILOT"}
          </span>
          {message.timestamp && (
            <span className="timestamp-text">{message.timestamp}</span>
          )}
        </div>

        <div className="message-bubble-body">
          {content.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="message-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
