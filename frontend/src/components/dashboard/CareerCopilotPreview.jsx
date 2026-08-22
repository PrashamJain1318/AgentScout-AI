import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Target,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Clock,
  RefreshCw,
  AlertCircle,
  Award,
} from "lucide-react";
import { getCareerCopilotPlan } from "../../services/careerCopilot.api";

const formatTimestamp = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CareerCopilotPreview = ({ initialCopilot = null }) => {
  const navigate = useNavigate();

  const [copilot, setCopilot] = useState(initialCopilot);
  const [loading, setLoading] = useState(!initialCopilot);
  const [error, setError] = useState(null);

  const fetchCopilotPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await getCareerCopilotPlan();
      const data = resData.data || resData.copilot || resData || null;
      setCopilot(data);
    } catch (err) {
      setError("Career Copilot plan currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCopilot) {
      fetchCopilotPlan();
    }
  }, [initialCopilot]);

  if (loading) {
    return (
      <div className="copilot-preview-card dark-card skeleton-card dark-skeleton" style={{ minHeight: "280px" }}>
        <div className="skeleton-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="copilot-preview-card dark-card error-card">
        <div className="inline-error-state dark-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={fetchCopilotPlan} className="retry-btn">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract Plan Data Safely with Fallbacks
  const summaryRaw = copilot?.careerSummary || copilot?.summary || "AI-driven career insights tailored to your Target Role and Skill matrix.";
  const summary = typeof summaryRaw === "object" && summaryRaw !== null
    ? summaryRaw.text || summaryRaw.summary || summaryRaw.description || ""
    : String(summaryRaw || "");

  const strengths = Array.isArray(copilot?.strengths) ? copilot.strengths : [];
  const skillGaps = Array.isArray(copilot?.skillGaps) ? copilot.skillGaps : Array.isArray(copilot?.skillGapAnalysis) ? copilot.skillGapAnalysis : [];
  const recommendedSkills = Array.isArray(copilot?.recommendedSkills) ? copilot.recommendedSkills : [];
  const projectIdeas = Array.isArray(copilot?.projectIdeas) ? copilot.projectIdeas : Array.isArray(copilot?.projects) ? copilot.projects : [];
  const nextActions = Array.isArray(copilot?.nextActions) ? copilot.nextActions : Array.isArray(copilot?.actionItems) ? copilot.actionItems : [];

  const item = skillGaps[0] || copilot?.topSkillGap || "System Architecture";
  const recommendedSkill = recommendedSkills[0] || copilot?.recommendedSkill || "Docker & Kubernetes";
  const projectIdea = projectIdeas[0] || copilot?.projectIdea || "Build a microservices dashboard with real-time analytics.";
  const nextAction = nextActions[0] || copilot?.nextAction || "Update profile skills with latest backend frameworks.";
  const generatedTimeText = formatTimestamp(copilot?.generatedAt || copilot?.updatedAt || copilot?.createdAt);

  return (
    <section className="copilot-preview-card dark-card" role="region" aria-label="Career Copilot AI Assistant Preview">
      <div className="copilot-header-flex">
        <span className="copilot-ai-badge">
          <Sparkles size={13} />
          <span>AI CAREER COPILOT</span>
        </span>

        {generatedTimeText && (
          <span className="copilot-timestamp" title="Plan generation date">
            <Clock size={11} />
            <span>{generatedTimeText}</span>
          </span>
        )}
      </div>

      <div className="copilot-summary-box">
        <p className="copilot-summary-text">{summary}</p>

        {strengths.length > 0 && (
          <div className="copilot-strengths-row">
            <span className="strengths-label">
              <Award size={12} /> Top Strengths:
            </span>
            <div className="strengths-pills">
              {strengths.slice(0, 3).map((str, idx) => {
                const label = typeof str === "object" && str !== null ? str.title || str.name || str.skill || "" : String(str || "");
                return (
                  <span key={idx} className="copilot-strength-pill">
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="copilot-grid-insights">
        {/* Top Skill Gap Tile */}
        <div className="copilot-insight-tile tile-danger">
          <div className="tile-icon">
            <Target size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Top Skill Gap</span>
            {typeof item === "object" && item !== null ? (
              <div>
                <strong>{item.skill || item.name || item.title || ""}</strong>
                {item.importance && <span className="copilot-strength-pill" style={{ marginLeft: "6px" }}>{item.importance}</span>}
                {item.reason && <p className="tile-description" style={{ marginTop: "4px" }}>{item.reason}</p>}

                {Array.isArray(item.relatedRoles) && item.relatedRoles.length > 0 && (
                  <div className="strengths-pills" style={{ marginTop: "6px" }}>
                    {item.relatedRoles.map((role, index) => (
                      <span key={`${role}-${index}`} className="copilot-strength-pill">
                        {typeof role === "object" && role !== null ? role.title || role.name || "" : String(role)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <strong className="tile-value">{String(item || "")}</strong>
            )}
          </div>
        </div>

        {/* Recommended Skill Tile */}
        <div className="copilot-insight-tile tile-primary">
          <div className="tile-icon">
            <Zap size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Recommended Skill</span>
            <strong className="tile-value">
              {typeof recommendedSkill === "object" && recommendedSkill !== null
                ? recommendedSkill.skill || recommendedSkill.name || recommendedSkill.title || ""
                : String(recommendedSkill || "")}
            </strong>
          </div>
        </div>

        {/* Project Recommendation Tile */}
        <div className="copilot-insight-tile tile-idea">
          <div className="tile-icon">
            <Lightbulb size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Project Recommendation</span>
            <p className="tile-description">
              {typeof projectIdea === "object" && projectIdea !== null
                ? projectIdea.title || projectIdea.name || projectIdea.description || ""
                : String(projectIdea || "")}
            </p>
          </div>
        </div>

        {/* Next Priority Action Tile */}
        <div className="copilot-insight-tile tile-success">
          <div className="tile-icon">
            <CheckCircle2 size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Next Priority Action</span>
            <p className="tile-description">
              {typeof nextAction === "object" && nextAction !== null
                ? nextAction.title || nextAction.name || nextAction.task || nextAction.description || ""
                : String(nextAction || "")}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="open-copilot-cta-btn"
        onClick={() => navigate("/career-copilot")}
      >
        <span>Open Career Copilot →</span>
        <ArrowRight size={16} />
      </button>
    </section>
  );
};

export default CareerCopilotPreview;
