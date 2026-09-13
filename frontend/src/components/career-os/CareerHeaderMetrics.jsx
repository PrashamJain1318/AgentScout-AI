import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Target
} from "lucide-react";
import { getCareerHealthMetrics } from "../../utils/careerHealth";

const CareerHealthGauge = ({ score = null, status = {} }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (score === null || score === 0) {
      setAnimatedScore(0);
      return;
    }
    const target = Math.min(100, Math.max(0, score));
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, 22);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (animatedScore / 100));
  const strokeColor = status.color || "#8b5cf6";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--border-color, #e2e8f0)" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.05s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 800, lineHeight: 1, color: "var(--text-main, #0f172a)" }}>
            {score !== null && score > 0 ? animatedScore : "—"}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted, #64748b)", marginTop: "2px" }}>
            / 100
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: "12px",
          background: `rgba(139, 92, 246, 0.12)`,
          color: strokeColor,
          textAlign: "center"
        }}
      >
        {status.label || "Not Available"}
      </div>
    </div>
  );
};

export const CareerScore = ({ careerState = {}, score: propScore = null, stage: propStage = null }) => {
  const navigate = useNavigate();

  // Consolidate state using centralized utility selector
  const metrics = getCareerHealthMetrics({
    ...careerState,
    ...(propScore !== null ? { osSnapshot: { ...careerState?.osSnapshot, careerScore: propScore } } : {})
  });

  const {
    score,
    status,
    dimensions,
    availableDimensionsCount,
    totalDimensionsCount,
    factors,
    nextBestAction,
    currentStage,
    isNewUser
  } = metrics;

  return (
    <div
      className="resume-section-card"
      style={{
        padding: "24px",
        background: "var(--card-bg, #ffffff)",
        borderRadius: "14px",
        border: "1px solid var(--border-color, #e2e8f0)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
      }}
    >
      {/* 1. Header & Stage Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div>
          <span className="eyebrow" style={{ color: "var(--primary, #8b5cf6)", letterSpacing: "0.08em", fontWeight: 700 }}>
            COMPOSITE SCORE
          </span>
          <h3 style={{ margin: "4px 0 2px 0", fontSize: "20px", fontWeight: 800 }}>Career Health Score</h3>
          <p className="notif-subtext" style={{ margin: 0, fontSize: "13px", color: "var(--text-muted, #64748b)" }}>
            Weighted benchmark based on profile, resume ATS, match fit, and interview readiness.
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <span className="eyebrow" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted, #64748b)" }}>
            CURRENT STAGE
          </span>
          <div
            onClick={() => navigate(currentStage.link)}
            style={{
              marginTop: "4px",
              fontSize: "12px",
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: "20px",
              background: "rgba(139, 92, 246, 0.1)",
              color: "var(--primary, #8b5cf6)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              border: "1px solid rgba(139, 92, 246, 0.2)"
            }}
          >
            <ShieldCheck size={14} />
            <span>{currentStage.label}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Score Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          padding: "20px",
          borderRadius: "12px",
          background: "var(--subtle-bg, #f8fafc)",
          border: "1px solid var(--border-color, #f1f5f9)"
        }}
      >
        {/* Left Column: Gauge & Overall Status */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px" }}>
          <CareerHealthGauge score={score} status={status} />
          <div style={{ marginTop: "12px", fontSize: "12px", fontWeight: 600, color: "var(--text-muted, #64748b)" }}>
            {availableDimensionsCount} / {totalDimensionsCount} dimensions available
          </div>
        </div>

        {/* Right Column: Score Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted, #64748b)" }}>
              SCORE BREAKDOWN
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>
              Real candidate state
            </span>
          </div>

          {Object.values(dimensions).map((dim) => {
            const isAvailable = dim.available && typeof dim.score === "number" && dim.score > 0;
            const percentage = isAvailable ? dim.score : 0;

            return (
              <div
                key={dim.key}
                onClick={() => navigate(dim.link)}
                style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
                title={`Go to ${dim.label}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                  <span style={{ color: "var(--text-main, #1e293b)" }}>{dim.label}</span>
                  <span style={{ fontWeight: 700, color: isAvailable ? "var(--primary, #8b5cf6)" : "var(--text-muted, #94a3b8)" }}>
                    {dim.statusText}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    width: "100%",
                    borderRadius: "4px",
                    background: "var(--border-color, #e2e8f0)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${percentage}%`,
                      background: isAvailable
                        ? "linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)"
                        : "transparent",
                      borderRadius: "4px",
                      transition: "width 0.6s ease"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Section: What's Affecting Your Score */}
      <div style={{ marginTop: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted, #64748b)", marginBottom: "10px" }}>
          WHAT'S AFFECTING YOUR SCORE
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
          {factors.map((factor, idx) => (
            <div
              key={idx}
              onClick={() => navigate(factor.link)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: factor.type === "positive" ? "rgba(16, 185, 129, 0.06)" : "rgba(245, 158, 11, 0.06)",
                border: `1px solid ${factor.type === "positive" ? "rgba(16, 185, 129, 0.18)" : "rgba(245, 158, 11, 0.18)"}`,
                cursor: "pointer"
              }}
            >
              {factor.type === "positive" ? (
                <CheckCircle2 size={16} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
              ) : (
                <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }} />
              )}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main, #0f172a)" }}>
                  {factor.title}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", marginTop: "2px", lineHeight: 1.4 }}>
                  {factor.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Section: Next Best Action Banner */}
      {nextBestAction && (
        <div
          style={{
            marginTop: "20px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            display: "flex",
            justify: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} style={{ color: "var(--primary, #8b5cf6)" }} />
              <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--primary, #8b5cf6)" }}>
                NEXT BEST ACTION
              </span>
            </div>
            <h4 style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: 700 }}>{nextBestAction.title}</h4>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted, #64748b)" }}>
              {nextBestAction.description}
            </p>
          </div>

          <button
            type="button"
            className="save-profile-btn"
            onClick={() => navigate(nextBestAction.link)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 700,
              whiteSpace: "nowrap"
            }}
          >
            <span>{nextBestAction.buttonText}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export const CareerMomentum = ({ momentum = {}, careerState = {} }) => {
  const navigate = useNavigate();

  const metrics = getCareerHealthMetrics({
    ...careerState,
    ...(momentum.score !== undefined ? { momentumScore: momentum.score } : {})
  });

  const { score = 0, trend = "NEUTRAL", changePercentage = 0, activeEventsCount = 0 } = metrics.momentum;

  const renderTrendIcon = () => {
    if (trend === "UP") return <TrendingUp size={16} style={{ color: "#10b981" }} />;
    if (trend === "DOWN") return <TrendingDown size={16} style={{ color: "#ef4444" }} />;
    return <Minus size={16} style={{ color: "#94a3b8" }} />;
  };

  return (
    <div
      className="summary-metric-item"
      style={{
        background: "var(--card-bg, #ffffff)",
        padding: "18px 20px",
        borderRadius: "14px",
        border: "1px solid var(--border-color, #e2e8f0)",
        minWidth: "240px",
        display: "flex",
        flexDirection: "column",
        justify: "space-between"
      }}
    >
      <div>
        <div className="flex-between">
          <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700 }}>
            <Activity size={16} className="text-primary" /> Career Momentum
          </span>
          {renderTrendIcon()}
        </div>

        <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "6px" }}>
          <strong className="metric-val" style={{ fontSize: "28px", fontWeight: 800 }}>
            {activeEventsCount > 0 ? score : 0}
          </strong>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted, #64748b)" }}>/ 100</span>
        </div>

        {activeEventsCount > 0 ? (
          <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: 700, color: changePercentage >= 0 ? "#10b981" : "#ef4444" }}>
            {changePercentage >= 0 ? `+${changePercentage}%` : `${changePercentage}%`} this week
          </div>
        ) : (
          <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-muted, #64748b)", lineHeight: 1.4 }}>
            Not enough activity yet. Complete your first career action to start building momentum.
          </div>
        )}
      </div>

      <button
        type="button"
        className="secondary-action-btn"
        onClick={() => navigate(metrics.nextBestAction?.link || "/dashboard/settings")}
        style={{
          marginTop: "14px",
          width: "100%",
          padding: "6px 12px",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px"
        }}
      >
        <span>Build Momentum</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
};
