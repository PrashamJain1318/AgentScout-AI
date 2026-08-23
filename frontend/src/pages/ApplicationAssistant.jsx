import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, Brain } from "lucide-react";
import ApplicationAssistantHeader from "../components/application-assistant/ApplicationAssistantHeader";
import OpportunitySelector from "../components/application-assistant/OpportunitySelector";
import ApplicationReadinessScore from "../components/application-assistant/ApplicationReadinessScore";
import ApplicationStrengths from "../components/application-assistant/ApplicationStrengths";
import ApplicationGaps from "../components/application-assistant/ApplicationGaps";
import ResumeTailoring from "../components/application-assistant/ResumeTailoring";
import CoverLetterGenerator from "../components/application-assistant/CoverLetterGenerator";
import ApplicationAnswers from "../components/application-assistant/ApplicationAnswers";
import ApplicationStrategy from "../components/application-assistant/ApplicationStrategy";
import ApplicationChecklist from "../components/application-assistant/ApplicationChecklist";
import ApplicationAssetHistory from "../components/application-assistant/ApplicationAssetHistory";
import ApplicationAssistantEmptyState from "../components/application-assistant/ApplicationAssistantEmptyState";
import ApplicationAssistantError from "../components/application-assistant/ApplicationAssistantError";
import { getCachedData, setCachedData } from "../services/api";

import { getOpportunities } from "../services/opportunities.api";
import { analyzeOpportunityReadiness } from "../services/applicationAssistant.api";

const CACHE_KEY = "application-assistant-opps";

// URL Safety Helper
const isValidExternalUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return false;
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return false;
    return true;
  } catch (err) {
    return false;
  }
};

