import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Globe,
  Award,
  CheckCircle2,
  Edit,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { getUserProfile } from "../../services/user.api";

// Profile completion calculator helper
const calculateProfileStrength = (user) => {
  if (!user) return { percentage: 0, label: "Beginner" };
  let score = 0;
  if (user.firstName) score += 15;
  if (user.lastName) score += 15;
  if (user.email) score += 20;

  const p = user.profile || {};
  if (p.targetRole || p.headline) score += 20;
  if (Array.isArray(p.skills) && p.skills.length > 0) score += 15;
  if (p.location) score += 15;

  const pct = Math.min(100, score);
  let label = "Beginner";
  if (pct >= 85) label = "All-Star";
  else if (pct >= 60) label = "Intermediate";

  return { percentage: pct, label };
};

const ProfileSummaryCard = ({ initialData = null }) => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile();
      setUserData(data.user || data.data || data);
    } catch (err) {
      setError("Unable to load profile summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchProfileData();
    }
  }, [initialData]);

  if (loading) {
    return (
      <div className="profile-summary-card skeleton-card" style={{ height: "260px" }}>
        <div className="skeleton-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-summary-card error-card">
        <div className="inline-error-state">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={fetchProfileData} className="retry-btn">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract Profile Fields
  const firstName = userData?.firstName || "Candidate";
  const lastName = userData?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = userData?.email || "N/A";

  const p = userData?.profile || {};
  const headline = p.headline || p.targetRole || "Software Engineer / Candidate";
  const location = p.location || "Location not set";
  const bio = p.bio || p.biography || "";
  const skills = Array.isArray(p.skills) ? p.skills : [];
  const desiredRoles = Array.isArray(p.preferences?.desiredRoles) ? p.preferences.desiredRoles : [];
  const remotePreference = p.preferences?.remotePreference;

  const strength = calculateProfileStrength(userData);

  return (
    <section className="profile-summary-card" role="region" aria-label="Profile Summary Card">
      <div className="card-header">
        <div className="user-avatar-initials">
          {firstName.charAt(0).toUpperCase()}
        </div>

        <div className="user-identity">
          <h3>{fullName}</h3>
          <span className="user-headline">{headline}</span>
        </div>

        <button
          type="button"
          className="edit-profile-icon-btn"
          onClick={() => navigate("/dashboard/profile")}
          title="Edit Profile"
          aria-label="Edit candidate profile"
        >
          <Edit size={15} />
        </button>
      </div>

      {/* Profile Strength Progress Bar */}
      <div className="profile-completion-widget">
        <div className="widget-header">
          <span>Profile Strength: <strong>{strength.label}</strong></span>
          <strong>{strength.percentage}%</strong>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      {/* Profile Info Details */}
      <div className="profile-info-rows">
        <div className="info-row">
          <Mail size={14} className="info-icon" />
          <span>{email}</span>
        </div>

        <div className="info-row">
          <MapPin size={14} className="info-icon" />
          <span>{location}</span>
        </div>

        {remotePreference !== undefined && (
          <div className="info-row">
            <Globe size={14} className="info-icon" />
            <span>{remotePreference ? "Remote / Hybrid Preferred" : "On-site Preferred"}</span>
          </div>
        )}
      </div>

      {/* Bio Preview */}
      {bio && (
        <div className="bio-preview">
          <p>"{bio.length > 110 ? `${bio.substring(0, 110)}...` : bio}"</p>
        </div>
      )}

      {/* Skills Preview */}
      {skills.length > 0 && (
        <div className="card-skills-section">
          <span className="skills-label">
            <Award size={13} /> Top Skills
          </span>
          <div className="skills-pills-list">
            {skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="summary-skill-pill">
                <CheckCircle2 size={11} /> {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="summary-skill-pill extra">+{skills.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Action CTA */}
      <button
        type="button"
        className="full-edit-profile-btn"
        onClick={() => navigate("/dashboard/profile")}
      >
        <span>Manage Full Profile</span>
        <ArrowRight size={15} />
      </button>
    </section>
  );
};

export default ProfileSummaryCard;
