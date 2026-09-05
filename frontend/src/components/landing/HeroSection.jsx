import React, { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck, Play } from "lucide-react";

// Lazy load Three.js 3D Core so initial text & CTAs load instantly
const AICareerCore = lazy(() => import("./AICareerCore"));

const StaticCoreFallback = () => (
  <div className="static-core-fallback">
    <div className="static-core-glow" />
    <div className="static-core-nodes">
      <div className="core-node-chip chip-top">
        <span className="node-dot dot-cyan" />
        <span>Opportunities</span>
      </div>
      <div className="core-node-chip chip-left">
        <span className="node-dot dot-purple" />
        <span>Resume & Skills</span>
      </div>
      <div className="core-node-chip chip-right">
        <span className="node-dot dot-indigo" />
        <span>AI Agent Core</span>
      </div>
      <div className="core-node-chip chip-bottom">
        <span className="node-dot dot-emerald" />
        <span>Next Best Action</span>
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToPreview = () => {
    const previewEl = document.getElementById("preview");
    if (previewEl) {
      previewEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="landing-hero-section">
      <div className="hero-background-glows">
        <div className="glow-sphere glow-1" />
        <div className="glow-sphere glow-2" />
      </div>

      <div className="landing-hero-grid">
        {/* Left Hero Content */}
        <div className="hero-text-container">
          <div className="hero-pill-badge">
            <Sparkles size={14} className="hero-badge-sparkle" />
            <span>THE PERSONAL AI CAREER OPERATING SYSTEM</span>
          </div>

          <h1 className="hero-main-headline">
            Your Career. <br />
            <span className="gradient-text-ai">Powered by Intelligence.</span>
          </h1>

          <p className="hero-subheadline">
            AgentScout-AI analyzes your skills, resume, active opportunities, applications, and interview performance to tell you exactly what to do next.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() => navigate("/signup")}
            >
              <span>Start Your Career Journey</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="hero-secondary-btn"
              onClick={scrollToPreview}
            >
              <Play size={14} className="play-icon" />
              <span>Explore Platform</span>
            </button>
          </div>

          <div className="hero-trust-row">
            <div className="trust-item">
              <ShieldCheck size={16} className="trust-icon" />
              <span>Human-in-the-Loop Approval Boundary</span>
            </div>
            <div className="trust-item">
              <span className="trust-bullet">●</span>
              <span>Zero Career Guesswork</span>
            </div>
          </div>
        </div>

        {/* Right 3D Visual / Fallback */}
        <div className="hero-visual-container">
          <Suspense fallback={<StaticCoreFallback />}>
            <AICareerCore />
          </Suspense>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
