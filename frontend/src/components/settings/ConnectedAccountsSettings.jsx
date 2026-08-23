import { useState, useEffect } from "react";
import { Link2, CheckCircle2, XCircle, AlertCircle, Loader2, Unlink } from "lucide-react";
import { getConnectedAccounts, disconnectProvider } from "../../services/auth.api";

const ConnectedAccountsSettings = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await getConnectedAccounts();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setErrorMessage("Unable to fetch connected accounts information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = (provider) => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
    window.location.href = `${apiBase}/auth/${provider}`;
  };

  const handleDisconnect = async (provider) => {
    if (actionLoading) return;
    setStatusMessage(null);
    setErrorMessage(null);

    if (!window.confirm(`Are you sure you want to disconnect your ${provider.toUpperCase()} account?`)) {
      return;
    }

    try {
      setActionLoading(provider);
      const res = await disconnectProvider(provider);
      if (res.success) {
        setStatusMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected successfully.`);
        fetchAccounts();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || `Failed to disconnect ${provider}.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="settings-section-panel skeleton-box">
        <Loader2 className="spin" size={20} />
        <span>Loading connected social accounts...</span>
      </div>
    );
  }

  const providers = data?.providers || {};

  return (
    <div className="settings-section-panel">
      <div className="section-panel-header">
        <div className="header-title-box">
          <Link2 size={20} className="header-icon text-indigo" />
          <div>
            <h3>Connected Accounts</h3>
            <p>Manage third-party OAuth authentication providers linked to your AgentScout account.</p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="inline-success-state" style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", color: "#10b981", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="inline-error-state" style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#ef4444", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="connected-providers-list" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
        
        {/* GOOGLE PROVIDER CARD */}
        <div className="provider-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--card-bg, #18181b)", border: "1px solid var(--border-color, #27272a)", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>Google</h4>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted, #a1a1aa)" }}>
                {providers.google?.connected ? `Connected (${providers.google.email || "Google Account"})` : "Not connected"}
              </p>
            </div>
          </div>

          <div>
            {providers.google?.connected ? (
              <button
                type="button"
                className="action-btn secondary-btn"
                onClick={() => handleDisconnect("google")}
                disabled={actionLoading === "google"}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}
              >
                {actionLoading === "google" ? <Loader2 className="spin" size={14} /> : <Unlink size={14} />}
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                type="button"
                className="action-btn primary-btn"
                onClick={() => handleConnect("google")}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
              >
                <Link2 size={14} />
                <span>Connect</span>
              </button>
            )}
          </div>
        </div>

        {/* GITHUB PROVIDER CARD */}
        <div className="provider-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--card-bg, #18181b)", border: "1px solid var(--border-color, #27272a)", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>GitHub</h4>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted, #a1a1aa)" }}>
                {providers.github?.connected ? `Connected (${providers.github.username ? `@${providers.github.username}` : providers.github.email})` : "Not connected"}
              </p>
            </div>
          </div>

          <div>
            {providers.github?.connected ? (
              <button
                type="button"
                className="action-btn secondary-btn"
                onClick={() => handleDisconnect("github")}
                disabled={actionLoading === "github"}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}
              >
                {actionLoading === "github" ? <Loader2 className="spin" size={14} /> : <Unlink size={14} />}
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                type="button"
                className="action-btn primary-btn"
                onClick={() => handleConnect("github")}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
              >
                <Link2 size={14} />
                <span>Connect</span>
              </button>
            )}
          </div>
        </div>

        {/* LINKEDIN PROVIDER CARD */}
        <div className="provider-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--card-bg, #18181b)", border: "1px solid var(--border-color, #27272a)", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" fill="#0A66C2" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>LinkedIn</h4>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted, #a1a1aa)" }}>
                {providers.linkedin?.connected ? `Connected (${providers.linkedin.email || "LinkedIn Account"})` : "Not connected"}
              </p>
            </div>
          </div>

          <div>
            {providers.linkedin?.connected ? (
              <button
                type="button"
                className="action-btn secondary-btn"
                onClick={() => handleDisconnect("linkedin")}
                disabled={actionLoading === "linkedin"}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}
              >
                {actionLoading === "linkedin" ? <Loader2 className="spin" size={14} /> : <Unlink size={14} />}
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                type="button"
                className="action-btn primary-btn"
                onClick={() => handleConnect("linkedin")}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
              >
                <Link2 size={14} />
                <span>Connect</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConnectedAccountsSettings;
