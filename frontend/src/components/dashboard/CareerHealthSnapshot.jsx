import React from "react";
import { UserCheck, FileText, Briefcase, Mic, Cpu, ChevronRight } from "lucide-react";
import MotionCard from "../motion/MotionCard";
import StaggerContainer, { StaggerItem } from "../motion/StaggerContainer";
import AnimatedNumber from "../motion/AnimatedNumber";

const safeNumber = (val) => {
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 ? Math.round(num) : null;
};

const CareerHealthSnapshot = ({
  osSnapshot,
  resumeData,
  applicationsCount,
  interviewReadiness,
  onNavigate,
}) => {
  const profileScore = safeNumber(osSnapshot?.readinessMetrics?.overall);
  const resumeScore = safeNumber(resumeData?.atsScore || resumeData?.scores?.ats || osSnapshot?.readinessMetrics?.resume);
  const activeApps = typeof applicationsCount === "number" ? applicationsCount : 0;
  const interviewScore = safeNumber(interviewReadiness?.overallScore || interviewReadiness?.readinessScore || osSnapshot?.readinessMetrics?.interview);
  const skillsCount = safeNumber(osSnapshot?.skillsData?.improvingCount);

  const cards = [
    {
      id: "profile",
      title: "Profile",
      val: profileScore,
      suffix: "%",
      subtitle: profileScore !== null ? "Readiness" : "Incomplete",
      icon: UserCheck,
      route: "/dashboard/profile",
      color: "blue",
    },
    {
      id: "resume",
      title: "Resume",
      val: resumeScore,
      suffix: "%",
      subtitle: resumeScore !== null ? "ATS Health" : "No Resume",
      icon: FileText,
      route: "/dashboard/resume",
      color: "purple",
    },
    {
      id: "applications",
      title: "Applications",
      val: activeApps,
      suffix: "",
      subtitle: activeApps > 0 ? "Active Pipeline" : "0 Active",
      icon: Briefcase,
      route: "/dashboard/applications",
      color: "emerald",
    },
    {
      id: "interview",
      title: "Interview",
      val: interviewScore,
      suffix: "%",
      subtitle: interviewScore !== null ? "Coach Ready" : "Not Practiced",
      icon: Mic,
      route: "/dashboard/interview-coach",
      color: "amber",
    },
    {
      id: "skills",
      title: "Skills",
      val: skillsCount !== null ? skillsCount : 0,
      suffix: "",
      subtitle: skillsCount !== null && skillsCount > 0 ? "Improving" : "Add Skills",
      icon: Cpu,
      route: "/dashboard/profile",
      color: "indigo",
    },
  ];

  return (
    <section className="db-health-snapshot-section">
      <div className="db-section-header">
        <h3 className="db-section-title">Career Health Snapshot</h3>
        <span className="db-section-subtitle">Real-time status across key career dimensions</span>
      </div>

      <StaggerContainer className="db-health-grid" staggerDelay={0.04}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <StaggerItem key={card.id}>
              <MotionCard
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
                  <AnimatedNumber
                    value={card.val}
                    suffix={card.suffix}
                    duration={800}
                    className="db-health-metric"
                  />
                  <div className="db-health-title">{card.title}</div>
                  <span className="db-health-subtitle">{card.subtitle}</span>
                </div>
              </MotionCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
};

export default CareerHealthSnapshot;
