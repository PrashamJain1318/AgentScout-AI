import { useState, useEffect } from "react";
import { Sliders, Save, Plus, X, Check, AlertCircle } from "lucide-react";
import { updateJobPreferences } from "../../services/settings.api";

const SUGGESTED_JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const SUGGESTED_WORK_MODES = ["Remote", "Hybrid", "On-site"];
const SUGGESTED_EXP_LEVELS = ["Intern", "Entry Level", "Junior", "Mid Level", "Senior", "Lead", "Principal"];

const JobPreferences = ({ initialPreferences = {}, onUpdated }) => {
  const [desiredRoles, setDesiredRoles] = useState(initialPreferences.desiredRoles || []);
  const [roleInput, setRoleInput] = useState("");

  const [preferredLocations, setPreferredLocations] = useState(initialPreferences.preferredLocations || []);
  const [locInput, setLocInput] = useState("");

  const [jobTypes, setJobTypes] = useState(initialPreferences.jobTypes || ["Full-time"]);
  const [workModes, setWorkModes] = useState(initialPreferences.workModes || ["Remote", "Hybrid"]);
  const [minimumSalary, setMinimumSalary] = useState(initialPreferences.minimumSalary || 0);
  const [experienceLevel, setExperienceLevel] = useState(initialPreferences.experienceLevel || "Mid Level");
  const [remotePreference, setRemotePreference] = useState(
    typeof initialPreferences.remotePreference === "boolean" ? initialPreferences.remotePreference : true
  );

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    if (initialPreferences.desiredRoles) setDesiredRoles(initialPreferences.desiredRoles);
    if (initialPreferences.preferredLocations) setPreferredLocations(initialPreferences.preferredLocations);
    if (initialPreferences.jobTypes) setJobTypes(initialPreferences.jobTypes);
    if (initialPreferences.workModes) setWorkModes(initialPreferences.workModes);
    if (initialPreferences.minimumSalary !== undefined) setMinimumSalary(initialPreferences.minimumSalary);
    if (initialPreferences.experienceLevel) setExperienceLevel(initialPreferences.experienceLevel);
  }, [initialPreferences]);

  const handleAddRole = (e) => {
    e.preventDefault();
    if (roleInput.trim() && !desiredRoles.includes(roleInput.trim())) {
      setDesiredRoles([...desiredRoles, roleInput.trim()]);
      setRoleInput("");
    }
  };

  const handleRemoveRole = (role) => {
    setDesiredRoles(desiredRoles.filter((r) => r !== role));
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (locInput.trim() && !preferredLocations.includes(locInput.trim())) {
      setPreferredLocations([...preferredLocations, locInput.trim()]);
      setLocInput("");
    }
  };

  const handleRemoveLocation = (loc) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== loc));
  };

  const toggleJobType = (type) => {
    if (jobTypes.includes(type)) {
      setJobTypes(jobTypes.filter((t) => t !== type));
    } else {
      setJobTypes([...jobTypes, type]);
    }
  };

  const toggleWorkMode = (mode) => {
    if (workModes.includes(mode)) {
      setWorkModes(workModes.filter((m) => m !== mode));
    } else {
      setWorkModes([...workModes, mode]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      const payload = {
        desiredRoles,
        preferredLocations,
        jobTypes,
        workModes,
        minimumSalary: Number(minimumSalary) || 0,
        experienceLevel,
        remotePreference,
      };

      const res = await updateJobPreferences(payload);
      setNotice("Job preferences saved successfully.");
      if (onUpdated) onUpdated(res.settings?.jobPreferences);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Failed to save job preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section-panel">
      <div className="section-title-box">
        <h3>Job & Career Preferences</h3>
        <p>Define your desired roles, location choices, compensation expectations, and work modes.</p>
      </div>

      {notice && (
        <div className="card-apply-notice success" style={{ margin: 0 }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="card-apply-notice danger" style={{ margin: 0 }}>
          <AlertCircle size={16} />
          <span>{errorNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">

        {/* Preferred Job Titles */}
        <div className="form-group">
          <label>Preferred Job Titles</label>
          <div className="tags-chip-wrapper">
            {desiredRoles.map((role) => (
              <span key={role} className="tag-chip">
                <span>{role}</span>
                <button type="button" onClick={() => handleRemoveRole(role)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="inline-add-input-row">
            <input
              type="text"
              className="form-input"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="e.g. AI Engineer, Full Stack Developer..."
            />
            <button type="button" className="secondary-action-btn" onClick={handleAddRole}>
              <Plus size={14} /> Add Role
            </button>
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="form-group">
          <label>Preferred Locations</label>
          <div className="tags-chip-wrapper">
            {preferredLocations.map((loc) => (
              <span key={loc} className="tag-chip">
                <span>{loc}</span>
                <button type="button" onClick={() => handleRemoveLocation(loc)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="inline-add-input-row">
            <input
              type="text"
              className="form-input"
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              placeholder="e.g. San Francisco, Bangalore, Remote..."
            />
            <button type="button" className="secondary-action-btn" onClick={handleAddLocation}>
              <Plus size={14} /> Add Location
            </button>
          </div>
        </div>

        {/* Job Types */}
        <div className="form-group">
          <label>Job Types</label>
          <div className="checkboxes-pill-row">
            {SUGGESTED_JOB_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`choice-pill-btn ${jobTypes.includes(type) ? "active" : ""}`}
                onClick={() => toggleJobType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Work Modes */}
        <div className="form-group">
          <label>Work Modes</label>
          <div className="checkboxes-pill-row">
            {SUGGESTED_WORK_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`choice-pill-btn ${workModes.includes(mode) ? "active" : ""}`}
                onClick={() => toggleWorkMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Salary & Experience Level */}
        <div className="form-row-2col">
          <div className="form-group">
            <label htmlFor="minSalary">Minimum Desired Salary ($ / year)</label>
            <input
              type="number"
              id="minSalary"
              className="form-input"
              value={minimumSalary}
              onChange={(e) => setMinimumSalary(e.target.value)}
              min="0"
              step="5000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="expLevel">Target Experience Level</label>
            <select
              id="expLevel"
              className="form-input"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              {SUGGESTED_EXP_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="save-profile-btn" disabled={saving}>
            <Save size={16} />
            <span>{saving ? "Saving Preferences..." : "Save Job Preferences"}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default JobPreferences;
