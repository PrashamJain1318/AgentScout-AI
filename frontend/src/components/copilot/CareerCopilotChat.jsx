import { useState, useRef, useEffect } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import SuggestedPrompts from "./SuggestedPrompts";
import CopilotThinkingIndicator from "./CopilotLoading";
import { chatWithCopilot } from "../../services/copilot.api";

const INITIAL_WELCOME = {
  sender: "ai",
  text: "Hello! I am your AgentScout AI Career Copilot.\n\nI have analyzed your candidate profile, active opportunities, AI match scores, and application history.\n\nHow can I help accelerate your career search today?",
  timestamp: "Just now"
};

const CareerCopilotChat = ({ onTriggerAction }) => {
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text) => {
    if (!text || loading) return;

    setError(null);
    const userMsg = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await chatWithCopilot(text);
      const aiText = data.response || data.message || "I have analyzed your query and updated your career recommendations.";

      const aiMsg = {
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      let errorMsg = "Unable to connect to Career Copilot. Please check your internet connection.";
      if (err.response) {
        if (err.response.status === 401) {
          errorMsg = "Your session has expired. Please sign in again.";
        } else if (err.response.status === 429) {
          errorMsg = "AI request limit reached. Please try again later.";
        } else if (err.response.status === 500) {
          errorMsg = "Career Copilot is temporarily unavailable. Please try again in a few moments.";
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="copilot-chat-container">
      {/* Chat Messages Log */}
      <div className="messages-scroll-area">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}

        {loading && <CopilotThinkingIndicator />}

        {error && (
          <div className="chat-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Bar */}
      <SuggestedPrompts onSelectPrompt={handleSendMessage} loading={loading} />

      {/* Chat Input Bar */}
      <ChatInput onSend={handleSendMessage} loading={loading} />
    </div>
  );
};

export default CareerCopilotChat;
