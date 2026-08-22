import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Globe,
  AlertCircle,
} from "lucide-react";
import { isValidExternalUrl, getCleanExternalUrl } from "../../utils/url";

// Relative date formatter helper
const formatPostedDate = (dateString) => {
  if (!dateString) return "Recently posted";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently posted";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  if (diffDays < 30) return `Posted ${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// Derive company initials for logo mark (e.g. "Cognitive Systems" -> "CS")
const getCompanyInitials = (name = "") => {
  if (!name) return "CO";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Match Score Hierarchy Label Helper
const getMatchLabel = (score) => {
  if (!score || score <= 0) return null;
  if (score >= 90) return { text: `${score}% Excellent Match`, class: "match-excellent" };
  if (score >= 75) return { text: `${score}% Strong Match`, class: "match-strong" };
  if (score >= 60) return { text: `${score}% Good Match`, class: "match-good" };
  return { text: `${score}% Potential Match`, class: "match-potential" };
};

const OpportunityCard = ({ opportunity, matchInfo = null, onApply = null }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [applyNotice, setApplyNotice] = useState("");

  if (!opportunity) return null;

  const oppId = opportunity._id || opportunity.id;
  const title = opportunity.title || "Software Opportunity";
  const company = opportunity.company || "Company";
  const location = opportunity.location || "Remote";
  const remote = opportunity.remote;
  const type = opportunity.type || "job";
  const postedAt = opportunity.postedAt || opportunity.createdAt;

  // Standardized Apply URL resolution & validation
  const rawUrl = opportunity.applyUrl || opportunity.applicationUrl || opportunity.url || opportunity.sourceUrl || "";
  const targetUrl = getCleanExternalUrl(rawUrl);
  const isUrlValid = isValidExternalUrl(targetUrl);

  const requirements = Array.isArray(opportunity.requirements) ? opportunity.requirements : [];

  // Match info from prop or backend payload
  const score = matchInfo?.score || opportunity.matchScore || opportunity.score || 0;
  const matchBadge = getMatchLabel(score);
  const matchedSkills = matchInfo?.matchedSkills || opportunity.matchedSkills || [];
  const missingSkills = matchInfo?.missingSkills || opportunity.missingSkills || [];

  const handleApply = (e) => {
    e.stopPropagation();
    setApplyNotice("");

    if (onApply) {
      onApply(opportunity);
      return;
    }

    if (!isUrlValid) {
      setApplyNotice("This opportunity's application link is currently unavailable.");
      return;
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewDetails = () => {
    if (oppId) {
      navigate(`/opportunities/${oppId}`);
    }
  };

  const toggleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div
      className="opportunity-card-reusable"
      onClick={handleViewDetails}
      role="article"
      aria-label={`${title} at ${company}`}
    >
      {/* Top Company & Title Row */}
      <div className="card-top-row">
        <div className="company-logo-mark">
          {getCompanyInitials(company)}
        </div>

        <div className="role-company-info">
          <h4>{title}</h4>
          <span className="company-name-label">{company}</span>
        </div>

        <button
          type="button"
          className={`card-bookmark-btn ${isSaved ? "saved" : ""}`}
          onClick={toggleSave}
          title={isSaved ? "Saved" : "Save opportunity"}
          aria-label={isSaved ? "Unsave opportunity" : "Save opportunity"}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* Meta Pills Row */}
      <div className="card-meta-tags-row">
        {matchBadge && (
          <span className={`match-pill-score ${matchBadge.class}`}>
            <Sparkles size={13} />
            {matchBadge.text}
          </span>
        )}

        {location && (
          <span className="meta-tag">
            <MapPin size={13} />
            {location}
          </span>
        )}

        {remote && (
          <span className="meta-tag pill-highlight">
            <Globe size={13} />
            Remote
          </span>
        )}

        <span className="meta-tag pill-highlight type-badge">
          <Briefcase size={13} />
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>

        <span className="meta-tag date-tag">
          <Calendar size={13} />
          {formatPostedDate(postedAt)}
        </span>
      </div>

      {/* Skills Matrix Row */}
      <div className="card-skills-matrix">
        {matchedSkills.length > 0 ? (
          matchedSkills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="skill-chip matched-chip">
              <CheckCircle2 size={12} />
              {skill}
            </span>
          ))
        ) : requirements.length > 0 ? (
          requirements.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="skill-chip req-chip">
              {skill}
            </span>
          ))
        ) : null}

        {missingSkills.slice(0, 2).map((skill, idx) => (
          <span key={idx} className="skill-chip missing-chip">
            + {skill}
          </span>
        ))}
      </div>

      {/* Inline Notice if Apply Link is Unavailable */}
      {applyNotice && (
        <div className="card-apply-notice" onClick={(e) => e.stopPropagation()}>
          <AlertCircle size={13} />
          <span>{applyNotice}</span>
        </div>
      )}

      {/* Bottom Actions Row */}
      <div className="card-bottom-actions">
        <button
          type="button"
          className="view-details-link-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          <span>View Details</span>
          <ChevronRight size={15} />
        </button>

        {isUrlValid ? (
          <button
            type="button"
            className="apply-opportunity-btn"
            onClick={handleApply}
            aria-label={`Apply for ${title} at ${company}`}
          >
            <span>Apply</span>
            <ExternalLink size={13} />
          </button>
        ) : (
          <button
            type="button"
            className="apply-opportunity-btn disabled"
            disabled
            title="Application link is currently unavailable"
            aria-label="Application link is currently unavailable"
          >
            <span>Application link unavailable</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
