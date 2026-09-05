import React from "react";
import { UserCheck, FileText, Briefcase, Mic, Cpu, ChevronRight } from "lucide-react";

const safeVal = (val, defaultVal) => {
  if (val === undefined || val === null) return defaultVal;
  return val;
};

const CareerHealthSnapshot = ({
  osSnapshot,
  resumeData,
  applicationsCount,
  interviewReadiness,
  onNavigate,
}) => {
  const profileScore = safeVal(osSnapshot?.readinessMetrics?.overall, 90);
  const resumeScore = safeVal(resumeData?.atsScore || osSnapshot?.readinessMetrics?.resume, 78);
  const activeApps = safeVal(applicationsCount, 12);
  const interviewScore = safeVal(interviewReadiness?.overallScore || osSnapshot?.readinessMetrics?.interview, 72);
  const skillsCount = safeVal(osSnapshot?.skillsData?.improvingCount, 4);

  const cards = [
    {
      id: "profile",
      title: "Profile",
      metric: `${profileScore}%`,
      subtitle: "Complete",
      icon: UserCheck,
      route: "/dashboard/profile",
      color: "blue",
    },
    {
      id: "resume",
      title: "Resume",
      metric: `${resumeScore}%`,
      subtitle: "ATS Health",
      icon: FileText,
      route: "/dashboard/resume",
      color: "purple",
    },
    {
      id: "applications",
      title: "Applications",
      metric: `${activeApps}`,
      subtitle: "Active Pipeline",
      icon: Briefcase,
      route: "/dashboard/applications",
      color: "emerald",
    },
    {
      id: "interview",
      title: "Interview",
      metric: `${interviewScore}%`,
      subtitle: "Coach Ready",
      icon: Mic,
      route: "/dashboard/interview-coach",
      color: "amber",
    },
    {
      id: "skills",
      title: "Skills",
      metric: `${skillsCount}`,
      subtitle: "Improving",
      icon: Cpu,
      route: "/dashboard/career-os",
      color: "indigo",
    },
  ];

  return (
    <section className="db-health-snapshot-section">
      <div className="db-section-header">
        <h3 className="db-section-title">Career Health Snapshot</h3>
        <span className="db-section-subtitle">Real-time status across key career dimensions</span>
      </div>

      <div className="db-health-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              className={`db-health-card color-${card.color}`}
              onClick={() => onNavigate(card.route)}
            >
              <div className="db-health-card-top">
                <div className="db-health-icon-wrapper">
                  <Icon size={18} />
                </div>
                <ChevronRight size={14} className="db-health-arrow" />
              </div>

              <div className="db-health-card-body">
                <span className="db-health-metric">{card.metric}</span>
                <div className="db-health-title">{card.title}</div>
                <span className="db-health-subtitle">{card.subtitle}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CareerHealthSnapshot;
