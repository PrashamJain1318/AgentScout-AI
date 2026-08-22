import { BarChart3 } from "lucide-react";

const MatchBreakdown = ({ breakdown = null, overallScore = 0 }) => {
  if (!breakdown) {
    return (
      <div className="match-breakdown-card">
        <div className="card-header-row">
          <BarChart3 size={18} />
          <h4>Match Breakdown</h4>
        </div>
        <p className="no-breakdown-notice">Category breakdown unavailable for this role.</p>
      </div>
    );
  }

  const categories = [
    { label: "Skills Alignment", value: breakdown.skills ?? 85 },
    { label: "Experience Match", value: breakdown.experience ?? 80 },
    { label: "Location Preference", value: breakdown.location ?? 100 },
    { label: "Job Type Fit", value: breakdown.jobType ?? 90 },
    { label: "Work Mode Preference", value: breakdown.workMode ?? 100 },
    { label: "Profile Completeness", value: breakdown.profileCompleteness ?? 75 },
  ];

  return (
    <div className="match-breakdown-card">
      <div className="card-header-row">
        <BarChart3 size={18} />
        <h4>AI Alignment Breakdown</h4>
        <span className="overall-badge">{overallScore}% Overall</span>
      </div>

      <div className="breakdown-items-list">
        {categories.map((cat, idx) => {
          const val = Math.max(0, Math.min(100, Number(cat.value) || 0));
          return (
            <div key={idx} className="breakdown-item">
              <div className="breakdown-label-row">
                <span>{cat.label}</span>
                <strong>{val}%</strong>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${val}%`,
                    background: val >= 80 ? "var(--primary)" : val >= 60 ? "#f59e0b" : "#94a3b8",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchBreakdown;
