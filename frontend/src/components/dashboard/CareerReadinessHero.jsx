import React from "react";
import { TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import AnimatedNumber from "../motion/AnimatedNumber";
import AnimatedProgress from "../motion/AnimatedProgress";
import MotionButton from "../motion/MotionButton";
import FadeIn from "../motion/FadeIn";

const getRealScore = (val) => {
  const num = Number(val);
  if (Number.isFinite(num) && num >= 0) {
    return Math.min(100, Math.round(num));
  }
  return null;
};

const CareerReadinessHero = ({ osSnapshot, onNavigate }) => {
  const rawOverall = osSnapshot?.readinessMetrics?.overall ?? osSnapshot?.careerScore;
  const overallScore = getRealScore(rawOverall);
  const hasData = overallScore !== null;

  const resumeScore = getRealScore(osSnapshot?.readinessMetrics?.resume);
  const skillsScore = getRealScore(osSnapshot?.readinessMetrics?.skills);
  const expScore = getRealScore(osSnapshot?.readinessMetrics?.experience);
  const interviewScore = getRealScore(osSnapshot?.readinessMetrics?.interview);

  const metrics = [
    { label: "Resume ATS", score: resumeScore },
    { label: "Skills Match", score: skillsScore },
    { label: "Experience", score: expScore },
    { label: "Interview", score: interviewScore },
  ];

  return (
    <FadeIn direction="up">
      <section className="db-readiness-hero">
        <div className="db-readiness-main flex-1">
          <div className="db-readiness-tag">
            <ShieldCheck size={14} />
            <span>CAREER READINESS TELEMETRY</span>
          </div>

          <div className="db-readiness-score-display">
            {hasData ? (
              <AnimatedNumber
                value={overallScore}
                suffix="%"
                duration={900}
                className="db-readiness-score-num"
              />
            ) : (
              <span className="db-readiness-score-num text-slate-400">N/A</span>
            )}

            <div className="db-readiness-score-text">
              <h3>{hasData ? "Opportunity Readiness Score" : "Career Readiness Unavailable"}</h3>
              <p>
                {hasData
                  ? "Calculated telemetry based on target role requirements and profile data."
                  : "Complete your profile and upload a resume to calculate your opportunity readiness telemetry."}
              </p>
            </div>
          </div>

          <div className="db-readiness-bar-container">
            <AnimatedProgress value={hasData ? overallScore : 0} height={8} />
          </div>

          <div className="db-readiness-breakdown-row">
            {metrics.map((m) => (
              <div key={m.label} className="db-readiness-mini-metric">
                <span className="mini-metric-label">{m.label}</span>
                {m.score !== null ? (
                  <AnimatedNumber
                    value={m.score}
                    suffix="%"
                    duration={750}
                    className="mini-metric-val"
                  />
                ) : (
                  <span className="mini-metric-val text-xs text-slate-400">--</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="db-readiness-side-cta">
          {hasData && osSnapshot?.momentum?.changePercentage ? (
            <div className="db-readiness-badge">
              <TrendingUp size={16} />
              <span>{osSnapshot.momentum.changePercentage > 0 ? `+${osSnapshot.momentum.changePercentage}% this week` : `${osSnapshot.momentum.changePercentage}% this week`}</span>
            </div>
          ) : (
            <div className="db-readiness-badge opacity-75">
              <ShieldCheck size={16} />
              <span>{hasData ? "Telemetry Active" : "Pending Profile Data"}</span>
            </div>
          )}
          <MotionButton
            className="db-readiness-btn"
            onClick={() => onNavigate(hasData ? "/dashboard/career-os" : "/dashboard/profile")}
          >
            <span>{hasData ? "View Full Career OS" : "Complete Profile"}</span>
            <ArrowRight size={14} />
          </MotionButton>
        </div>
      </section>
    </FadeIn>
  );
};

export default CareerReadinessHero;
