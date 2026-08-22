import { useState } from "react";
import { KeyRound, Lock, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../services/settings.api";

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);
    setErrorNotice(null);

    if (newPassword.length < 8) {
      setErrorNotice("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorNotice("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorNotice("New password must be different from your current password.");
      return;
    }

    setSaving(true);

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setNotice(res.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorNotice(
        err.response?.data?.message || "Failed to update password. Please check your current password."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section-panel">
      <div className="section-title-box">
        <h3>Account Security & Password</h3>
        <p>Update your authentication password to maintain account security.</p>
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

        {/* Current Password */}
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrent ? "text" : "password"}
              id="currentPassword"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
            />
            <button
              type="button"
              className="eye-toggle-btn"
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="form-row-2col">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNew ? "text" : "password"}
                id="newPassword"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Re-enter new password"
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="save-profile-btn" disabled={saving}>
            <Lock size={16} />
            <span>{saving ? "Updating Password..." : "Update Password"}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default SecuritySettings;
