import { useEffect, useState } from "react";
import { Settings as SettingsIcon, AlertCircle, RefreshCw } from "lucide-react";
import SettingsNavigation from "../components/settings/SettingsNavigation";
import AccountSettings from "../components/settings/AccountSettings";
import ConnectedAccountsSettings from "../components/settings/ConnectedAccountsSettings";
import JobPreferences from "../components/settings/JobPreferences";
import NotificationSettings from "../components/settings/NotificationSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import SecuritySettings from "../components/settings/SecuritySettings";
import SessionSettings from "../components/settings/SessionSettings";
import DangerZone from "../components/settings/DangerZone";
import { getSettings } from "../services/settings.api";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("account");
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchCandidateSettings = async () => {
    setLoading(true);
    setErrorNotice(null);

    try {
      const res = await getSettings();
      setSettingsData(res.settings || null);
    } catch (err) {
      setErrorNotice("Unable to load candidate settings. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateSettings();
  }, []);

  const handleSettingsUpdated = (updatedCategoryData) => {
    fetchCandidateSettings();
  };

  return (
    <div className="settings-page-container">

      {/* Header Bar */}
      <div className="settings-header-bar">
        <div className="header-badge">
          <SettingsIcon size={14} className="text-primary" />
          <span>ACCOUNT & PREFERENCES</span>
        </div>
        <h2>Settings & Account Management</h2>
        <p className="subtitle-text">
          Manage candidate profile details, social account connections, job preferences, alert notifications, privacy settings, and account security.
        </p>
      </div>

      {errorNotice && (
        <div className="inline-error-state flex-between">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={20} />
            <span>{errorNotice}</span>
          </div>
          <button type="button" onClick={fetchCandidateSettings} className="retry-btn">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* 2-Column Settings Layout */}
      <div className="settings-main-grid">

        {/* Left Column Navigation */}
        <SettingsNavigation
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        {/* Right Column Active Panel */}
        <div className="settings-content-body">
          {loading ? (
            <div className="settings-section-panel skeleton-box">
              Loading settings and preferences...
            </div>
          ) : (
            <>
              {activeSection === "account" && (
                <AccountSettings
                  initialAccount={settingsData?.account}
                  onUpdated={handleSettingsUpdated}
                />
              )}

              {activeSection === "connected" && (
                <ConnectedAccountsSettings />
              )}

              {activeSection === "preferences" && (
                <JobPreferences
                  initialPreferences={settingsData?.jobPreferences}
                  onUpdated={handleSettingsUpdated}
                />
              )}

              {activeSection === "notifications" && (
                <NotificationSettings
                  initialNotifications={settingsData?.notificationPreferences}
                  onUpdated={handleSettingsUpdated}
                />
              )}

              {activeSection === "privacy" && (
                <PrivacySettings
                  initialPrivacy={settingsData?.privacyPreferences}
                  onUpdated={handleSettingsUpdated}
                />
              )}

              {activeSection === "security" && <SecuritySettings />}

              {activeSection === "sessions" && <SessionSettings />}

              {activeSection === "danger" && <DangerZone />}
            </>
          )}
        </div>

      </div>

    </div>
  );
};

export default Settings;
