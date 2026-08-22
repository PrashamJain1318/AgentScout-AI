import { useState, useEffect } from "react";
import { X, Briefcase, Building, MapPin, Globe, Link as LinkIcon, Calendar, Sparkles, Loader2 } from "lucide-react";
import { isValidExternalUrl } from "../../utils/url";

const ApplicationForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  submitting = false,
}) => {
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    location: "Remote",
    jobType: "full-time",
    workMode: "remote",
    jobUrl: "",
    appliedAt: new Date().toISOString().split("T")[0],
    status: "saved",
    matchScore: 85,
    notes: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      const opp = initialData.opportunity || {};
      setForm({
        jobTitle: initialData.jobTitle || opp.title || "",
        company: initialData.company || opp.company || "",
        location: initialData.location || opp.location || "Remote",
        jobType: initialData.jobType || opp.type || "full-time",
        workMode: initialData.workMode || (opp.remote ? "remote" : "onsite"),
        jobUrl: initialData.jobUrl || initialData.applicationUrl || opp.applicationUrl || "",
        appliedAt: initialData.appliedAt
          ? new Date(initialData.appliedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: initialData.status || "saved",
        matchScore: initialData.matchScore || initialData.score || 85,
        notes: initialData.notes || "",
      });
    } else {
      setForm({
        jobTitle: "",
        company: "",
        location: "Remote",
        jobType: "full-time",
        workMode: "remote",
        jobUrl: "",
        appliedAt: new Date().toISOString().split("T")[0],
        status: "saved",
        matchScore: 85,
        notes: "",
      });
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.jobTitle.trim()) {
      setError("Job Title is required.");
      return;
    }
    if (!form.company.trim()) {
      setError("Company Name is required.");
      return;
    }
    if (form.jobUrl && form.jobUrl.trim() && !isValidExternalUrl(form.jobUrl.trim())) {
      setError("Please provide a valid HTTP/HTTPS job URL.");
      return;
    }
    const scoreNum = Number(form.matchScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setError("Match score must be between 0 and 100.");
      return;
    }

    onSubmit({
      ...form,
      jobTitle: form.jobTitle.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      jobUrl: form.jobUrl.trim(),
      matchScore: scoreNum,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container dark-modal form-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>{isEditing ? "Edit Application" : "Add New Application"}</h3>
            <span className="company-subtitle">Track opportunity pipeline stage and details</span>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="auth-error-alert" role="alert">
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid-2col">
            <div className="input-group">
              <label htmlFor="jobTitle">Job Title *</label>
              <div className="input-field-wrapper">
                <Briefcase size={17} className="field-icon" />
                <input
                  id="jobTitle"
                  type="text"
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Senior AI Engineer"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="company">Company Name *</label>
              <div className="input-field-wrapper">
                <Building size={17} className="field-icon" />
                <input
                  id="company"
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Cognitive Labs"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="input-group">
              <label htmlFor="location">Location</label>
              <div className="input-field-wrapper">
                <MapPin size={17} className="field-icon" />
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore, India"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="status">Pipeline Stage</label>
              <select id="status" name="status" value={form.status} onChange={handleChange} className="select-control">
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="input-group">
              <label htmlFor="jobType">Role Type</label>
              <select id="jobType" name="jobType" value={form.jobType} onChange={handleChange} className="select-control">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="research">Research</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="workMode">Work Mode</label>
              <select id="workMode" name="workMode" value={form.workMode} onChange={handleChange} className="select-control">
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="input-group">
              <label htmlFor="jobUrl">Job / Application URL</label>
              <div className="input-field-wrapper">
                <LinkIcon size={17} className="field-icon" />
                <input
                  id="jobUrl"
                  type="text"
                  name="jobUrl"
                  value={form.jobUrl}
                  onChange={handleChange}
                  placeholder="https://company.com/careers/job-123"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="appliedAt">Application Date</label>
              <div className="input-field-wrapper">
                <Calendar size={17} className="field-icon" />
                <input
                  id="appliedAt"
                  type="date"
                  name="appliedAt"
                  value={form.appliedAt}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="notes">Notes / Recruiter Contacts</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add key interview notes, referral details, or salary range..."
              rows={3}
              className="textarea-control"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, marginBottom: "-8px" }}>
            <button type="button" className="secondary-action-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>

            <button type="submit" className="save-profile-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Update Application" : "Save Application"}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ApplicationForm;
