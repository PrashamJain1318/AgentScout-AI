import { useState } from "react";
import { AlertTriangle, Trash2, X, AlertCircle } from "lucide-react";
import { deleteAccount } from "../../services/settings.api";
import { useAuth } from "../../context/AuthContext";

const DangerZone = () => {
  const { logout } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmWord, setConfirmWord] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const handleDelete = async (e) => {
    e.preventDefault();
    setErrorNotice(null);

    if (confirmWord !== "DELETE") {
      setErrorNotice('Type "DELETE" in capital letters to confirm.');
      return;
    }

    if (!password) {
      setErrorNotice("Password is required to confirm account deletion.");
      return;
    }

    setDeleting(true);

    try {
      await deleteAccount({ password });
      setIsModalOpen(false);
      logout();
    } catch (err) {
      setErrorNotice(
        err.response?.data?.message || "Failed to delete account. Please check your password."
      );
      setDeleting(false);
    }
  };

  return (
    <div className="settings-section-panel danger-panel">
      <div className="section-title-box">
        <h3 className="text-danger flex-between" style={{ justifyContent: "flex-start", gap: "8px" }}>
          <AlertTriangle size={18} />
          <span>Danger Zone</span>
        </h3>
        <p>Irreversible actions regarding your candidate profile and account data.</p>
      </div>

      <div className="danger-action-box flex-between">
        <div>
          <strong>Delete Candidate Account</strong>
          <p className="notif-subtext">
            Permanently delete your profile, applications, AI match records, and notifications. This action cannot be undone.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action-btn danger"
          onClick={() => {
            setIsModalOpen(true);
            setErrorNotice(null);
            setPassword("");
            setConfirmWord("");
          }}
        >
          <Trash2 size={16} />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row flex-between">
              <h4 className="text-danger flex-between" style={{ gap: "8px" }}>
                <AlertTriangle size={18} />
                <span>Confirm Permanent Account Deletion</span>
              </h4>
              <button
                type="button"
                className="notif-delete-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-body-text">
              This action will permanently purge your AgentScout AI profile, skills matrix, active applications, AI matches, and history.
            </p>

            {errorNotice && (
              <div className="card-apply-notice danger" style={{ margin: "0 0 16px 0" }}>
                <AlertCircle size={16} />
                <span>{errorNotice}</span>
              </div>
            )}

            <form onSubmit={handleDelete} className="settings-form">
              <div className="form-group">
                <label htmlFor="delPass">Enter Account Password</label>
                <input
                  type="password"
                  id="delPass"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmWord">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  id="confirmWord"
                  className="form-input"
                  value={confirmWord}
                  onChange={(e) => setConfirmWord(e.target.value)}
                  required
                  placeholder="DELETE"
                />
              </div>

              <div className="modal-actions-row flex-between" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => setIsModalOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action-btn danger-btn"
                  disabled={deleting || confirmWord !== "DELETE" || !password}
                >
                  <Trash2 size={16} />
                  <span>{deleting ? "Deleting Account..." : "Permanently Delete Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangerZone;
