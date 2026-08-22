import { useState } from "react";
import { Settings, Save, Sparkles } from "lucide-react";

const MonitorPreferences = ({ monitor = {}, onSave, saving = false }) => {
  const [minMatch, setMinMatch] = useState(monitor.minimumMatchScore || 60);
  const [freq, setFreq] = useState(monitor.frequency || "daily");
  const [alertEx, setAlertEx] = useState(monitor.alertPreferences?.excellentMatches !== false);
  const [alertSt, setAlertSt] = useState(monitor.alertPreferences?.strongMatches !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      minimumMatchScore: Number(minMatch),
      frequency: freq,
      alertPreferences: {
        ...monitor.alertPreferences,
        excellentMatches: alertEx,
        strongMatches: alertSt
      }
    });
  };

  return (
    <div className="opportunity-selector-card">
      <div className="selector-header flex-between">
        <div className="selector-title">
          <Settings size={18} className="text-primary" />
          <span>Monitor Preferences & Thresholds</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="form-row-2col">
          <div className="form-group">
            <label htmlFor="min-score-select">Minimum Match Score Threshold</label>
            <select
              id="min-score-select"
              className="form-input"
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
            >
              <option value={50}>50% — Broad Discovery</option>
              <option value={60}>60% — Moderate Fit (Recommended)</option>
              <option value={75}>75% — Strong Fit Only</option>
              <option value={90}>90% — Excellent Fit Only</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="freq-select">Monitoring Frequency</label>
            <select
              id="freq-select"
              className="form-input"
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
            >
              <option value="hourly">Hourly Scan</option>
              <option value="daily">Daily Scan (Recommended)</option>
              <option value="weekly">Weekly Scan</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 700 }}>Notification Alert Rules:</label>
          <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={alertEx}
                onChange={(e) => setAlertEx(e.target.checked)}
              />
              <span>Alert on 90%+ Excellent Matches</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={alertSt}
                onChange={(e) => setAlertSt(e.target.checked)}
              />
              <span>Alert on 75%+ Strong Matches</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="save-profile-btn"
          disabled={saving}
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Save size={16} />
          <span>{saving ? "Saving Preferences..." : "Save Monitor Preferences"}</span>
        </button>
      </form>
    </div>
  );
};

export default MonitorPreferences;
