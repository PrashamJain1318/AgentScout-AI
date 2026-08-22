import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  MapPin,
  Globe,
  Briefcase,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";
import {
  getApplication,
  updateApplication,
  deleteApplication,
} from "../services/applications.api";
import ApplicationStatusBadge from "../components/applications/ApplicationStatusBadge";
import ApplicationTimeline from "../components/applications/ApplicationTimeline";
import ApplicationForm from "../components/applications/ApplicationForm";
import ApplicationDetailsSkeleton from "../components/applications/ApplicationDetailsSkeleton";
import { isValidExternalUrl, getCleanExternalUrl } from "../utils/url";

const formatDate = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status & Notes editing state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Edit Form Modal & Delete Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast Feedback Notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await getApplication(id);
      const app = resData.application || resData.data || null;
      if (!app) {
        setError("Application record not found.");
      } else {
        setApplication(app);
        setNotesText(app.notes || "");
      }
    } catch (err) {
      setError("Unable to load application details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  // Handle Quick Status Dropdown Change
  const handleStatusChange = async (newStatus) => {
    if (!application || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const updatedData = await updateApplication(id, { status: newStatus });
      const updatedApp = updatedData.application || updatedData.data;
      if (updatedApp) {
        setApplication(updatedApp);
      } else {
        setApplication((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Status updated to ${newStatus.toUpperCase()}!`);
    } catch (err) {
      showToast("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Save Notes
  const handleSaveNotes = async () => {
    if (!application || savingNotes) return;
    setSavingNotes(true);
    try {
      await updateApplication(id, { notes: notesText });
      setApplication((prev) => ({ ...prev, notes: notesText }));
      showToast("Application notes saved.");
    } catch (err) {
      showToast("Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle Edit Form Submission
  const handleFormSubmit = async (formData) => {
    setSubmittingForm(true);
    try {
      const resData = await updateApplication(id, formData);
      const updated = resData.application || resData.data;
      setApplication(updated);
      setIsFormOpen(false);
      showToast("Application details updated!");
    } catch (err) {
      showToast("Failed to update application.");
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteApplication(id);
      showToast("Application deleted.");
      navigate("/applications", { replace: true });
    } catch (err) {
      showToast("Failed to delete application.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="opportunity-details-page">
        <button type="button" onClick={() => navigate("/applications")} className="back-nav-btn">
          <ArrowLeft size={16} /> Back to Applications
        </button>
        <ApplicationDetailsSkeleton />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="opportunity-details-page">
        <button type="button" onClick={() => navigate("/applications")} className="back-nav-btn">
          <ArrowLeft size={16} /> Back to Applications
        </button>

        <div className="empty-state-box" style={{ marginTop: "24px" }}>
          <AlertCircle size={36} className="empty-icon text-danger" />
          <h4>Unable to Load Application</h4>
          <p>{error || "The requested application record could not be found."}</p>
          <button type="button" onClick={() => navigate("/applications")} className="primary-action-btn">
            View All Applications
          </button>
        </div>
      </div>
    );
  }

  const opp = application.opportunity || {};
  const title = application.jobTitle || opp.title || "Software Engineer";
  const company = application.company || opp.company || "Company";
  const location = application.location || opp.location || "Remote";
  const remote = opp.remote || application.workMode === "remote";
  const type = application.jobType || opp.type || "full-time";
  const description = opp.description || "Tracked candidate application.";
  const requirements = Array.isArray(opp.requirements) ? opp.requirements : [];

  const rawUrl = application.jobUrl || application.applicationUrl || opp.applicationUrl || "";
  const targetUrl = getCleanExternalUrl(rawUrl);
  const isUrlValid = isValidExternalUrl(targetUrl);
  const score = application.matchScore || opp.matchScore || application.score || 85;

  return (
    <div className="opportunity-details-page">

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="notification-banner success-banner" style={{ marginBottom: "16px" }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Navigation Bar */}
      <button type="button" onClick={() => navigate("/applications")} className="back-nav-btn">
        <ArrowLeft size={16} /> Back to Applications
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
          <button type="button" className="secondary-action-btn" onClick={() => setIsFormOpen(true)}>
            <Edit2 size={16} />
            <span>Edit</span>
          </button>

          <button type="button" className="action-icon-btn danger" onClick={() => setShowDeleteConfirm(true)} title="Delete Application">
            <Trash2 size={16} />
          </button>

          {isUrlValid && (
            <button
              type="button"
              className="save-profile-btn"
              onClick={() => window.open(targetUrl, "_blank", "noopener,noreferrer")}
            >
              <span>Open Job</span>
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Details Layout */}
      <div className="details-2col-layout">

        {/* Left / Main Column */}
        <div className="details-main-column">

          {/* Description & Requirements Section */}
          <section className="details-card-section">
            <div className="section-card-title">
              <Briefcase size={18} />
              <h3>Job & Application Overview</h3>
            </div>

            <div className="description-content">
              <p>{description}</p>
            </div>
          </section>

          {requirements.length > 0 && (
            <section className="details-card-section">
              <div className="section-card-title">
                <CheckCircle2 size={18} />
                <h3>Requirements</h3>
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

          {/* Candidate Notes Card */}
          <section className="details-card-section">
            <div className="section-card-title flex-between" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Save size={18} />
                <h3>Application Notes</h3>
              </div>
              <button
                type="button"
                className="save-profile-btn"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{ padding: "4px 12px", fontSize: "12px" }}
              >
                {savingNotes ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                <span>Save Notes</span>
              </button>
            </div>

            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Add key interview questions, recruiter contact info, or follow-up dates..."
              rows={5}
              className="textarea-control"
              style={{ marginTop: "12px" }}
            />
          </section>

        </div>

        {/* Right / Sidebar Column */}
        <div className="details-side-column">

          {/* Status & Stage Selector Card */}
          <div className="quick-summary-card">
            <div className="flex-between">
              <h4>Pipeline Stage</h4>
              <ApplicationStatusBadge status={application.status} />
            </div>

            <div className="input-group" style={{ marginTop: "12px" }}>
              <label htmlFor="stage-selector">Update Stage</label>
              <select
                id="stage-selector"
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="select-control"
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="overview-details-grid" style={{ marginTop: "14px" }}>
              <div className="overview-item">
                <span>Match Score</span>
                <strong style={{ color: "var(--primary)" }}>{score}% Match</strong>
              </div>
              <div className="overview-item">
                <span>Applied Date</span>
                <strong>{formatDate(application.appliedAt || application.createdAt)}</strong>
              </div>
            </div>
          </div>

          {/* Application Pipeline Timeline */}
          <ApplicationTimeline
            timeline={application.timeline}
            currentStatus={application.status}
            createdAt={application.createdAt}
          />

        </div>

      </div>

      {/* Edit Application Form Modal */}
      <ApplicationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={application}
        isEditing={true}
        submitting={submittingForm}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-container dark-modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete this application?</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete your application for <strong>{title}</strong> at <strong>{company}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary-action-btn" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="retry-btn danger-solid" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Application"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicationDetails;
