import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Briefcase,
  MapPin,
  Building,
  ExternalLink,
  ArrowLeft,
  BookmarkCheck,
  Bookmark,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Brain,
} from "lucide-react";

import MatchScore from "../components/matches/MatchScore";
import MatchBreakdown from "../components/matches/MatchBreakdown";
import MatchExplanation from "../components/matches/MatchExplanation";

import {
  getMatch,
  explainMatch,
} from "../services/matches.api";

import {
  createApplication,
  getApplications,
} from "../services/applications.api";

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

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [applyNotice, setApplyNotice] = useState(null);

  const fetchMatchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const resData = await getMatch(id);
      const m = resData.match || resData.data || resData || null;

      if (!m) {
        setError("Match details not found.");
        return;
      }

      setMatchData(m);

      try {
        const appRes = await getApplications();
        const apps = appRes.applications || appRes.data || [];
        const oppId = m.opportunity?._id || m.opportunity?.id || m.opportunity;
        const hasApplied = apps.some(
          (a) => (a.opportunity?._id || a.opportunity) === oppId
        );
        setIsApplied(hasApplied);
      } catch (e) {
        // Fallback
      }
    } catch (err) {
      setError("Unable to load AI match details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMatchData();
  }, [id]);

  const handleRefreshExplanation = async () => {
    if (explaining || !id) return;
    setExplaining(true);

    try {
      const resData = await explainMatch(id, true);
      const updated = resData.match || resData.data || resData || null;
      if (updated) {
        setMatchData(updated);
      }
    } catch (err) {
      // Ignore fallback
    } finally {
      setExplaining(false);
    }
  };

  const handleApply = async () => {
    if (!matchData || !matchData.opportunity) return;
    setApplyNotice(null);

    const opp = matchData.opportunity;
    const targetUrl = opp.applicationUrl || opp.jobUrl;

    if (!isValidExternalUrl(targetUrl)) {
      setApplyNotice(
        "Notice: The external job URL is unverified. Opening application link..."
      );
    }

    try {
      if (!isApplied) {
        await createApplication({
          opportunity: opp._id || opp.id,
          jobTitle: opp.title,
          company: opp.company,
          location: opp.location,
          jobType: opp.type,
          workMode: opp.remote ? "Remote" : "On-site",
          jobUrl: targetUrl,
          matchScore: matchData.score || 0,
          status: "applied",
          appliedAt: new Date().toISOString(),
          applicationUrl: targetUrl,
        });
        setIsApplied(true);
      }
    } catch (err) {
      // Continue to open URL
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="opportunity-details-page">
        <div className="skeleton-details-header" />
        <div className="skeleton-details-body" />
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="opportunity-details-page">
        <button type="button" onClick={() => navigate("/dashboard/matches")} className="back-nav-btn">
          <ArrowLeft size={16} /> Back to AI Matches
        </button>

        <div className="inline-error-state" style={{ marginTop: "24px" }}>
          <AlertCircle size={24} />
          <h4>{error || "Match Details Not Found"}</h4>
          <button type="button" onClick={fetchMatchData} className="retry-btn">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const opp = matchData.opportunity || {};
  const {
    title = "Position",
    company = "Company",
    location = "Remote",
    type = "full-time",
    remote = false,
    description = "",
    requirements = [],
    applicationUrl = "",
    jobUrl = "",
  } = opp;

  const score = matchData.score || 0;
  const validUrl = applicationUrl || jobUrl;
  const isUrlValid = isValidExternalUrl(validUrl);
  const oppId = opp._id || opp.id;

  return (
    <div className="opportunity-details-page">

      {/* Back Navigation Bar */}
      <button type="button" onClick={() => navigate("/dashboard/matches")} className="back-nav-btn">
        <ArrowLeft size={16} /> Back to AI Matches
      </button>

      {/* Header Overview Card */}
      <div className="details-header-card">
        <div className="header-company-logo">
          <Building size={28} />
        </div>

        <div className="header-main-info">
          <h2>{title}</h2>
          <div className="company-location-row">
            <strong className="company-text">{company}</strong>
            <span className="dot-divider">•</span>
            <span className="location-text">
              <MapPin size={14} /> {location}
            </span>
            {remote && (
              <>
                <span className="dot-divider">•</span>
                <span className="remote-text">
                  <Globe size={14} /> Remote
                </span>
              </>
            )}
          </div>
        </div>

        <div className="header-actions-group">
          <MatchScore score={score} size="large" />

          {oppId && (
            <button
              type="button"
              className="secondary-action-btn"
              onClick={() => navigate(`/dashboard/interview-coach?opportunity=${oppId}`)}
            >
              <Brain size={16} className="text-primary" />
              <span>Prepare for Interview</span>
            </button>
          )}

          {oppId && (
            <button
              type="button"
              className="save-profile-btn"
              onClick={() => navigate(`/dashboard/application-assistant?opportunity=${oppId}`)}
            >
              <CheckSquare size={16} />
              <span>Prepare Application</span>
            </button>
          )}

          <button
            type="button"
            className={`secondary-action-btn ${isSaved ? "saved" : ""}`}
            onClick={() => setIsSaved(!isSaved)}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          {oppId && (
            <button type="button" className="secondary-action-btn" onClick={() => navigate(`/opportunities/${oppId}`)}>
              <span>View Opportunity</span>
            </button>
          )}

          {isUrlValid ? (
            <button type="button" className="save-profile-btn" onClick={handleApply}>
              <span>Apply Now</span>
              <ExternalLink size={16} />
            </button>
          ) : (
            <button type="button" className="save-profile-btn disabled" disabled title="Application link unavailable">
              <span>Link Unavailable</span>
            </button>
          )}
        </div>
      </div>

      {applyNotice && (
        <div className="card-apply-notice" style={{ marginTop: "12px" }}>
          <AlertCircle size={14} />
          <span>{applyNotice}</span>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="details-2col-layout">

        {/* Left Column: AI Reasoning & Role Description */}
        <div className="details-main-column">

          {/* AI Match Reasoning Explanation Card */}
          <section className="details-card-section">
            <div className="section-card-title flex-between" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} className="text-indigo" />
                <h3>AI Match Analysis</h3>
              </div>
              <button
                type="button"
                className="secondary-action-btn"
                onClick={handleRefreshExplanation}
                disabled={explaining}
                style={{ padding: "4px 10px", fontSize: "12px" }}
              >
                <RefreshCw size={13} className={explaining ? "spin" : ""} />
                <span>{explaining ? "Refining..." : "Re-Analyze"}</span>
              </button>
            </div>

            <MatchExplanation
              explanation={matchData.explanation}
              reasons={matchData.reasons}
              recommendation={matchData.recommendation}
            />
          </section>

          {/* Description Card */}
          <section className="details-card-section">
            <div className="section-card-title">
              <Briefcase size={18} />
              <h3>Role Description</h3>
            </div>
            <div className="description-content">
              <p>{description}</p>
            </div>
          </section>

          {/* Requirements List */}
          {requirements.length > 0 && (
            <section className="details-card-section">
              <div className="section-card-title">
                <CheckCircle2 size={18} />
                <h3>Requirements & Technical Skills</h3>
              </div>

              <div className="requirements-list-wrap">
                {requirements.map((req, idx) => (
                  <div key={idx} className="requirement-pill-item">
                    <span className="bullet-dot">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Sidebar Column */}
        <div className="details-side-column">

          {/* Score Category Breakdown */}
          <MatchBreakdown breakdown={matchData.breakdown} overallScore={score} />

          {/* Skills Matrix Box */}
          <div className="quick-summary-card">
            <h4>Skills Alignment Matrix</h4>
            <div className="card-skills-matrix" style={{ marginTop: "10px" }}>
              {(matchData.matchedSkills || []).map((skill, idx) => (
                <span key={idx} className="skill-chip matched-chip">
                  <CheckCircle2 size={12} />
                  {skill}
                </span>
              ))}

              {(matchData.missingSkills || []).map((skill, idx) => (
                <span key={idx} className="skill-chip missing-chip">
                  + {skill}
                </span>
              ))}
            </div>

            {isUrlValid ? (
              <button type="button" className="full-apply-btn" onClick={handleApply} style={{ marginTop: "16px" }}>
                <span>Apply on Official Portal</span>
                <ExternalLink size={16} />
              </button>
            ) : (
              <div className="no-url-notice" style={{ marginTop: "16px" }}>
                Direct application URL not available for this role.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default MatchDetails;
