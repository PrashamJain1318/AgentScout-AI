import React from "react";
import { Brain, FileText, BookmarkCheck, Award } from "lucide-react";

const CareerSnapshot = ({ osSnapshot, resumeData, applicationsCount, interviewReadiness }) => {
  const careerReadiness = osSnapshot?.careerScore || osSnapshot?.readinessMetrics?.overall || 72;
  const resumeScore = resumeData?.scores?.ats || resumeData?.atsScore || 68;
  const appCount = typeof applicationsCount === "number" ? applicationsCount : 0;
  const interviewScore = interviewReadiness?.readinessScore || interviewReadiness?.score || 75;

  const metrics = [
    {
      id: "readiness",
      label: "Career Readiness",
      value: `${careerReadiness}%`,
      percentage: careerReadiness,
      icon: Brain,
      color: "var(--accent-purple)",
      bg: "rgba(139, 92, 246, 0.12)",
    },
    {
      id: "resume",
      label: "Resume ATS Score",
      value: `${resumeScore}%`,
      percentage: resumeScore,
      icon: FileText,
      color: "var(--accent-cyan)",
      bg: "rgba(6, 182, 212, 0.12)",
    },
    {
      id: "applications",
      label: "Applications",
      value: `${appCount}`,
      percentage: Math.min(100, (appCount / 20) * 100),
      icon: BookmarkCheck,
      color: "var(--accent-blue)",
      bg: "rgba(59, 130, 246, 0.12)",
    },
    {
      id: "interview",
      label: "Interview Readiness",
      value: `${interviewScore}%`,
      percentage: interviewScore,
      icon: Award,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)",
    },
  ];

  return (
    <section className="career-snapshot-section">
      <div className="snapshot-grid">
        {metrics.map(({ id, label, value, percentage, icon: Icon, color, bg }) => (
          <div key={id} className="snapshot-card">
            <div className="snapshot-card-top">
              <div className="snapshot-icon-box" style={{ background: bg, color }}>
                <Icon size={18} />
              </div>
              <span className="snapshot-value">{value}</span>
            </div>

            <span className="snapshot-label">{label}</span>

            <div className="snapshot-progress-bg">
              <div
                className="snapshot-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CareerSnapshot;
