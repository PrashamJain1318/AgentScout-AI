import { useState, useEffect } from "react";
import { HelpCircle, Send, Sparkles, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { submitAnswer, completeInterview } from "../../services/interview.api";
import AnswerEvaluation from "./AnswerEvaluation";

const MockInterview = ({ sessionData = {}, onCompleteSession }) => {
  const [currentQuestion, setCurrentQuestion] = useState(sessionData.firstQuestion || sessionData.questions?.[0] || null);
  const [questionIndex, setQuestionIndex] = useState(sessionData.currentQuestionIndex || 0);
  const totalQuestions = sessionData.questionsAsked || sessionData.questions?.length || 5;

  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [completing, setCompleting] = useState(false);

  const [seconds, setSeconds] = useState(0);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || submitting) return;

    setSubmitting(true);
    setLastEvaluation(null);

    try {
      const res = await submitAnswer(sessionData.sessionId || sessionData._id, userAnswer);
      const evalData = res.data;

      setLastEvaluation({
        score: evalData.score,
        evaluation: evalData.evaluation,
        strengths: evalData.strengths,
        weaknesses: evalData.weaknesses,
        idealAnswer: evalData.idealAnswer,
        improvementTips: evalData.improvementTips
      });

      if (evalData.isFinished) {
        // Automatically complete interview
        handleFinishSession();
      } else {
        setCurrentQuestion(evalData.nextQuestion);
        setQuestionIndex(evalData.nextQuestionIndex);
        setUserAnswer("");
      }
    } catch (err) {
      // Error fallback
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishSession = async () => {
    setCompleting(true);
    try {
      const res = await completeInterview(sessionData.sessionId || sessionData._id);
      if (onCompleteSession) {
        onCompleteSession(res.data);
      }
    } catch (err) {
      // Fallback
    } finally {
      setCompleting(false);
    }
  };

  const progressPct = Math.round(((questionIndex + 1) / totalQuestions) * 100);

  return (
    <div className="resume-section-card">
      {/* Session Progress Header */}
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">{sessionData.interviewType || "Mock Interview"} ({sessionData.difficulty || "Intermediate"})</span>
          <h3>Question {questionIndex + 1} of {totalQuestions}</h3>
        </div>

        <div className="flex-between" style={{ gap: "12px" }}>
          <div className="step-pill active">
            <Clock size={13} />
            <span>Elapsed: {formatTime(seconds)}</span>
          </div>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={handleFinishSession}
            disabled={completing}
          >
            <span>{completing ? "Finalizing Session..." : "Finish Interview"}</span>
          </button>
        </div>
      </div>

      <div className="progress-bar-bg" style={{ margin: "4px 0 16px 0" }}>
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Current Question Display */}
      {currentQuestion && (
        <div className="suggestion-item-card" style={{ background: "#f8fafc", padding: "20px" }}>
          <div className="suggestion-header flex-between">
            <strong style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", color: "var(--primary)" }}>
              <HelpCircle size={18} />
              <span>Category: {currentQuestion.category || "General"}</span>
            </strong>
            <span className="impact-badge medium">
              {(currentQuestion.difficulty || "Intermediate").toUpperCase()}
            </span>
          </div>

          <h4 style={{ margin: "12px 0 8px 0", fontSize: "16px", lineHeight: "1.5" }}>
            {currentQuestion.question}
          </h4>

          {Array.isArray(currentQuestion.expectedTopics) && currentQuestion.expectedTopics.length > 0 && (
            <div className="tags-chip-wrapper" style={{ marginTop: "8px" }}>
              <span className="notif-subtext" style={{ marginRight: "4px" }}>Key Topics:</span>
              {currentQuestion.expectedTopics.map((topic, idx) => (
                <span key={idx} className="tag-chip">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer Input Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
        <div className="form-group">
          <label htmlFor="answer-input" style={{ fontWeight: 700 }}>
            Your Answer (Use the STAR method for behavioral questions):
          </label>
          <textarea
            id="answer-input"
            className="form-input"
            rows={6}
            placeholder="Type your structured answer here. Include relevant past experience, specific technical choices, and quantitative results..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="flex-between" style={{ marginTop: "12px" }}>
          <span className="notif-subtext">
            {userAnswer.length} characters typed
          </span>

          <button
            type="submit"
            className="primary-action-btn"
            disabled={!userAnswer.trim() || submitting}
          >
            <Send size={16} />
            <span>{submitting ? "AI is evaluating your answer..." : "Submit Answer & Continue"}</span>
          </button>
        </div>
      </form>

      {/* Evaluation Feedback */}
      {lastEvaluation && <AnswerEvaluation evaluation={lastEvaluation} />}
    </div>
  );
};

export default MockInterview;
