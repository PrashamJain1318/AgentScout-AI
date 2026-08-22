import {
  Sparkles,
  MapPin,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Building,
} from "lucide-react";

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

const OpportunityCard = ({ opportunity, onApply = null }) => {
  if (!opportunity) return null;

  const {
    title = "Software Engineer",
    company = "Company",
    location = "Remote",
    remoteType = "Remote",
    type = "Full-time",
    matchScore = 0,
    score = 0,
    matchedSkills = [],
    missingSkills = [],
    createdAt,
    postedDate,
    url,
    applyUrl,
    link,
  } = opportunity;

  const displayScore = matchScore || score;
  const targetUrl = url || applyUrl || link || "#";
  const dateText = formatPostedDate(createdAt || postedDate);

  const handleApplyClick = (e) => {
    if (onApply) {
      onApply(opportunity);
    } else if (targetUrl && targetUrl !== "#") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="opportunity-card-reusable" role="article" aria-label={`${title} at ${company}`}>
      <div className="card-top-row">
        <div className="company-logo-mark">
          <Building size={20} />
        </div>

        <div className="role-company-info">
          <h4>{title}</h4>
          <span className="company-name-label">{company}</span>
        </div>

        {displayScore > 0 && (
          <div className="match-pill-score">
            <Sparkles size={13} />
            <span>{displayScore}% Match</span>
          </div>
        )}
      </div>

      <div className="card-meta-tags-row">
        {location && (
          <span className="meta-tag">
            <MapPin size={13} />
            {location}
          </span>
        )}

        {remoteType && (
          <span className="meta-tag pill-highlight">
            <GlobeIcon size={13} />
            {remoteType}
          </span>
        )}

        {type && (
          <span className="meta-tag pill-highlight">
            <Briefcase size={13} />
            {type}
          </span>
        )}

        <span className="meta-tag date-tag">
          <Calendar size={13} />
          {dateText}
        </span>
      </div>

      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
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
      )}

      <div className="card-bottom-actions">
        <button
          type="button"
          className="apply-opportunity-btn"
          onClick={handleApplyClick}
          aria-label={`Apply for ${title} at ${company}`}
        >
          <span>Apply Now</span>
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
};

// Internal icon component for clean compilation
const GlobeIcon = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default OpportunityCard;