const ApplicationAssistant = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetOppId = searchParams.get("opportunity");

  const cached = getCachedData(CACHE_KEY);

  const [opportunities, setOpportunities] = useState(cached?.data || []);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [assistantData, setAssistantData] = useState(null);

  const [oppLoading, setOppLoading] = useState(!cached?.data);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  // 1. Fetch Candidate Available Opportunities
  useEffect(() => {
    const fetchOpps = async () => {
      if (!cached?.data) setOppLoading(true);
      setErrorNotice(null);

      try {
        const res = await getOpportunities({ limit: 30 });
        const list = res.opportunities || res.data || [];
        setOpportunities(list);
        setCachedData(CACHE_KEY, list);

        if (targetOppId && Array.isArray(list)) {
          const preSelected = list.find((o) => (o._id || o.id) === targetOppId);
          if (preSelected) {
            setSelectedOpportunity(preSelected);
          } else if (list.length > 0) {
            setSelectedOpportunity(list[0]);
          }
        } else if (list.length > 0 && !selectedOpportunity) {
          setSelectedOpportunity(list[0]);
        }
      } catch (err) {
        setErrorNotice("Failed to load available opportunities.");
      } finally {
        setOppLoading(false);
      }
    };

    fetchOpps();
  }, [targetOppId]);

  // 2. Fetch/Analyze Assistant Data for Selected Opportunity
  const loadAnalysis = async (oppId) => {
    if (!oppId) return;
    setAnalysisLoading(true);
    setErrorNotice(null);

    try {
      const res = await analyzeOpportunityReadiness(oppId);
      setAssistantData(res.data || null);
    } catch (err) {
      setErrorNotice("Failed to analyze application readiness for selected opportunity.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    const currentId = selectedOpportunity?._id || selectedOpportunity?.id;
    if (currentId) {
      loadAnalysis(currentId);
    } else {
      setAssistantData(null);
    }
  }, [selectedOpportunity]);

  const opp = assistantData?.opportunity || selectedOpportunity;
  const targetUrl = opp?.applicationUrl || opp?.jobUrl;
  const isUrlValid = isValidExternalUrl(targetUrl);

  return (
    <div className="resume-page-container">
      {/* 1. Header Shell Renders Immediately */}
      <ApplicationAssistantHeader />

      {/* 2. Opportunity Selector Renders Immediately */}
      <OpportunitySelector
        opportunities={opportunities}
        selectedOpportunity={selectedOpportunity}
        onSelect={(chosen) => setSelectedOpportunity(chosen)}
      />

      {errorNotice && (
        <ApplicationAssistantError
          message={errorNotice}
          onRetry={() => {
            const id = selectedOpportunity?._id || selectedOpportunity?.id;
            if (id) loadAnalysis(id);
          }}
        />
      )}

      {/* 3. Main Workspace Shell */}
      {oppLoading || analysisLoading ? (
        <div className="skeleton-details-body" style={{ minHeight: "360px", marginTop: "16px" }} />
      ) : !selectedOpportunity ? (
        <ApplicationAssistantEmptyState />
      ) : (
        <div className="details-2col-layout" style={{ marginTop: "8px" }}>
          {/* Main Intelligence Workspace Column */}
          <div className="details-main-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Readiness Score Breakdown */}
            <ApplicationReadinessScore
              readinessScore={assistantData?.readinessScore || 0}
              breakdown={assistantData?.scoreBreakdown || {}}
            />

            {/* Strengths Card */}
            <ApplicationStrengths strengths={assistantData?.strengths || []} />

            {/* Gaps & Missing Requirements Card */}
            <ApplicationGaps
              gaps={assistantData?.gaps || []}
              missingSkills={assistantData?.resumeAnalysis?.missingSkills || []}
            />

            {/* Tailored Resume Recommendations */}
            <ResumeTailoring recommendations={assistantData?.resumeRecommendations || []} />

            {/* AI Cover Letter Generator */}
            <CoverLetterGenerator
              opportunityId={selectedOpportunity._id || selectedOpportunity.id}
              initialCoverLetter={assistantData?.coverLetter}
            />

            {/* Job-Specific Application Answers */}
            <ApplicationAnswers
              opportunityId={selectedOpportunity._id || selectedOpportunity.id}
              initialAnswers={assistantData?.applicationAnswers || []}
            />

            {/* History of Prepared Assets */}
            <ApplicationAssetHistory />
          </div>

          {/* Side Column */}
          <div className="details-side-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Quick External Apply Navigation */}
            <div className="quick-summary-card">
              <h4>Ready to Submit?</h4>
              <p>Complete your preparation checklist and continue to the official hiring source portal.</p>

              {isUrlValid ? (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="full-apply-btn"
                  style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <span>Apply on Hiring Portal</span>
                  <ExternalLink size={16} />
                </a>
              ) : (
                <div className="no-url-notice">Official external application link is currently unavailable.</div>
              )}
            </div>

            {/* Interview Coach Integration Card */}
            <div className="quick-summary-card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Brain size={18} className="text-primary" />
                <h4 style={{ margin: 0 }}>Interview Preparation</h4>
              </div>

              {(assistantData?.readinessScore || 0) >= 70 ? (
                <div style={{ marginTop: "8px" }}>
                  <p style={{ margin: "4px 0 10px 0", fontSize: "12px" }}>
                    Application readiness is <strong>{assistantData?.readinessScore}%</strong>. You are ready to practice mock interviews!
                  </p>
                  <button
                    type="button"
                    className="primary-action-btn"
                    style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                    onClick={() => navigate(`/dashboard/interview-coach?opportunity=${selectedOpportunity._id || selectedOpportunity.id}`)}
                  >
                    <Brain size={14} />
                    <span>Practice Interview</span>
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: "8px" }}>
                  <p style={{ margin: "4px 0 10px 0", fontSize: "12px", color: "var(--warning)" }}>
                    Application readiness is <strong>{assistantData?.readinessScore || 0}%</strong>. Improve application details first.
                  </p>
                  <button
                    type="button"
                    className="secondary-action-btn"
                    style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                    disabled
                  >
                    <span>Improve Application First</span>
                  </button>
                </div>
              )}
            </div>

            {/* Application Submission Strategy */}
            <ApplicationStrategy
              opportunityId={selectedOpportunity._id || selectedOpportunity.id}
              initialStrategy={assistantData?.applicationStrategy}
            />

            {/* Preparation Checklist */}
            <ApplicationChecklist
              opportunityId={selectedOpportunity._id || selectedOpportunity.id}
              initialChecklist={assistantData?.checklist || []}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationAssistant;
