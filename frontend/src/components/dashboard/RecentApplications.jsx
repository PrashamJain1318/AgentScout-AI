import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookmarkCheck,
  Building,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { getApplications } from "../../services/applications.api";

const getStatusClass = (status) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "applied": return "status-badge status-applied";
    case "interview":
    case "interviewing": return "status-badge status-interview";
    case "offer":
    case "accepted": return "status-badge status-offer";
    case "rejected": return "status-badge status-rejected";
    case "withdrawn": return "status-badge status-withdrawn";
    default: return "status-badge status-saved";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "Recently";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const RecentApplications = ({ initialApplications = null }) => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState(initialApplications);
  const [loading, setLoading] = useState(!initialApplications);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await getApplications();
      const list = resData.applications || resData.data || resData || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      setError("Unable to load recent applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialApplications) {
      fetchApplications();
    }
  }, [initialApplications]);

  if (loading) {
    return (
      <div className="recent-applications-card skeleton-card" style={{ minHeight: "240px" }}>
        <div className="skeleton-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-applications-card error-card">
        <div className="inline-error-state">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={fetchApplications} className="retry-btn">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Sort newest updated applications first
  const sortedApplications = Array.isArray(applications)
    ? [...applications].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.appliedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.appliedAt || b.createdAt || 0);
        return dateB - dateA;
      })
    : [];

  return (
    <section className="recent-applications-card" role="region" aria-label="Recent Applications Tracker">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">APPLICATION TRACKER</span>
          <h3>Recent Applications</h3>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={() => navigate("/applications")}
        >
          <span>View All Applications ({sortedApplications.length})</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {sortedApplications.length === 0 ? (
        <div className="empty-state-box">
          <BookmarkCheck size={32} className="empty-icon" />
          <h4>No Applications Tracked Yet</h4>
          <p>Start saving and tracking your job applications to manage your active candidate pipeline.</p>
          <button
            type="button"
            className="primary-action-btn"
            onClick={() => navigate("/opportunities")}
          >
            Explore Opportunities
          </button>
        </div>
      ) : (
        <div className="applications-container">
          {/* Desktop/Tablet Table View */}
          <div className="desktop-table-view">
            <table className="recent-apps-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Opportunity Title</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Updated</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.slice(0, 5).map((app) => {
                  const company = app.company || app.opportunityId?.company || "Company";
                  const title = app.jobTitle || app.opportunityId?.title || "Role";
                  const location = app.location || app.opportunityId?.location || "Remote";
                  const status = app.status || "Saved";
                  const appliedDate = formatDate(app.appliedAt || app.createdAt);
                  const updatedDate = formatDate(app.updatedAt);

                  return (
                    <tr key={app._id || app.id}>
                      <td className="cell-company">
                        <div className="company-cell-flex">
                          <Building size={16} className="cell-icon" />
                          <span>{company}</span>
                        </div>
                      </td>
                      <td className="cell-title">{title}</td>
                      <td className="cell-location">
                        <div className="location-cell-flex">
                          <MapPin size={13} className="cell-icon" />
                          <span>{location}</span>
                        </div>
                      </td>
                      <td>
                        <span className={getStatusClass(status)}>
                          {status}
                        </span>
                      </td>
                      <td className="cell-date">
                        <Calendar size={12} className="cell-icon" />
                        <span>{appliedDate}</span>
                      </td>
                      <td className="cell-date">
                        <Clock size={12} className="cell-icon" />
                        <span>{updatedDate}</span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="view-app-btn"
                          onClick={() => navigate("/applications")}
                          title="View Application Details"
                          aria-label={`View details for ${title} at ${company}`}
                        >
                          <span>Details</span>
                          <ExternalLink size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-cards-view">
            {sortedApplications.slice(0, 5).map((app) => {
              const company = app.company || app.opportunityId?.company || "Company";
              const title = app.jobTitle || app.opportunityId?.title || "Role";
              const location = app.location || app.opportunityId?.location || "Remote";
              const status = app.status || "Saved";
              const updatedDate = formatDate(app.updatedAt);

              return (
                <div key={app._id || app.id} className="app-mobile-card">
                  <div className="app-mobile-top">
                    <div>
                      <h4>{title}</h4>
                      <span className="app-mobile-company">{company}</span>
                    </div>

                    <span className={getStatusClass(status)}>{status}</span>
                  </div>

                  <div className="app-mobile-meta">
                    <span>
                      <MapPin size={12} /> {location}
                    </span>
                    <span>
                      <Clock size={12} /> {updatedDate}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="view-app-btn-mobile"
                    onClick={() => navigate("/applications")}
                  >
                    <span>View Application Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default RecentApplications;
