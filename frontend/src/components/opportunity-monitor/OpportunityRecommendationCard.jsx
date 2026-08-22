import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, MapPin, ExternalLink, Bookmark, BookmarkCheck, Trash2, CheckCircle2, ArrowRight, CheckSquare, Brain } from "lucide-react";
import { OpportunityScore, OpportunityReasoning, OpportunityReadiness, NewOpportunityBadge } from "./OpportunitySubcomponents";
import { createApplication } from "../../services/applications.api";

// URL validation helper
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

const OpportunityRecommendationCard = ({ item = {}, onWatch, onUnwatch, onDismiss }) => {
  const navigate = useNavigate();
  const { opportunity = {}, fit = {}, observation = {} } = item;

  const [isSaved, setIsSaved] = useState(Boolean(observation.saved));
  const [isApplied, setIsApplied] = useState(Boolean(observation.applied));

  const {
    _id,
    title = "Position",
    company = "Company",
    location = "Remote",
    type = "full-time",
    remote = false,
    requirements = [],
    applicationUrl = "",
    jobUrl = ""
  } = opportunity;

  const {
    score = 0,
    category = "MODERATE",
    matchedSkills = [],
    missingSkills = [],
    readinessScore = 0,
    recommendedAction = "Review Opportunity",
    aiExplanation = ""
  } = fit;

  const targetUrl = applicationUrl || jobUrl;
  const isUrlValid = isValidExternalUrl(targetUrl);
  const isNew = new Date(observation.firstSeenAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000);

  const handleApply = async () => {
    try {
      if (!isApplied) {
        await createApplication({
          opportunity: _id,
          jobTitle: title,
          company,
          location,
          jobType: type,
          workMode: remote ? "Remote" : "On-site",
          jobUrl: targetUrl,
          matchScore: score,
          status: "applied",
          appliedAt: new Date().toISOString()
        });
        setIsApplied(true);
      }
    } catch (e) {
      // Continue opening
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleToggleWatch = async () => {
    if (isSaved) {
      setIsSaved(false);
      if (onUnwatch) onUnwatch(_id);
    } else {
      setIsSaved(true);
      if (onWatch) onWatch(_id);
    }
  };

  return (
    <div className="suggestion-item-card" style={{ padding: "18px", position: "relative" }}>
      <div className="suggestion-header flex-between">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="company-logo-placeholder font-bold" style={{ width: "36px", height: "36px", fontSize: "14px" }}>
            {company ? company.charAt(0).toUpperCase() : "C"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <strong style={{ fontSize: "16px" }}>{title}</strong>
              {isNew && <NewOpportunityBadge />}
            </div>
            <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>
              {company} • <MapPin size={12} className="inline-icon" /> {location} {remote && "(Remote)"}
            </p>
          </div>
        </div>

        <OpportunityScore score={score} category={category} />
      </div>

      {/* Reasoning */}
      <OpportunityReasoning aiExplanation={aiExplanation} />

      {/* Skills alignment */}
      <div className="tags-chip-wrapper" style={{ margin: "10px 0" }}>
        {matchedSkills.slice(0, 3).map((s, idx) => (
          <span key={idx} className="skill-chip matched-chip" style={{ fontSize: "11px", padding: "2px 6px" }}>
            <CheckCircle2 size={10} /> {s}
          </span>
        ))}
        {missingSkills.slice(0, 2).map((s, idx) => (
          <span key={idx} className="skill-chip missing-chip" style={{ fontSize: "11px", padding: "2px 6px" }}>
            + {s}
          </span>
        ))}
      </div>

      <OpportunityReadiness readinessScore={readinessScore} />

      {/* Actions */}
      <div className="flex-between" style={{ marginTop: "14px", gap: "8px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className="secondary-action-btn"
            style={{ padding: "6px 10px", fontSize: "12px" }}
            onClick={handleToggleWatch}
          >
            {isSaved ? <BookmarkCheck size={14} className="text-success" /> : <Bookmark size={14} />}
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            className="icon-button logout-icon-button"
            style={{ padding: "6px" }}
            title="Dismiss"
            onClick={() => onDismiss && onDismiss(_id)}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="secondary-action-btn"
            style={{ padding: "6px 10px", fontSize: "12px" }}
            onClick={() => navigate(`/dashboard/application-assistant?opportunity=${_id}`)}
          >
            <CheckSquare size={13} />
            <span>Prepare</span>
          </button>

          <button
            type="button"
            className="save-profile-btn"
            style={{ padding: "6px 12px", fontSize: "12px" }}
            onClick={handleApply}
            disabled={!isUrlValid}
          >
            <span>{isApplied ? "Applied ✓" : "Apply Now"}</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityRecommendationCard;
