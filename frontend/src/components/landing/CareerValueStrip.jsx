import React from "react";
import { Brain, Sparkles, FileText, Mic } from "lucide-react";

const valueProps = [
  {
    icon: Brain,
    title: "AI Career Intelligence",
    desc: "Unified candidate reasoning engine",
  },
  {
    icon: Sparkles,
    title: "Smart Matching",
    desc: "Compatibility scoring beyond keywords",
  },
  {
    icon: FileText,
    title: "Resume Intelligence",
    desc: "ATS score optimization & gap audit",
  },
  {
    icon: Mic,
    title: "Interview Readiness",
    desc: "AI coach & mock session feedback",
  },
];

const CareerValueStrip = () => {
  return (
    <section className="career-value-strip">
      <div className="value-strip-container">
        {valueProps.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="value-strip-item">
            <div className="value-icon-box">
              <Icon size={18} />
            </div>
            <div className="value-text-col">
              <span className="value-title">{title}</span>
              <span className="value-desc">{desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CareerValueStrip;
