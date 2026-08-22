import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Building,
  ExternalLink,
  ArrowLeft,
  BookmarkCheck,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  CheckSquare,
  Brain,
} from "lucide-react";

import AIInsightCard from "../components/opportunities/AIInsightCard";
import ResumeOpportunityMatch from "../components/resume/ResumeOpportunityMatch";

import {
  getOpportunityById,
} from "../services/opportunities.api";

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

const formatPostedDate = (dateString) => {
  if (!dateString) return "Recently posted";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently posted";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applyNotice, setApplyNotice] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const resData = await getOpportunityById(id);
      const opp = resData.opportunity || resData.data || resData || null;

      if (!opp) {
        setError("Opportunity not found.");
        return;
      }

      setOpportunity(opp);
      setIsSaved(Boolean(opp.isSaved));

      try {
        const appRes = await getApplications();
        const apps = appRes.applications || appRes.data || [];
        const hasApplied = apps.some(
          (a) => (a.opportunity?._id || a.opportunity) === id
        );
        setIsApplied(hasApplied);
      } catch (e) {
        // Fallback
      }
    } catch (err) {
      setError("Unable to load opportunity details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleApply = async () => {
    if (!opportunity) return;
    setApplyNotice(null);

    const targetUrl = opportunity.applicationUrl || opportunity.jobUrl;

    if (!isValidExternalUrl(targetUrl)) {
      setApplyNotice(
        "Notice: The external job URL is unverified. Opening application link..."
      );
    }

    try {
      if (!isApplied) {
        await createApplication({
          opportunity: opportunity._id || opportunity.id,
          jobTitle: opportunity.title,
          company: opportunity.company,
          location: opportunity.location,
          jobType: opportunity.type,
          workMode: opportunity.remote ? "Remote" : "On-site",
          jobUrl: targetUrl,
          matchScore: opportunity.matchScore || opportunity.score || 0,
          status: "applied",
          appliedAt: new Date().toISOString(),
          applicationUrl: targetUrl,
        });
        setIsApplied(true);
      }
    } catch (err) {
      // Continue to open URL even if app creation fails
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

  if (error || !opportunity) {
    return (
      <div className="opportunity-details-page">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/opportunities")}
        >
          <ArrowLeft size={16} />
          <span>Back to Opportunities</span>
        </button>

        <div className="inline-error-state" style={{ marginTop: "24px" }}>
          <AlertCircle size={24} />
          <h4>{error || "Opportunity Not Found"}</h4>
          <button type="button" onClick={fetchDetails} className="retry-btn">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    company,
    location = "Remote",
    type = "full-time",
    remote = false,
    description = "",
    requirements = [],
    matchedSkills = [],
    missingSkills = [],
    matchScore = 0,
    applicationUrl = "",
    jobUrl = "",
    source = "",
    postedAt,
    createdAt,
  } = opportunity;

  const validUrl = applicationUrl || jobUrl;
  const isUrlValid = isValidExternalUrl(validUrl);

  return (
    <div className="opportunity-details-page">
      {/* Back Navigation Bar */}
      <div className="details-top-bar flex-between">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/opportunities")}
        >
          <ArrowLeft size={16} />
          <span>Back to Opportunities</span>
        </button>

        <div className="details-header-actions flex-between" style={{ gap: "10px" }}>
          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => navigate(`/dashboard/interview-coach?opportunity=${id}`)}
          >
            <Brain size={16} className="text-primary" />
            <span>Practice Interview with AI</span>
          </button>

          <button
            type="button"
            className="save-profile-btn"
            onClick={() => navigate(`/dashboard/application-assistant?opportunity=${id}`)}
          >
            <CheckSquare size={16} />
            <span>Prepare with AI</span>
          </button>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => setShowResumeModal(true)}
          >
            <FileText size={16} className="text-primary" />
            <span>Analyze My Resume Fit</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="details-hero-banner flex-between">
        <div className="hero-left">
          <div className="company-logo-placeholder font-bold">
            {company ? company.charAt(0).toUpperCase() : "C"}
          </div>

          <div className="hero-info">
            <h2>{title}</h2>
            <div className="hero-meta-row flex-between" style={{ gap: "12px" }}>
              <span className="meta-company">{company}</span>
              <span className="dot">•</span>
              <span className="meta-location">
                <MapPin size={14} /> {location}
              </span>
              <span className="dot">•</span>
              <span className="meta-badge">{type}</span>
              {remote && <span className="meta-badge remote">Remote</span>}
            </div>
          </div>
        </div>

        <div className="hero-right flex-between" style={{ gap: "12px" }}>
          {isApplied ? (
            <span className="applied-status-badge">
              <CheckCircle2 size={16} /> Applied
            </span>
          ) : isUrlValid ? (
            <button type="button" className="primary-action-btn apply-now-btn" onClick={handleApply}>
              <span>Apply Now</span>
              <ExternalLink size={16} />
            </button>
          ) : (
            <button type="button" className="primary-action-btn disabled" disabled>
              <span>Application Link Unavailable</span>
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

      {/* 2-Column Details Layout */}
      <div className="details-2col-layout">
        <div className="details-main-column">
          <section className="details-card-section">
            <div className="section-card-title">
              <Briefcase size={18} />
              <h3>Job Description</h3>
            </div>

            <div className="description-content">
              {description ? (
                description.split("\n\n").map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p>No detailed description provided for this opportunity.</p>
              )}
            </div>
          </section>

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

        <div className="details-side-column">
          <AIInsightCard
            opportunity={opportunity}
            matchData={{
              score: matchScore || opportunity.score || 0,
              matchedSkills,
              missingSkills,
            }}
          />

          <div className="quick-summary-card">
            <h4>Ready to Apply?</h4>
            <p>You will be redirected to the official hiring source page to complete your application.</p>

            {isUrlValid ? (
              <button type="button" className="full-apply-btn" onClick={handleApply}>
                <span>Apply on Official Portal</span>
                <ExternalLink size={16} />
              </button>
            ) : (
              <div className="no-url-notice">This opportunity's application link is currently unavailable.</div>
            )}
          </div>
        </div>
      </div>

      {showResumeModal && (
        <ResumeOpportunityMatch
          opportunityId={id}
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </div>
  );
};

export default OpportunityDetails;
