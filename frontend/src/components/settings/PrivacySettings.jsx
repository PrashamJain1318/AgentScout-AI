import { useState, useEffect } from "react";
import { Shield, Save, Check, AlertCircle } from "lucide-react";
import { updatePrivacyPreferences } from "../../services/settings.api";

const PrivacySettings = ({ initialPrivacy = {}, onUpdated }) => {
  const [profileVisibility, setProfileVisibility] = useState(initialPrivacy.profileVisibility || "recruiters");
  const [recruiterDiscovery, setRecruiterDiscovery] = useState(
    typeof initialPrivacy.recruiterDiscovery === "boolean" ? initialPrivacy.recruiterDiscovery : true
  );
  const [aiPersonalization, setAiPersonalization] = useState(
    typeof initialPrivacy.aiPersonalization === "boolean" ? initialPrivacy.aiPersonalization : true
  );

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    if (initialPrivacy.profileVisibility) setProfileVisibility(initialPrivacy.profileVisibility);
    if (typeof initialPrivacy.recruiterDiscovery === "boolean") setRecruiterDiscovery(initialPrivacy.recruiterDiscovery);
    if (typeof initialPrivacy.aiPersonalization === "boolean") setAiPersonalization(initialPrivacy.aiPersonalization);
  }, [initialPrivacy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      const payload = {
        profileVisibility,
        recruiterDiscovery,
        aiPersonalization,
      };

      const res = await updatePrivacyPreferences(payload);
      setNotice("Privacy settings saved successfully.");
      if (onUpdated) onUpdated(res.settings?.privacyPreferences);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Failed to save privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section-panel">
      <div className="section-title-box">
        <h3>Privacy & Data Sharing</h3>
        <p>Control who can view your candidate profile and how AgentScout AI uses your data.</p>
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

        {/* Profile Visibility Options */}
        <div className="form-group">
          <label>Profile Visibility</label>
          <div className="radio-options-list">
            <label className={`radio-card-option ${profileVisibility === "recruiters" ? "selected" : ""}`}>
              <input
                type="radio"
                name="visibility"
                value="recruiters"
                checked={profileVisibility === "recruiters"}
                onChange={(e) => setProfileVisibility(e.target.value)}
              />
              <div className="radio-option-text">
                <strong>Recruiters Only (Recommended)</strong>
                <p>Only verified employers and hiring partners can view your profile and candidate score.</p>
              </div>
            </label>

            <label className={`radio-card-option ${profileVisibility === "public" ? "selected" : ""}`}>
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={profileVisibility === "public"}
                onChange={(e) => setProfileVisibility(e.target.value)}
              />
              <div className="radio-option-text">
                <strong>Public Profile</strong>
                <p>Anyone with your shareable link can view your candidate profile and skills matrix.</p>
              </div>
            </label>

            <label className={`radio-card-option ${profileVisibility === "private" ? "selected" : ""}`}>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={profileVisibility === "private"}
                onChange={(e) => setProfileVisibility(e.target.value)}
              />
              <div className="radio-option-text">
                <strong>Private (Only Me)</strong>
                <p>Hide profile completely from discovery. Only you can view your applications and copilot.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Recruiter Discovery Toggle */}
        <div className="toggle-setting-row flex-between">
          <div className="toggle-info-col">
            <strong>Recruiter Discovery Mode</strong>
            <p>Allow hiring algorithms to recommend your profile for high-match unlisted roles.</p>
          </div>

          <button
            type="button"
            className={`switch-toggle-btn ${recruiterDiscovery ? "on" : "off"}`}
            onClick={() => setRecruiterDiscovery(!recruiterDiscovery)}
            role="switch"
            aria-checked={recruiterDiscovery}
          >
            <span className="switch-slider" />
          </button>
        </div>

        {/* AI Personalization Toggle */}
        <div className="toggle-setting-row flex-between">
          <div className="toggle-info-col">
            <strong>AI Data Personalization</strong>
            <p>Allow AgentScout AI context engine to process your pipeline data for personalized guidance.</p>
          </div>

          <button
            type="button"
            className={`switch-toggle-btn ${aiPersonalization ? "on" : "off"}`}
            onClick={() => setAiPersonalization(!aiPersonalization)}
            role="switch"
            aria-checked={aiPersonalization}
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="save-profile-btn" disabled={saving}>
            <Save size={16} />
            <span>{saving ? "Saving Privacy Settings..." : "Save Privacy Settings"}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default PrivacySettings;
