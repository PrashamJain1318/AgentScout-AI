import React from "react";
import { UserCheck, Brain, Search, FileText, Mic, Bot } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Build Your Career Profile",
    desc: "Import or enter candidate experience, target roles, location preferences, and core stack skills.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Understands Your Skills",
    desc: "The reasoning engine maps your experience against industry standards and recruiter requirements.",
  },
  {
    number: "03",
    icon: Search,
    title: "Discover Best Opportunities",
    desc: "Smart opportunity matching highlights roles with high skill fit and deep compatibility breakdown.",
  },
  {
    number: "04",
    icon: FileText,
    title: "Prepare Stronger Applications",
    desc: "Application Assistant audits ATS resume coverage and generates tailored cover letters and answers.",
  },
  {
    number: "05",
    icon: Mic,
    title: "Practice for Interviews",
    desc: "AI Interview Coach conducts role-specific mock interviews and evaluates performance scores.",
  },
  {
    number: "06",
    icon: Bot,
    title: "AI Career Agent Guides You",
    desc: "Autonomous Agent synthesizes data across all modules to recommend Your Next Best Action.",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="section-header-center">
        <div className="section-kicker-badge">
          <span>THE INTELLIGENT WORKFLOW</span>
        </div>
        <h2 className="section-main-heading">How AgentScout-AI Works</h2>
        <p className="section-main-subtext">
          A seamless 6-step journey from profile setup to AI-driven career execution.
        </p>
      </div>

      <div className="steps-timeline-grid">
        {steps.map(({ number, icon: Icon, title, desc }, index) => (
          <div key={number} className="step-timeline-card">
            <div className="step-number-badge">{number}</div>
            <div className="step-icon-wrapper">
              <Icon size={20} />
            </div>
            <h3 className="step-title">{title}</h3>
            <p className="step-desc">{desc}</p>
            {index < steps.length - 1 && <div className="step-connector-line" />}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
