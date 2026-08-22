import { useState, useEffect } from "react";
import { User, Save, Info, Check, AlertCircle } from "lucide-react";
import { updateAccount } from "../../services/settings.api";
import { useAuth } from "../../context/AuthContext";

const AccountSettings = ({ initialAccount = {}, onUpdated }) => {
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(initialAccount.firstName || "");
  const [lastName, setLastName] = useState(initialAccount.lastName || "");
  const [email] = useState(initialAccount.email || "");

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    if (initialAccount.firstName) setFirstName(initialAccount.firstName);
    if (initialAccount.lastName) setLastName(initialAccount.lastName);
  }, [initialAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      const res = await updateAccount({ firstName, lastName });
      setNotice("Account information updated successfully.");
      if (refreshUser) refreshUser();
      if (onUpdated) onUpdated(res.settings?.account);
    } catch (err) {
      setErrorNotice(
        err.response?.data?.message || "Failed to update account information."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section-panel">
      <div className="section-title-box">
        <h3>Account Information</h3>
        <p>Manage your basic candidate identity and account details.</p>
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
        <div className="form-row-2col">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              className="form-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              className="form-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input read-only"
            value={email}
            readOnly
            disabled
          />
          <div className="input-field-hint flex-between" style={{ marginTop: "6px" }}>
            <span className="notif-subtext flex-between" style={{ gap: "4px" }}>
              <Info size={13} />
              <span>Email modifications require a dedicated security verification flow.</span>
            </span>
          </div>
        </div>

        <div className="form-actions-bar">
          <button
            type="submit"
            className="save-profile-btn"
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;
