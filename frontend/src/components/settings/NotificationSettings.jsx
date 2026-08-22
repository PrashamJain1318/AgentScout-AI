import { useState, useEffect } from "react";
import { Bell, Save, Check, AlertCircle } from "lucide-react";
import { updateNotificationPreferences } from "../../services/settings.api";

const NOTIF_TOGGLES = [
  { id: "newMatches", label: "New Match Alerts", desc: "Receive notifications when new career opportunities match your profile." },
  { id: "excellentMatches", label: "Excellent Match Alerts", desc: "Get high-priority alerts for top 90%+ career matches." },
  { id: "applicationUpdates", label: "Application Pipeline Updates", desc: "Notify when applications move between stages (screening, interview, offer)." },
  { id: "interviewAlerts", label: "Interview Scheduled Alerts", desc: "Receive alerts for upcoming technical and recruiter interview rounds." },
  { id: "offerAlerts", label: "Job Offer Received Alerts", desc: "Immediate notifications when job offers are registered in your pipeline." },
  { id: "careerCopilot", label: "Career Copilot Insights", desc: "AI recommendation alerts for skill gaps and resume improvements." },
  { id: "emailNotifications", label: "Email Notifications", desc: "Send daily career intelligence digest to your registered email address." },
];

const NotificationSettings = ({ initialNotifications = {}, onUpdated }) => {
  const [preferences, setPreferences] = useState({
    newMatches: true,
    excellentMatches: true,
    applicationUpdates: true,
    interviewAlerts: true,
    offerAlerts: true,
    careerCopilot: true,
    emailNotifications: false,
    ...initialNotifications,
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    if (initialNotifications) {
      setPreferences((prev) => ({ ...prev, ...initialNotifications }));
    }
  }, [initialNotifications]);

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      const res = await updateNotificationPreferences(preferences);
      setNotice("Notification preferences updated successfully.");
      if (onUpdated) onUpdated(res.settings?.notificationPreferences);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Failed to update notification preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section-panel">
      <div className="section-title-box">
        <h3>Notification & Alert Preferences</h3>
        <p>Control which events trigger real-time notifications in your Activity Center.</p>
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
        <div className="toggles-list-container">
          {NOTIF_TOGGLES.map(({ id, label, desc }) => {
            const isChecked = Boolean(preferences[id]);

            return (
              <div key={id} className="toggle-setting-row flex-between">
                <div className="toggle-info-col">
                  <strong>{label}</strong>
                  <p>{desc}</p>
                </div>

                <button
                  type="button"
                  className={`switch-toggle-btn ${isChecked ? "on" : "off"}`}
                  onClick={() => handleToggle(id)}
                  role="switch"
                  aria-checked={isChecked}
                >
                  <span className="switch-slider" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="save-profile-btn" disabled={saving}>
            <Save size={16} />
            <span>{saving ? "Saving Preferences..." : "Save Notification Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;
