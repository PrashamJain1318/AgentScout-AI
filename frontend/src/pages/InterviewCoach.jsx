import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Brain, Sparkles, Target, History, RefreshCw, AlertCircle } from "lucide-react";
import InterviewReadiness from "../components/interview/InterviewReadiness";
import InterviewSetup from "../components/interview/InterviewSetup";
import MockInterview from "../components/interview/MockInterview";
import InterviewResults from "../components/interview/InterviewResults";
import InterviewHistory from "../components/interview/InterviewHistory";
import InterviewPreparationPlan from "../components/interview/InterviewPreparationPlan";

import { getOpportunities } from "../services/opportunities.api";
import {
  getInterviewReadiness,
  startInterview,
  getInterviewSession
} from "../services/interview.api";

const InterviewCoach = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetOppId = searchParams.get("opportunity");

  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [readinessData, setReadinessData] = useState(null);

  const [viewState, setViewState] = useState("setup"); // setup | live | results | details
  const [activeSession, setActiveSession] = useState(null);
  const [sessionResults, setSessionResults] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  // 1. Load available opportunities & candidate readiness metrics
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorNotice(null);

      try {
        const [oppRes, readRes] = await Promise.all([
          getOpportunities({ limit: 30 }),
          getInterviewReadiness(targetOppId || "")
        ]);

        const list = oppRes.opportunities || oppRes.data || [];
        setOpportunities(list);
        setReadinessData(readRes.data || null);

        if (targetOppId) {
          const preSelected = list.find((o) => (o._id || o.id) === targetOppId);
          if (preSelected) {
            setSelectedOpp(preSelected);
          }
        }
      } catch (err) {
        setErrorNotice("Unable to load interview coach data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetOppId]);

  // Handle Starting a Mock Interview Session
  const handleStartSession = async (config) => {
    setSessionLoading(true);
    setErrorNotice(null);

    try {
      const res = await startInterview(config);
      setActiveSession(res.data);
      setViewState("live");
    } catch (err) {
      setErrorNotice("Failed to start mock interview session. Please try again.");
    } finally {
      setSessionLoading(false);
    }
  };

  // Handle Session Completion
  const handleCompleteSession = (completedData) => {
    setSessionResults(completedData);
    setViewState("results");
    // Refresh readiness metrics
    getInterviewReadiness().then((res) => setReadinessData(res.data)).catch(() => {});
  };

  // Handle Select Session from History
  const handleSelectHistorySession = async (sessionId) => {
    setSessionLoading(true);
    try {
      const res = await getInterviewSession(sessionId);
      setSessionResults(res.data);
      setViewState("results");
    } catch (err) {
      setErrorNotice("Unable to load session details.");
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <div className="resume-page-container">
      {/* Header Banner */}
      <div className="application-assistant-header flex-between">
        <div>
          <div className="header-badge">
            <Brain size={14} className="text-primary" />
            <span>AI INTERVIEW COACH</span>
          </div>
          <h2>AI Interview Coach</h2>
          <p className="subtitle-text">
            Practice smarter. Interview with confidence.
          </p>
        </div>

        <div className="assistant-workflow-steps">
          <div className={`step-pill ${viewState === "setup" ? "active" : ""}`}>
            <span>1. Setup</span>
          </div>
          <div className={`step-pill ${viewState === "live" ? "active" : ""}`}>
            <span>2. Practice</span>
          </div>
          <div className={`step-pill ${viewState === "results" ? "active" : ""}`}>
            <span>3. Feedback</span>
          </div>
        </div>
      </div>

      {errorNotice && (
        <div className="inline-error-state" style={{ margin: "16px 0" }}>
          <AlertCircle size={20} />
          <span>{errorNotice}</span>
        </div>
      )}

      {loading ? (
        <div className="skeleton-details-body" style={{ minHeight: "360px" }} />
      ) : (
        <div className="details-2col-layout">
          {/* Main Workspace Column */}
          <div className="details-main-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Top Readiness Score Intelligence Gauge */}
            <InterviewReadiness readinessData={readinessData || {}} />

            {/* Dynamic View State Component */}
            {viewState === "setup" && (
              <InterviewSetup
                opportunities={opportunities}
                selectedOpp={selectedOpp}
                onStart={handleStartSession}
                loading={sessionLoading}
              />
            )}

            {viewState === "live" && activeSession && (
              <MockInterview
                sessionData={activeSession}
                onCompleteSession={handleCompleteSession}
              />
            )}

            {viewState === "results" && sessionResults && (
              <InterviewResults
                results={sessionResults}
                onRetry={() => setViewState("setup")}
                onViewHistory={() => {
                  const histElem = document.getElementById("interview-history-section");
                  if (histElem) histElem.scrollIntoView({ behavior: "smooth" });
                }}
              />
            )}

            {/* Preparation Roadmap Plan */}
            <InterviewPreparationPlan />
          </div>

          {/* Side Column: Session History */}
          <div className="details-side-column" id="interview-history-section" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <InterviewHistory
              onSelectSession={handleSelectHistorySession}
              onRetry={() => setViewState("setup")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewCoach;
