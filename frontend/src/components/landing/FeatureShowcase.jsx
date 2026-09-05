import React from "react";
import { Bot, Sparkles, FileText, CheckSquare, Mic, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    id: "agent",
    icon: Bot,
    badge: "CORE ENGINE",
    title: "🎯 AI Career Agent",
    desc: "Your personal career decision engine that synthesizes profile telemetry, market roles, and interview scores to recommend Your Next Best Action.",
    featured: true,
    route: "/signup",
  },
  {
    id: "matching",
    icon: Sparkles,
    badge: "DISCOVERY",
    title: "💼 Smart Opportunity Matching",
    desc: "Discover opportunities scored against your skills and experience beyond superficial keyword queries.",
    featured: false,
    route: "/signup",
  },
  {
    id: "resume",
    icon: FileText,
    badge: "AUDIT",
    title: "📄 Resume Intelligence",
    desc: "Audit ATS compatibility, detect missing skill coverage, and maintain version-controlled resume variants.",
    featured: false,
    route: "/signup",
  },
  {
    id: "assistant",
    icon: CheckSquare,
    badge: "PREPARATION",
    title: "🚀 Application Assistant",
    desc: "Generate custom tailored cover letters, gap audits, and candidate answers tailored specifically for target roles.",
    featured: false,
    route: "/signup",
  },
  {
    id: "interview",
    icon: Mic,
    badge: "PRACTICE",
    title: "🎤 AI Interview Coach",
    desc: "Conduct realistic mock interview practice sessions with automated rubric scoring and improvement tips.",
    featured: false,
    route: "/signup",
  },
  {
    id: "planner",
    icon: Target,
    badge: "EXECUTION",
    title: "📈 Career Action Planner",
    desc: "Daily action plans that prioritize high-impact tasks to keep your job search structured and momentum-driven.",
    featured: true,
    route: "/signup",
  },
];

const FeatureShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="feature-showcase-section" id="features">
      <div className="section-header-center">
        <div className="section-kicker-badge">
          <Sparkles size={13} />
          <span>PRODUCT SUITE</span>
        </div>
        <h2 className="section-main-heading">
          One AI System. Your Entire Career Journey.
        </h2>
        <p className="section-main-subtext">
          Everything candidates need to research, optimize, prepare, and execute career transitions.
        </p>
      </div>

      <div className="features-dynamic-grid">
        {features.map(({ id, icon: Icon, badge, title, desc, featured, route }) => (
          <div
            key={id}
            className={`feature-showcase-card ${featured ? "card-featured" : ""}`}
          >
            <div className="feature-card-top">
              <span className="feature-badge">{badge}</span>
              <div className="feature-icon-box">
                <Icon size={20} />
              </div>
            </div>

            <h3 className="feature-title">{title}</h3>
            <p className="feature-desc">{desc}</p>

            <button
              type="button"
              className="feature-learn-more-btn"
              onClick={() => navigate(route)}
            >
              <span>Explore Capability</span>
              <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureShowcase;
