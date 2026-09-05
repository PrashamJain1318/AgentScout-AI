import React from "react";
import { Search, FileText, Mic, TrendingUp } from "lucide-react";

const capabilityCategories = [
  {
    category: "DISCOVER",
    icon: Search,
    color: "var(--accent-cyan)",
    bg: "rgba(6, 182, 212, 0.12)",
    items: [
      "AI Opportunity Monitor (24/7 Market Watch)",
      "Smart Compatibility Matching Engine",
      "Real-Time Job Telemetry & Skill Analysis",
    ],
  },
  {
    category: "PREPARE",
    icon: FileText,
    color: "var(--accent-purple)",
    bg: "rgba(139, 92, 246, 0.12)",
    items: [
      "Resume ATS Score Audit & Missing Skills",
      "AI Application Assistant & Custom Cover Letters",
      "Tailored Application Answer Generation",
    ],
  },
  {
    category: "PRACTICE",
    icon: Mic,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    items: [
      "AI Interview Coach & Behavioral Practice",
      "Role-Specific Mock Interview Simulation",
      "Readiness Scoring & Feedback Rubric",
    ],
  },
  {
    category: "GROW",
    icon: TrendingUp,
    color: "var(--accent-blue)",
    bg: "rgba(59, 130, 246, 0.12)",
    items: [
      "AI Career Action Planner & Daily Focus",
      "Skill Gap Intelligence & Up-skilling Paths",
      "Autonomous AI Career Agent Decision Engine",
    ],
  },
];

const PlatformCapabilities = () => {
  return (
    <section className="capabilities-section" id="capabilities">
      <div className="section-header-center">
        <div className="section-kicker-badge">
          <span>COMPLETE CAPABILITY MATRIX</span>
        </div>
        <h2 className="section-main-heading">
          Everything You Need to Navigate Your Career
        </h2>
        <p className="section-main-subtext">
          A comprehensive suite organized into four core pillars of candidate success.
        </p>
      </div>

      <div className="capabilities-grid">
        {capabilityCategories.map(({ category, icon: Icon, color, bg, items }) => (
          <div key={category} className="capability-category-card">
            <div className="capability-header-row">
              <div className="capability-icon-box" style={{ background: bg, color }}>
                <Icon size={18} />
              </div>
              <span className="capability-category-tag" style={{ color }}>
                {category}
              </span>
            </div>

            <ul className="capability-items-list">
              {items.map((item, idx) => (
                <li key={idx} className="capability-item">
                  <span className="capability-bullet" style={{ background: color }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlatformCapabilities;
