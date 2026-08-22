import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Globe,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import MatchScore from "./MatchScore";
import { isValidExternalUrl, getCleanExternalUrl } from "../../utils/url";

const getCompanyInitials = (name = "") => {
  if (!name) return "CO";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const MatchCard = ({ match, onApply = null }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [applyNotice, setApplyNotice] = useState("");

  if (!match) return null;

  const matchId = match._id || match.id;
  const opp = match.opportunity || {};
  const oppId = opp._id || opp.id || matchId;

  const title = opp.title || match.jobTitle || "Software Engineer";
  const company = opp.company || match.company || "Company";
  const location = opp.location || match.location || "Remote";
  const remote = opp.remote || match.workMode === "remote";
  const type = opp.type || match.jobType || "job";
  const score = match.score || opp.matchScore || 0;

  const matchedSkills = match.matchedSkills || opp.matchedSkills || [];
  const missingSkills = match.missingSkills || opp.missingSkills || [];
  
  // Specific data-driven reasoning derived from actual candidate & opportunity data
  const reasoning = match.recommendation ||
    match.explanation?.summary ||
    (matchedSkills.length > 0
      ? `Your ${matchedSkills.join(", ")} experience aligns with the requirements at ${company}${missingSkills.length > 0 ? `, but the role requires additional ${missingSkills.join(", ")} experience.` : "."}`
      : missingSkills.length > 0
      ? `This role at ${company} requires additional ${missingSkills.join(", ")} experience.`
      : `Your candidate profile aligns with the position requirements at ${company}.`);

  // Standardized Apply URL resolution & validation
  const rawUrl = opp.applicationUrl || opp.applyUrl || match.applicationUrl || match.jobUrl || "";
  const targetUrl = getCleanExternalUrl(rawUrl);
  const isUrlValid = isValidExternalUrl(targetUrl);

  const handleApply = (e) => {
    e.stopPropagation();
    setApplyNotice("");

    if (onApply) {
      onApply(opp);
      return;
    }

    if (!isUrlValid) {
      setApplyNotice("Application link is currently unavailable.");
      return;
    }

    // Opens valid external HTTP/HTTPS URL in a new browser tab
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleView = () => {
    navigate(`/matches/${matchId}`);
  };

  return (
    <div className="match-card-container" onClick={handleView} role="article" aria-label={`${title} at ${company}`}>
      
      {/* Top Company & Match Score Row */}
      <div className="card-top-row">
        <div className="company-logo-mark">
          {getCompanyInitials(company)}
        </div>

        <div className="role-company-info">
          <h4>{title}</h4>
          <span className="company-name-label">{company}</span>
        </div>

        <div className="top-right-actions">
          <MatchScore score={score} />

          <button
            type="button"
            className={`card-bookmark-btn ${isSaved ? "saved" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            title={isSaved ? "Saved" : "Save match"}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>

      {/* Meta Pills Row */}
      <div className="card-meta-tags-row">
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
      </div>

      {/* Skills Alignment Matrix */}
      <div className="card-skills-matrix">
        {matchedSkills.slice(0, 3).map((skill, idx) => (
          <span key={idx} className="skill-chip matched-chip">
            <CheckCircle2 size={12} />
            {skill}
          </span>
        ))}

        {missingSkills.slice(0, 2).map((skill, idx) => (
          <span key={idx} className="skill-chip missing-chip">
            + {skill}
          </span>
        ))}
      </div>

      {/* AI Reasoning Callout Box */}
      <div className="ai-match-quote-box">
        <span className="quote-heading">Why this matches you</span>
        <p className="quote-text">"{reasoning}"</p>
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
        <button type="button" className="view-details-link-btn" onClick={(e) => { e.stopPropagation(); handleView(); }}>
          <span>View Match</span>
          <ChevronRight size={15} />
        </button>

        {isUrlValid ? (
          <button type="button" className="apply-opportunity-btn" onClick={handleApply}>
            <span>Apply</span>
            <ExternalLink size={13} />
          </button>
        ) : (
          <button type="button" className="apply-opportunity-btn disabled" disabled title="Application link unavailable">
            <span>Link Unavailable</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default MatchCard;
