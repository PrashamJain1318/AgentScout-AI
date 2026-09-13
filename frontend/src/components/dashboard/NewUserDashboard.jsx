import React from "react";
import {
  Sparkles,
  Target,
  FileText,
  Brain,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  Check,
  Compass,
  ShieldCheck
} from "lucide-react";
import FadeIn from "../motion/FadeIn";
import MotionButton from "../motion/MotionButton";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const NewUserDashboard = ({
  user,
  firstName,
  hasTargetRole,
  hasResume,
  hasSkills,
  onNavigate
}) => {
  const greeting = getGreeting();
  const displayName = firstName ? `${firstName}` : "there";

  // Step statuses
  const step1Status = hasTargetRole ? "COMPLETED" : "ACTIVE";
  const step2Status = !hasTargetRole ? "LOCKED" : hasResume ? "COMPLETED" : "ACTIVE";
  const step3Status = !hasTargetRole ? "LOCKED" : hasSkills ? "COMPLETED" : "ACTIVE";
  const step4Status = !hasTargetRole || !hasResume ? "LOCKED" : "ACTIVE";

  return (
    <div className="new-user-dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* 1. TOP HEADER */}
      <FadeIn direction="down" distance={10}>
        <header className="db-welcome-card personalized-header-glow" style={{ padding: "20px 24px" }}>
          <div className="db-welcome-left">
            <h1 className="db-welcome-heading" style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {greeting}, {displayName} 👋
            </h1>
            <p className="db-welcome-subheading" style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px" }}>
              Let's build your career intelligence
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="stage-pill-badge" style={{ fontSize: "12px", padding: "4px 10px" }}>
              <ShieldCheck size={13} />
              {hasTargetRole ? "TARGET ROLE SET" : "PROFILE BUILDING"}
            </span>
            <span className="momentum-pill-badge" style={{ fontSize: "12px", padding: "4px 10px" }}>
              <Zap size={13} />
              0% MOMENTUM
            </span>
          </div>
        </header>
      </FadeIn>

      {/* 2. HERO ONBOARDING CARD */}
      <FadeIn direction="up" distance={15}>
        <section
          className="new-user-hero-card"
          style={{
            position: "relative",
            padding: "32px 36px",
            borderRadius: "var(--radius-xl)",
            background: "linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            boxShadow: "0 0 35px rgba(124, 58, 237, 0.18)",
            overflow: "hidden"
          }}
        >
          {/* Ambient Background Glow */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "250px",
              height: "250px",
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
              pointerEvents: "none"
            }}
          />

          <div style={{ maxWidth: "680px", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Sparkles size={16} className="text-primary" />
              <span className="eyebrow text-primary" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em" }}>
                AI CAREER INTELLIGENCE SETUP
              </span>
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 12px 0", color: "var(--text)" }}>
              Build your career intelligence
            </h2>

            <p style={{ fontSize: "15px", lineHeight: "1.6", color: "var(--text-muted)", margin: "0 0 24px 0" }}>
              AgentScout uses your goals, experience, skills, and resume to personalize your entire career journey. Start by telling us what role you're targeting.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <MotionButton
                type="button"
                className="save-profile-btn"
                onClick={() => onNavigate("/settings")}
                style={{
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)"
                }}
              >
                <Target size={16} />
                <span>{hasTargetRole ? "Edit Target Role" : "Set Your Target Role →"}</span>
              </MotionButton>

              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Takes less than a minute.
              </span>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 3. CAREER SETUP JOURNEY */}
      <FadeIn direction="up" distance={15}>
        <section className="career-journey-container">
          <div className="journey-header" style={{ marginBottom: "16px" }}>
            <div className="journey-title-wrap">
              <Compass size={18} className="journey-icon" />
              <h3 className="journey-heading" style={{ fontSize: "18px", fontWeight: 700 }}>YOUR CAREER SETUP</h3>
            </div>
            <span className="journey-sublabel" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Complete these steps to unlock your personalized career intelligence.
            </span>
          </div>

          <div
            className="journey-pipeline-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px"
            }}
          >
            {/* Step 1: Target Role */}
            <div
              className={`journey-step-card ${hasTargetRole ? "step-completed" : "step-active"}`}
              onClick={() => onNavigate("/settings")}
              style={{
                cursor: "pointer",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                background: "var(--card-bg)",
                border: hasTargetRole ? "1px solid var(--success-bg)" : "1px solid rgba(139, 92, 246, 0.4)",
                boxShadow: !hasTargetRole ? "0 0 15px rgba(124, 58, 237, 0.15)" : "none"
              }}
            >
              <div className="step-top-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="step-number" style={{ fontSize: "12px", fontWeight: 700, opacity: 0.7 }}>01</span>
                <span
                  className="step-status-tag"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: hasTargetRole ? "var(--success-bg)" : "rgba(124, 58, 237, 0.2)",
                    color: hasTargetRole ? "var(--success)" : "#a78bfa",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {hasTargetRole ? <CheckCircle2 size={12} /> : <ShieldCheck size={12} />}
                  {step1Status}
                </span>
              </div>
              <h4 className="step-label" style={{ fontSize: "15px", fontWeight: 600, margin: "4px 0" }}>
                TARGET ROLE
              </h4>
              <p className="step-desc" style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Tell AgentScout what role you're aiming for.
              </p>
            </div>

            {/* Step 2: Resume */}
            <div
              className={`journey-step-card ${hasResume ? "step-completed" : hasTargetRole ? "step-active" : "step-upcoming"}`}
              onClick={() => onNavigate("/resume")}
              style={{
                cursor: "pointer",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                opacity: !hasTargetRole ? 0.65 : 1
              }}
            >
              <div className="step-top-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="step-number" style={{ fontSize: "12px", fontWeight: 700, opacity: 0.7 }}>02</span>
                <span
                  className="step-status-tag"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: hasResume ? "var(--success-bg)" : "rgba(255, 255, 255, 0.05)",
                    color: hasResume ? "var(--success)" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {hasResume ? <CheckCircle2 size={12} /> : !hasTargetRole ? <Lock size={11} /> : <FileText size={11} />}
                  {step2Status}
                </span>
              </div>
              <h4 className="step-label" style={{ fontSize: "15px", fontWeight: 600, margin: "4px 0" }}>
                RESUME
              </h4>
              <p className="step-desc" style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Upload your resume for AI-powered ATS analysis.
              </p>
            </div>

            {/* Step 3: Skills */}
            <div
              className={`journey-step-card ${hasSkills ? "step-completed" : hasTargetRole ? "step-active" : "step-upcoming"}`}
              onClick={() => onNavigate("/profile")}
              style={{
                cursor: "pointer",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                opacity: !hasTargetRole ? 0.65 : 1
              }}
            >
              <div className="step-top-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="step-number" style={{ fontSize: "12px", fontWeight: 700, opacity: 0.7 }}>03</span>
                <span
                  className="step-status-tag"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: hasSkills ? "var(--success-bg)" : "rgba(255, 255, 255, 0.05)",
                    color: hasSkills ? "var(--success)" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {hasSkills ? <CheckCircle2 size={12} /> : !hasTargetRole ? <Lock size={11} /> : <Brain size={11} />}
                  {step3Status}
                </span>
              </div>
              <h4 className="step-label" style={{ fontSize: "15px", fontWeight: 600, margin: "4px 0" }}>
                SKILLS
              </h4>
              <p className="step-desc" style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Build your personalized skill profile.
              </p>
            </div>

            {/* Step 4: Opportunities */}
            <div
              className="journey-step-card step-upcoming"
              onClick={() => onNavigate("/opportunities")}
              style={{
                cursor: "pointer",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                opacity: !hasTargetRole ? 0.65 : 1
              }}
            >
              <div className="step-top-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="step-number" style={{ fontSize: "12px", fontWeight: 700, opacity: 0.7 }}>04</span>
                <span
                  className="step-status-tag"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Lock size={11} />
                  {step4Status}
                </span>
              </div>
              <h4 className="step-label" style={{ fontSize: "15px", fontWeight: 600, margin: "4px 0" }}>
                OPPORTUNITIES
              </h4>
              <p className="step-desc" style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Discover jobs matched to your profile.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 4. WHAT YOU'LL UNLOCK */}
      <FadeIn direction="up" distance={15}>
        <section>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>WHAT YOU'LL UNLOCK</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              Your personalized career intelligence becomes more powerful as you complete your profile.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px"
            }}
          >
            {/* Card 1: Resume Intelligence */}
            <div
              className="resume-section-card"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-xl)",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(139, 92, 246, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px"
                  }}
                >
                  <FileText size={18} className="text-primary" />
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px 0" }}>Resume Intelligence</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5", margin: 0 }}>
                  Upload your resume to unlock ATS analysis, keyword optimization, and resume recommendations.
                </p>
              </div>

              <div style={{ marginTop: "20px" }}>
                {hasTargetRole ? (
                  <button
                    type="button"
                    className="save-profile-btn"
                    onClick={() => onNavigate("/resume")}
                    style={{ width: "100%", justifyContent: "center", fontSize: "13px" }}
                  >
                    <span>Upload Resume</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="secondary-action-btn"
                    disabled
                    style={{ width: "100%", justifyContent: "center", fontSize: "12px", opacity: 0.6 }}
                  >
                    <span>Complete target role first</span>
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Skill Intelligence */}
            <div
              className="resume-section-card"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-xl)",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(99, 102, 241, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px"
                  }}
                >
                  <Brain size={18} style={{ color: "#818cf8" }} />
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px 0" }}>Skill Intelligence</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5", margin: 0 }}>
                  Discover your strengths, skill gaps, and the capabilities you need for your target role.
                </p>
              </div>

              <div style={{ marginTop: "20px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-muted)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Lock size={11} /> LOCKED
                </span>
              </div>
            </div>

            {/* Card 3: AI Job Matching */}
            <div
              className="resume-section-card"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-xl)",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                justify: "space-between"
              }}
            >
              <div>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(236, 72, 153, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px"
                  }}
                >
                  <Sparkles size={18} style={{ color: "#f472b6" }} />
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px 0" }}>AI Job Matching</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5", margin: 0 }}>
                  Let AgentScout discover opportunities that match your goals, skills, and experience.
                </p>
              </div>

              <div style={{ marginTop: "20px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-muted)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Lock size={11} /> LOCKED
                </span>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 5. CAREER INTELLIGENCE EMPTY STATE */}
      <FadeIn direction="up" distance={15}>
        <section>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>YOUR CAREER INTELLIGENCE</h3>
          </div>

          <div
            className="resume-section-card"
            style={{
              padding: "40px 24px",
              borderRadius: "var(--radius-xl)",
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "rgba(139, 92, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.2)"
              }}
            >
              <Sparkles size={24} className="text-primary" />
            </div>

            <h4 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0" }}>
              Your career intelligence workspace is waiting.
            </h4>

            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 20px 0" }}>
              Complete your profile to unlock:
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                maxWidth: "520px",
                width: "100%",
                margin: "0 auto 28px auto",
                textAlign: "left"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text)" }}>
                <Check size={14} className="text-primary" />
                <span>Personalized job matching</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text)" }}>
                <Check size={14} className="text-primary" />
                <span>Resume intelligence</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text)" }}>
                <Check size={14} className="text-primary" />
                <span>Skill gap analysis</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text)" }}>
                <Check size={14} className="text-primary" />
                <span>Interview preparation</span>
              </div>
            </div>

            <MotionButton
              type="button"
              className="save-profile-btn"
              onClick={() => onNavigate("/settings")}
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              <span>Complete Your Profile</span>
              <ArrowRight size={14} />
            </MotionButton>
          </div>
        </section>
      </FadeIn>

      {/* 6. COMPACT CAREER MOMENTUM */}
      <FadeIn direction="up" distance={15}>
        <div
          className="resume-section-card"
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-lg)",
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Zap size={18} className="text-primary" />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong style={{ fontSize: "14px" }}>CAREER MOMENTUM</strong>
                <span className="stage-pill-badge" style={{ fontSize: "11px", padding: "1px 6px" }}>0%</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                Build momentum by completing your first career action.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="section-link-btn"
            onClick={() => onNavigate("/settings")}
            style={{ fontSize: "12px" }}
          >
            <span>Start Setup →</span>
          </button>
        </div>
      </FadeIn>
    </div>
  );
};

export default NewUserDashboard;
