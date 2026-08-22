import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Award,
  Send,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  getApplications,
  getApplicationAnalytics,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../services/applications.api";
import ApplicationStatusBadge from "../components/applications/ApplicationStatusBadge";
import ApplicationForm from "../components/applications/ApplicationForm";
import ApplicationTableSkeleton from "../components/applications/ApplicationTableSkeleton";
import ApplicationCardSkeleton from "../components/applications/ApplicationCardSkeleton";
import { isValidExternalUrl, getCleanExternalUrl } from "../utils/url";

const getCompanyInitials = (name = "") => {
  if (!name) return "CO";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const Applications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Controls State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchAppData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, analyticsRes] = await Promise.allSettled([
        getApplications({ status: statusFilter, jobType: jobTypeFilter, search: searchTerm, sort: sortOption }),
        getApplicationAnalytics(),
      ]);

      if (listRes.status === "fulfilled") {
        const list = listRes.value.applications || listRes.value.data || [];
        setApplications(Array.isArray(list) ? list : []);
      } else {
        setError("Unable to load applications list.");
      }

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value.analytics || null);
      }
    } catch (err) {
      setError("Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, [statusFilter, jobTypeFilter, sortOption]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppData();
  };

  // Form Submit Handler (Add / Edit)
  const handleFormSubmit = async (formData) => {
    setSubmittingForm(true);
    try {
      if (editingApp) {
        const appId = editingApp._id || editingApp.id;
        await updateApplication(appId, formData);
        showToast("Application updated successfully!");
      } else {
        await createApplication(formData);
        showToast("Application added to pipeline!");
      }
      setIsFormOpen(false);
      setEditingApp(null);
      await fetchAppData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save application.");
    } finally {
      setSubmittingForm(false);
    }
  };

  // Delete Application Handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const appId = deleteTarget._id || deleteTarget.id;
      await deleteApplication(appId);
      showToast("Application deleted successfully.");
      setDeleteTarget(null);
      await fetchAppData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete application.");
    } finally {
      setDeleting(false);
    }
  };

  // Calculate Overview KPI Stats
  const overview = analytics?.overview || {};
  const totalAppsCount = applications.length;
  const appliedCount = overview.applied || applications.filter((a) => a.status === "applied").length;
  const interviewCount = overview.interview || applications.filter((a) => a.status === "interview" || a.status === "screening").length;
  const offerCount = overview.offer || applications.filter((a) => a.status === "offer" || a.status === "accepted").length;
  const rejectedCount = overview.rejected || applications.filter((a) => a.status === "rejected").length;

  // Filter applications list client-side for dynamic responsiveness
  const filteredApps = applications.filter((app) => {
    const opp = app.opportunity || {};
    const title = (app.jobTitle || opp.title || "").toLowerCase();
    const comp = (app.company || opp.company || "").toLowerCase();
    const loc = (app.location || opp.location || "").toLowerCase();
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch = !query || title.includes(query) || comp.includes(query) || loc.includes(query);
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesJobType = jobTypeFilter === "all" || (app.jobType || opp.type) === jobTypeFilter;

    return matchesSearch && matchesStatus && matchesJobType;
  });

  // Client-side sorting
  filteredApps.sort((a, b) => {
    const oppA = a.opportunity || {};
    const oppB = b.opportunity || {};
    if (sortOption === "oldest") {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortOption === "company-az") {
      return (a.company || oppA.company || "").localeCompare(b.company || oppB.company || "");
    }
    if (sortOption === "company-za") {
      return (b.company || oppB.company || "").localeCompare(a.company || oppA.company || "");
    }
    return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
  });

  return (
    <div className="applications-page">

      {/* Success Notification Banner */}
      {toastMessage && (
        <div className="notification-banner success-banner">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="page-header-banner flex-between">
        <div>
          <span className="eyebrow">CAREER PIPELINE TRACKER</span>
          <h2>Applications</h2>
          <p>Track every career opportunity from initial save to final offer.</p>
        </div>

        <button
          type="button"
          className="save-profile-btn"
          onClick={() => {
            setEditingApp(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={16} />
          <span>Add Application</span>
        </button>
      </div>

      {/* Summary KPI Statistics Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper search-icon">
            <Briefcase size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Applications</span>
            <strong className="kpi-value">{loading ? "..." : totalAppsCount}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper app-icon">
            <Send size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Applied</span>
            <strong className="kpi-value">{loading ? "..." : appliedCount}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper match-icon">
            <Users size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Interviews</span>
            <strong className="kpi-value">{loading ? "..." : interviewCount}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper offer-icon">
            <Award size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Offers</span>
            <strong className="kpi-value">{loading ? "..." : offerCount}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper rejected-icon">
            <XCircle size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Rejected</span>
            <strong className="kpi-value">{loading ? "..." : rejectedCount}</strong>
          </div>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="applications-controls-bar">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="search-field-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company, job title, location..."
            aria-label="Search applications"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="match-level-tabs">
          {[
            { id: "all", label: "All Statuses" },
            { id: "saved", label: "Saved" },
            { id: "applied", label: "Applied" },
            { id: "screening", label: "Screening" },
            { id: "interview", label: "Interview" },
            { id: "offer", label: "Offer" },
            { id: "accepted", label: "Accepted" },
            { id: "rejected", label: "Rejected" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              className={`match-tab-btn ${statusFilter === st.id ? "active" : ""}`}
              onClick={() => setStatusFilter(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="match-sort-box">
          <ArrowUpDown size={14} className="sort-icon" />
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} aria-label="Sort applications">
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="company-az">Sort: Company (A-Z)</option>
            <option value="company-za">Sort: Company (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <ApplicationTableSkeleton />
      ) : error ? (
        <div className="inline-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button type="button" onClick={fetchAppData} className="retry-btn">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state-box">
          <Briefcase size={36} className="empty-icon" />
          <h4>No Applications Yet</h4>
          <p>Start tracking your career journey by adding your first application to the pipeline.</p>
          <button
            type="button"
            className="primary-action-btn"
            onClick={() => {
              setEditingApp(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add Your First Application</span>
          </button>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="empty-state-box">
          <Search size={32} className="empty-icon" />
          <h4>No Matching Applications</h4>
          <p>No applications match your active search query or filter selection.</p>
          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setJobTypeFilter("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Opportunity & Company</th>
                <th>Location & Type</th>
                <th>Pipeline Status</th>
                <th>Match Score</th>
                <th>Applied Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const appId = app._id || app.id;
                const opp = app.opportunity || {};
                const title = app.jobTitle || opp.title || "Opportunity";
                const company = app.company || opp.company || "Company";
                const location = app.location || opp.location || "Remote";
                const score = app.matchScore || opp.matchScore || app.score || 85;
                const rawUrl = app.jobUrl || app.applicationUrl || opp.applicationUrl || "";
                const targetUrl = getCleanExternalUrl(rawUrl);
                const isUrlValid = isValidExternalUrl(targetUrl);

                return (
                  <tr key={appId} onClick={() => navigate(`/applications/${appId}`)} className="table-row-clickable">
                    <td>
                      <div className="table-company-cell">
                        <div className="company-logo-mark">
                          {getCompanyInitials(company)}
                        </div>
                        <div>
                          <strong className="role-title-text">{title}</strong>
                          <span className="company-subtext">{company}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="meta-cell">
                        <span><MapPin size={13} /> {location}</span>
                        <span className="type-subtext">{app.jobType || opp.type || "full-time"}</span>
                      </div>
                    </td>

                    <td>
                      <ApplicationStatusBadge status={app.status} />
                    </td>

                    <td>
                      <span className="score-chip font-bold">
                        <Sparkles size={12} className="text-amber" />
                        {score}%
                      </span>
                    </td>

                    <td>
                      <span className="date-cell-text">
                        <Calendar size={13} /> {formatDate(app.appliedAt || app.createdAt)}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => navigate(`/applications/${appId}`)}
                          title="View Application Details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => {
                            setEditingApp(app);
                            setIsFormOpen(true);
                          }}
                          title="Edit Application"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          type="button"
                          className="action-icon-btn danger"
                          onClick={() => setDeleteTarget(app)}
                          title="Delete Application"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Application Modal Form */}
      <ApplicationForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingApp}
        isEditing={Boolean(editingApp)}
        submitting={submittingForm}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-container dark-modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete this application?</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete your application for <strong>{deleteTarget.jobTitle || deleteTarget.opportunity?.title || "this role"}</strong> at <strong>{deleteTarget.company || deleteTarget.opportunity?.company || "Company"}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary-action-btn" onClick={() => setDeleteTarget(null)} disabled={deleting}>
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

export default Applications;
