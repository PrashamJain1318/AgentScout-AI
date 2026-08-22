import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Globe,
  Loader2,
  MapPin,
  FileText,
} from "lucide-react";
import { getUserProfile, updateUserProfile } from "../services/user.api";

// Calculate dynamic profile completion percentage
const calculateProfileCompletion = (formData) => {
  let score = 0;
  if (formData.firstName?.trim()) score += 15;
  if (formData.lastName?.trim()) score += 15;
  if (formData.email?.trim()) score += 15;
  if (formData.headline?.trim()) score += 15;
  if (formData.bio?.trim()) score += 15;
  if (formData.location?.trim()) score += 10;
  if (Array.isArray(formData.skills) && formData.skills.length > 0) score += 15;
  return Math.min(100, score);
};

const Profile = () => {
  const { user, checkAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    headline: "",
    bio: "",
    location: "",
    skills: [],
    experience: [],
    education: [],
    desiredRoles: [],
    preferredLocations: [],
    remotePreference: true,
  });

  // Pristine Data snapshot for dirty-state detection and revert functionality
  const [pristineData, setPristineData] = useState(null);

  // Input states for array tags
  const [skillInput, setSkillInput] = useState("");
  const [desiredRoleInput, setDesiredRoleInput] = useState("");
  const [preferredLocationInput, setPreferredLocationInput] = useState("");

  // Fetch Profile Data from GET /api/users/profile
  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const resData = await getUserProfile();
      const u = resData.user || resData || user || {};
      const p = u.profile || {};
      const prefs = p.preferences || {};

      const loadedData = {
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email || "",
        headline: p.headline || "",
        bio: p.bio || p.biography || "",
        location: p.location || "",
        skills: Array.isArray(p.skills) ? p.skills : [],
        experience: Array.isArray(p.experience) ? p.experience : [],
        education: Array.isArray(p.education) ? p.education : [],
        desiredRoles: Array.isArray(prefs.desiredRoles) ? prefs.desiredRoles : [],
        preferredLocations: Array.isArray(prefs.preferredLocations) ? prefs.preferredLocations : [],
        remotePreference: typeof prefs.remotePreference === "boolean" ? prefs.remotePreference : true,
      };

      setFormData(loadedData);
      setPristineData(JSON.stringify(loadedData));
    } catch (err) {
      setErrorMessage("Failed to load candidate profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Dirty State Detection
  const isDirty = pristineData !== null && JSON.stringify(formData) !== pristineData;
  const completionPercentage = calculateProfileCompletion(formData);

  // Dynamic Initials Avatar
  const getInitials = () => {
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    if (fn && ln) return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
    if (fn) return fn.charAt(0).toUpperCase();
    return "PJ";
  };

  // Handle Primitive Input Changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Skills Handlers ---
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // --- Desired Roles Handlers ---
  const handleAddDesiredRole = (e) => {
    e.preventDefault();
    const trimmed = desiredRoleInput.trim();
    if (trimmed && !formData.desiredRoles.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, desiredRoles: [...prev.desiredRoles, trimmed] }));
      setDesiredRoleInput("");
    }
  };

  const handleRemoveDesiredRole = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      desiredRoles: prev.desiredRoles.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // --- Preferred Locations Handlers ---
  const handleAddPreferredLocation = (e) => {
    e.preventDefault();
    const trimmed = preferredLocationInput.trim();
    if (trimmed && !formData.preferredLocations.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, preferredLocations: [...prev.preferredLocations, trimmed] }));
      setPreferredLocationInput("");
    }
  };

  const handleRemovePreferredLocation = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferredLocations: prev.preferredLocations.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // --- Experience Array Handlers ---
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: "", role: "", startDate: "", endDate: "", description: "" },
      ],
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index),
    }));
  };

  // --- Education Array Handlers ---
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: "", degree: "", field: "", startYear: "", endYear: "" },
      ],
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index),
    }));
  };

  // --- Revert System ---
  const handleRevert = () => {
    if (pristineData) {
      setFormData(JSON.parse(pristineData));
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };

  // --- Form Submission (PUT /api/users/profile) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSuccessMessage(null);
    setErrorMessage(null);

    // Form Validation
    if (!formData.firstName.trim()) {
      setErrorMessage("First Name is required.");
      return;
    }
    if (!formData.lastName.trim()) {
      setErrorMessage("Last Name is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        profile: {
          headline: formData.headline.trim(),
          bio: formData.bio.trim(),
          biography: formData.bio.trim(),
          location: formData.location.trim(),
          skills: formData.skills,
          experience: formData.experience,
          education: formData.education,
          preferences: {
            desiredRoles: formData.desiredRoles,
            preferredLocations: formData.preferredLocations,
            remotePreference: formData.remotePreference,
          },
        },
      };

      const resData = await updateUserProfile(payload);

      if (resData.success) {
        setSuccessMessage("Profile updated successfully!");
        setPristineData(JSON.stringify(formData));
        if (checkAuth) checkAuth(); // Refresh global auth context
      } else {
        setErrorMessage(resData.message || "Failed to update profile.");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "An error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="skeleton-card" style={{ height: "120px" }} />
        <div className="skeleton-card" style={{ height: "240px" }} />
        <div className="skeleton-card" style={{ height: "280px" }} />
      </div>
    );
  }

  return (
    <div className="profile-page-container">

      {/* 1. Main Profile Header Banner Card */}
      <div className="profile-header-banner">
        <div className="profile-avatar-title-group">
          <div className="user-avatar-hero">
            {getInitials()}
          </div>

          <div className="user-banner-title">
            <span className="eyebrow">CANDIDATE PROFILE</span>
            <h2>
              {formData.firstName} {formData.lastName}
            </h2>
            <p>{formData.headline || "Add your professional headline to boost recruiter matches."}</p>
          </div>
        </div>

        <div className="profile-header-right-side">
          {/* Profile Completion Indicator */}
          <div className="profile-completion-header-box">
            <div className="completion-info-row">
              <span>Profile Completion</span>
              <strong>{completionPercentage}%</strong>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-action-bar">
            {isDirty && (
              <span className="unsaved-badge">
                <Sparkles size={12} /> Unsaved Changes
              </span>
            )}

            <button
              type="button"
              className="secondary-action-btn"
              onClick={handleRevert}
              disabled={!isDirty || saving}
              title="Revert to last saved profile"
            >
              <RotateCcw size={15} /> Revert
            </button>

            <button
              type="submit"
              form="profile-form"
              className="save-profile-btn"
              disabled={!isDirty || saving}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spinner-icon spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification Banners */}
      {successMessage && (
        <div className="notification-banner success-banner" role="status">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="notification-banner error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Edit Form */}
      <form id="profile-form" onSubmit={handleSubmit} className="profile-form-grid">

        {/* 2. Personal Information Section Card (2-Column Grid) */}
        <section className="form-section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <User size={18} />
              <h3>Personal Information</h3>
            </div>
            <p className="section-subtitle">Basic details defining your candidate identity.</p>
          </div>

          <div className="form-grid-2col">
            <div className="form-field">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="First name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Last name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address (Read-only)</label>
              <div className="input-with-icon">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  readOnly
                />
                <Lock size={14} className="input-icon-lock" />
              </div>
              <span className="field-helper-text">Managed by your authentication account</span>
            </div>

            <div className="form-field">
              <label htmlFor="location">Location</label>
              <div className="input-field-icon-wrapper">
                <MapPin size={16} className="field-left-icon" />
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Professional Overview Card */}
        <section className="form-section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <Briefcase size={18} />
              <h3>Professional Overview</h3>
            </div>
            <p className="section-subtitle">Your professional headline and summary statement.</p>
          </div>

          <div className="form-grid-1col">
            <div className="form-field">
              <label htmlFor="headline">Professional Headline</label>
              <input
                id="headline"
                type="text"
                value={formData.headline}
                onChange={(e) => handleInputChange("headline", e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer | AI Agent Systems"
              />
            </div>

            <div className="form-field">
              <label htmlFor="bio">
                <span>Biography / Summary</span>
                <span className="char-count">{formData.bio.length} / 1000</span>
              </label>
              <textarea
                id="bio"
                rows={4}
                maxLength={1000}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Write a brief overview of your technical background, key accomplishments, and target career goals..."
              />
            </div>
          </div>
        </section>

        {/* 4. Skills & Expertise Card */}
        <section className="form-section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <Award size={18} />
              <h3>Skills & Expertise</h3>
            </div>
            <p className="section-subtitle">Technical skills used to generate AI match scores.</p>
          </div>

          <div className="form-grid-1col">
            <div className="tags-matrix-box">
              <div className="tags-pills-row">
                {formData.skills.length === 0 ? (
                  <span className="empty-tags-hint">No skills added yet. Type a skill below to add it.</span>
                ) : (
                  formData.skills.map((skill, idx) => (
                    <span key={idx} className="interactive-tag-pill">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        title={`Remove ${skill}`}
                        aria-label={`Remove skill ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="add-tag-row">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a new skill (e.g. Python, Docker, React)..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <button type="button" onClick={handleAddSkill} className="add-tag-btn">
                  <Plus size={14} /> Add Skill
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Work Experience Section Card */}
        <section className="form-section-card">
          <div className="section-header-row">
            <div>
              <div className="section-card-title">
                <Briefcase size={18} />
                <h3>Work Experience</h3>
              </div>
              <p className="section-subtitle">Showcase your professional experience and achievements.</p>
            </div>
            <button type="button" onClick={handleAddExperience} className="add-entry-btn">
              <Plus size={14} /> Add Experience
            </button>
          </div>

          {formData.experience.length === 0 ? (
            <div className="empty-section-hint">No work experience entries added yet. Click "+ Add Experience" above to add one.</div>
          ) : (
            <div className="entries-list">
              {formData.experience.map((exp, idx) => (
                <div key={idx} className="entry-card">
                  <div className="entry-card-header">
                    <span>Experience #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="delete-entry-btn"
                      title="Remove experience entry"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-field">
                      <label>Company</label>
                      <input
                        type="text"
                        value={exp.company || ""}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                        placeholder="Company Name"
                      />
                    </div>

                    <div className="form-field">
                      <label>Role / Title</label>
                      <input
                        type="text"
                        value={exp.role || ""}
                        onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                        placeholder="Job Title"
                      />
                    </div>

                    <div className="form-field">
                      <label>Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate || ""}
                        onChange={(e) => handleExperienceChange(idx, "startDate", e.target.value)}
                        placeholder="e.g. Jan 2022"
                      />
                    </div>

                    <div className="form-field">
                      <label>End Date</label>
                      <input
                        type="text"
                        value={exp.endDate || ""}
                        onChange={(e) => handleExperienceChange(idx, "endDate", e.target.value)}
                        placeholder="e.g. Present"
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: "12px" }}>
                    <label>Description & Key Achievements</label>
                    <textarea
                      rows={2}
                      value={exp.description || ""}
                      onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                      placeholder="Summary of responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Education Section Card */}
        <section className="form-section-card">
          <div className="section-header-row">
            <div>
              <div className="section-card-title">
                <GraduationCap size={18} />
                <h3>Education</h3>
              </div>
              <p className="section-subtitle">Academic degrees and institutional qualifications.</p>
            </div>
            <button type="button" onClick={handleAddEducation} className="add-entry-btn">
              <Plus size={14} /> Add Education
            </button>
          </div>

          {formData.education.length === 0 ? (
            <div className="empty-section-hint">No education entries added yet. Click "+ Add Education" above to add one.</div>
          ) : (
            <div className="entries-list">
              {formData.education.map((edu, idx) => (
                <div key={idx} className="entry-card">
                  <div className="entry-card-header">
                    <span>Education #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="delete-entry-btn"
                      title="Remove education entry"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-field">
                      <label>Institution</label>
                      <input
                        type="text"
                        value={edu.institution || ""}
                        onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                        placeholder="University / College Name"
                      />
                    </div>

                    <div className="form-field">
                      <label>Degree</label>
                      <input
                        type="text"
                        value={edu.degree || ""}
                        onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                        placeholder="e.g. Bachelor of Science"
                      />
                    </div>

                    <div className="form-field">
                      <label>Field of Study</label>
                      <input
                        type="text"
                        value={edu.field || ""}
                        onChange={(e) => handleEducationChange(idx, "field", e.target.value)}
                        placeholder="e.g. Computer Science"
                      />
                    </div>

                    <div className="form-grid-2col">
                      <div className="form-field">
                        <label>Start Year</label>
                        <input
                          type="text"
                          value={edu.startYear || ""}
                          onChange={(e) => handleEducationChange(idx, "startYear", e.target.value)}
                          placeholder="e.g. 2018"
                        />
                      </div>
                      <div className="form-field">
                        <label>End Year</label>
                        <input
                          type="text"
                          value={edu.endYear || ""}
                          onChange={(e) => handleEducationChange(idx, "endYear", e.target.value)}
                          placeholder="e.g. 2022"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 7. Career Preferences Section Card */}
        <section className="form-section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <Globe size={18} />
              <h3>Career Preferences</h3>
            </div>
            <p className="section-subtitle">Target roles, location preferences, and remote openness.</p>
          </div>

          <div className="form-grid-1col">
            <div className="form-field">
              <label>Desired Roles</label>
              <div className="tags-matrix-box">
                <div className="tags-pills-row">
                  {formData.desiredRoles.length === 0 ? (
                    <span className="empty-tags-hint">No desired roles added yet.</span>
                  ) : (
                    formData.desiredRoles.map((role, idx) => (
                      <span key={idx} className="interactive-tag-pill">
                        <span>{role}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDesiredRole(idx)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div className="add-tag-row">
                  <input
                    type="text"
                    value={desiredRoleInput}
                    onChange={(e) => setDesiredRoleInput(e.target.value)}
                    placeholder="Add desired role (e.g. AI Engineer)..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDesiredRole(e);
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddDesiredRole} className="add-tag-btn">
                    <Plus size={14} /> Add Role
                  </button>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Preferred Locations</label>
              <div className="tags-matrix-box">
                <div className="tags-pills-row">
                  {formData.preferredLocations.length === 0 ? (
                    <span className="empty-tags-hint">No preferred locations added yet.</span>
                  ) : (
                    formData.preferredLocations.map((loc, idx) => (
                      <span key={idx} className="interactive-tag-pill">
                        <span>{loc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePreferredLocation(idx)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div className="add-tag-row">
                  <input
                    type="text"
                    value={preferredLocationInput}
                    onChange={(e) => setPreferredLocationInput(e.target.value)}
                    placeholder="Add location (e.g. San Francisco, Remote)..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPreferredLocation(e);
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddPreferredLocation} className="add-tag-btn">
                    <Plus size={14} /> Add Location
                  </button>
                </div>
              </div>
            </div>

            <div className="form-field checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.remotePreference}
                  onChange={(e) => handleInputChange("remotePreference", e.target.checked)}
                />
                <span>Open to Remote & Hybrid Positions</span>
              </label>
            </div>
          </div>
        </section>

      </form>
    </div>
  );
};

export default Profile;
