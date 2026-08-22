import { useState } from "react";
import { Laptop, LogOut, ShieldCheck, Check, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutAllSessions } from "../../services/settings.api";

const SessionSettings = () => {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  // Safe device detection
  const userAgent = navigator.userAgent || "";
  let os = "Desktop OS";
  if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Win")) os = "Windows";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

  let browser = "Web Browser";
  if (userAgent.includes("Chrome")) browser = "Chrome Browser";
  else if (userAgent.includes("Safari")) browser = "Safari Browser";
  else if (userAgent.includes("Firefox")) browser = "Firefox Browser";

  const handleLogoutCurrent = () => {
    logout();
  };

  const handleLogoutAll = async () => {
    setLoggingOut(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      await logoutAllSessions();
      setNotice("Logged out of all active sessions.");
      setTimeout(() => {
        logout();
      }, 1000);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Failed to log out of all sessions.");
      setLoggingOut(false);
    }
  };

  return (
    <div className="settings-section-panel">
      <div className="section-title-box">
        <h3>Session & Device Management</h3>
        <p>Monitor your active browser session and manage authenticated credentials.</p>
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

      <div className="sessions-list-box">
        <div className="active-session-card flex-between">
          <div className="session-icon-col">
            <Laptop size={22} className="text-primary" />
          </div>

          <div className="session-details-col">
            <div className="session-title-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong>Current Active Session</strong>
              <span className="stat-pill success" style={{ fontSize: "11px", padding: "2px 8px" }}>
                <ShieldCheck size={12} /> Active Now
              </span>
            </div>

            <p className="session-meta-text">
              {browser} on {os} • HTTP-only Encrypted JWT Cookie
            </p>
          </div>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={handleLogoutCurrent}
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      <div className="session-actions-bar" style={{ marginTop: "16px" }}>
        <button
          type="button"
          className="secondary-action-btn danger"
          onClick={handleLogoutAll}
          disabled={loggingOut}
        >
          <LogOut size={16} />
          <span>{loggingOut ? "Invalidating Sessions..." : "Log Out of All Sessions"}</span>
        </button>
      </div>
    </div>
  );
};

export default SessionSettings;
