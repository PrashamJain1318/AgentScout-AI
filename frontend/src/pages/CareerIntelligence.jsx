import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Activity,
  Zap,
  AlertTriangle,
  Target,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronRight,
  Lightbulb,
  Compass
} from "lucide-react";

import PageTransition from "../components/motion/PageTransition";
import FadeIn from "../components/motion/FadeIn";
import ComponentErrorFallback from "../components/common/ComponentErrorFallback";

import {
  getIntelligenceOverview,
  runIntelligenceAnalysis
} from "../services/careerIntelligence.api";

const CareerIntelligence = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState(null);
  const [intelligence, setIntelligence] = useState(null);

  const fetchIntelligence = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIntelligenceOverview();
      setIntelligence(res?.data || null);
    } catch (err) {
      console.error("Error loading career intelligence:", err);
      setError("Unable to load predictive career intelligence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await runIntelligenceAnalysis();
      setIntelligence(res?.data || null);
    } catch (err) {
      console.error("Error recalculating intelligence:", err);
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="app-page-loader-wrapper">
        <div className="app-page-loader-card">
          <BrainCircuit size={32} className="spin-icon loader-spinner" />
          <span className="loader-text">Analyzing Predictive Career Intelligence...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px" }}>
        <ComponentErrorFallback
          title="Intelligence Engine Error"
          message={error}
          onRetry={fetchIntelligence}
        />
      </div>
    );
  }

  const {
    careerHealth = {},
    skillGaps = {},
    bottlenecks = {},
    forecasts = [],
    roiActions = {},
    risks = {},
    insights = []
  } = intelligence || {};

  const healthScore = careerHealth.score || 72;
  const healthCategory = careerHealth.category || "STRONG";
  const primaryBottleneck = bottlenecks.primaryBottleneck || null;
  const topROIAction = roiActions.highestROIAction || null;

  return (
    <PageTransition className="career-intel-container">
      {/* 1. HERO INTELLIGENCE SUMMARY HEADER */}
      <FadeIn direction="down" distance={10}>
        <header className="intel-hero-card">
          <div className="intel-hero-left">
            <div className="intel-hero-badge-row">
              <span className="intel-badge-pill">
                <BrainCircuit size={13} />
                PREDICTIVE ENGINE V1.0
              </span>
              <span className={`health-status-badge status-${healthCategory.toLowerCase()}`}>
                <CheckCircle2 size={12} />
                {healthCategory} HEALTH ({healthScore}/100)
              </span>
            </div>

            <h1 className="intel-hero-heading">
              Predictive Career Intelligence Command Center
            </h1>

            <p className="intel-hero-subheading">
              Real-time trajectory forecasting, skill gap analysis, bottleneck resolution, and high-ROI career actions.
            </p>
          </div>

          <div className="intel-hero-right">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="recalculate-intel-btn"
            >
              <RefreshCw size={14} className={recalculating ? "spin-icon" : ""} />
              <span>{recalculating ? "Analyzing..." : "Recalculate AI Engine"}</span>
            </button>
          </div>
        </header>
      </FadeIn>

      {/* 2. CAREER HEALTH SCORE & BREAKDOWN GRID */}
      <FadeIn direction="up" distance={12}>
        <section className="intel-grid-row">
          {/* Health Gauge Box */}
          <div className="intel-card health-score-card">
            <div className="intel-card-header">
              <Activity size={18} className="intel-icon-indigo" />
              <h3>Overall Career Health</h3>
            </div>

            <div className="health-score-content">
              <div className="health-gauge-box">
                <span className="health-big-score">{healthScore}</span>
                <span className="health-score-max">/ 100</span>
                <span className="health-cat-label">{healthCategory}</span>
              </div>

              <div className="health-dimensions-list">
                <div className="dimension-item">
                  <span className="dim-name">Profile Quality (15%)</span>
                  <div className="dim-bar-bg">
                    <div
                      className="dim-bar-fill"
                      style={{ width: `${careerHealth.breakdown?.profileQuality || 80}%` }}
                    />
                  </div>
                  <span className="dim-val">{careerHealth.breakdown?.profileQuality || 80}%</span>
                </div>

                <div className="dimension-item">
                  <span className="dim-name">Resume Readiness (20%)</span>
                  <div className="dim-bar-bg">
                    <div
                      className="dim-bar-fill"
                      style={{ width: `${careerHealth.breakdown?.resumeReadiness || 75}%` }}
                    />
                  </div>
                  <span className="dim-val">{careerHealth.breakdown?.resumeReadiness || 75}%</span>
                </div>

                <div className="dimension-item">
                  <span className="dim-name">Market Alignment (20%)</span>
                  <div className="dim-bar-bg">
                    <div
                      className="dim-bar-fill"
                      style={{ width: `${careerHealth.breakdown?.marketAlignment || 80}%` }}
                    />
                  </div>
                  <span className="dim-val">{careerHealth.breakdown?.marketAlignment || 80}%</span>
                </div>

                <div className="dimension-item">
                  <span className="dim-name">Skill Readiness (15%)</span>
                  <div className="dim-bar-bg">
                    <div
                      className="dim-bar-fill"
                      style={{ width: `${careerHealth.breakdown?.skillReadiness || 70}%` }}
                    />
                  </div>
                  <span className="dim-val">{careerHealth.breakdown?.skillReadiness || 70}%</span>
                </div>

                <div className="dimension-item">
                  <span className="dim-name">Application Effectiveness (15%)</span>
                  <div className="dim-bar-bg">
                    <div
                      className="dim-bar-fill"
                      style={{ width: `${careerHealth.breakdown?.applicationEffectiveness || 65}%` }}
                    />
                  </div>
                  <span className="dim-val">{careerHealth.breakdown?.applicationEffectiveness || 65}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Bottleneck Box */}
          <div className="intel-card bottleneck-card">
            <div className="intel-card-header">
              <AlertTriangle size={18} className="intel-icon-red" />
              <h3>Primary Career Bottleneck</h3>
            </div>

            {primaryBottleneck ? (
              <div className="bottleneck-content">
                <span className={`bottleneck-severity-badge severity-${primaryBottleneck.severity?.toLowerCase()}`}>
                  {primaryBottleneck.severity} SEVERITY
                </span>

                <h4 className="bottleneck-name">
                  {primaryBottleneck.bottleneck?.replace(/_/g, " ")}
                </h4>

                <p className="bottleneck-evidence">{primaryBottleneck.evidence}</p>

                <div className="bottleneck-fix-box">
                  💡 <strong>Recommended Fix:</strong> {primaryBottleneck.recommendedAction}
                </div>

                <button
                  onClick={() => navigate(primaryBottleneck.bottleneck === "LOW_ATS_SCORE" ? "/resume-studio" : "/dashboard")}
                  className="bottleneck-action-btn"
                >
                  <span>Resolve Blockage Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <p className="empty-intel-msg">No active bottlenecks detected.</p>
            )}
          </div>
        </section>
      </FadeIn>

      {/* 3. HIGHEST ROI ACTION & SKILL GAPS */}
      <FadeIn direction="up" distance={15}>
        <section className="intel-grid-row">
          {/* Highest ROI Action */}
          <div className="intel-card roi-card">
            <div className="intel-card-header">
              <Zap size={18} className="intel-icon-emerald" />
              <h3>Highest ROI Next Action</h3>
            </div>

            {topROIAction ? (
              <div className="roi-content">
                <div className="roi-meta-row">
                  <span className="roi-score-tag">ROI SCORE: {topROIAction.roiScore}%</span>
                  <span className="roi-effort-tag">EFFORT: {topROIAction.effort}</span>
                </div>

                <h4 className="roi-title">{topROIAction.title}</h4>
                <p className="roi-desc">{topROIAction.description}</p>
                <p className="roi-reason">💡 {topROIAction.reason}</p>

                <button
                  onClick={() => navigate(topROIAction.deepLink || "/dashboard")}
                  className="roi-primary-btn"
                >
                  <span>{topROIAction.actionLabel || "Execute Action"}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <p className="empty-intel-msg">All high-ROI actions up to date.</p>
            )}
          </div>

          {/* Skill Gap Matrix */}
          <div className="intel-card skill-gap-card">
            <div className="intel-card-header">
              <Target size={18} className="intel-icon-purple" />
              <h3>Skill Gap Intelligence</h3>
            </div>

            <div className="skill-gap-list">
              {(skillGaps.skillGaps || []).slice(0, 4).map((gap, idx) => (
                <div key={idx} className="skill-gap-item">
                  <div className="gap-title-row">
                    <span className="gap-skill-name">{gap.skill}</span>
                    <span className={`gap-importance-tag importance-${gap.importance?.toLowerCase()}`}>
                      {gap.importance}
                    </span>
                  </div>
                  <p className="gap-reason">{gap.reason}</p>
                </div>
              ))}

              {(!skillGaps.skillGaps || skillGaps.skillGaps.length === 0) && (
                <p className="empty-intel-msg">No critical skill gaps detected for target role.</p>
              )}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 4. TRAJECTORY FORECASTING & RISKS */}
      <FadeIn direction="up" distance={15}>
        <section className="intel-grid-row">
          {/* Forecasts */}
          <div className="intel-card forecast-card">
            <div className="intel-card-header">
              <TrendingUp size={18} className="intel-icon-blue" />
              <h3>Data-Driven Trajectory Forecasts</h3>
            </div>

            <div className="forecast-list">
              {forecasts.map((f, idx) => (
                <div key={idx} className="forecast-item">
                  <div className="forecast-meta">
                    <span className="forecast-type">{f.type}</span>
                    <span className="forecast-confidence">{f.confidence}% Confidence</span>
                  </div>
                  <h4 className="forecast-title">{f.title}</h4>
                  <p className="forecast-pred">{f.prediction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Radar */}
          <div className="intel-card risk-card">
            <div className="intel-card-header">
              <ShieldAlert size={18} className="intel-icon-amber" />
              <h3>Career Risk Mitigation Radar</h3>
            </div>

            <div className="risk-list">
              {(risks.allRisks || []).map((r, idx) => (
                <div key={idx} className="risk-item">
                  <div className="risk-title-row">
                    <span className="risk-title">{r.title}</span>
                    <span className={`risk-severity severity-${r.severity?.toLowerCase()}`}>
                      {r.severity}
                    </span>
                  </div>
                  <p className="risk-evidence">{r.evidence}</p>
                  <p className="risk-fix">🛡️ {r.recommendedMitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 5. ACTIONABLE AI INSIGHTS FEED */}
      <FadeIn direction="up" distance={15}>
        <section className="intel-insights-section">
          <div className="intel-card-header">
            <Lightbulb size={18} className="intel-icon-purple" />
            <h3>Actionable AI Insights Feed</h3>
          </div>

          <div className="insights-grid">
            {insights.map((ins, idx) => (
              <div key={ins._id || idx} className="insight-feed-card">
                <div className="insight-feed-top">
                  <span className="insight-category-tag">{ins.category}</span>
                  <span className={`insight-priority-tag priority-${ins.priority?.toLowerCase()}`}>
                    {ins.priority}
                  </span>
                </div>
                <h4 className="insight-feed-title">{ins.title}</h4>
                <p className="insight-feed-desc">{ins.description}</p>
                {ins.recommendedAction && (
                  <button
                    onClick={() => navigate(ins.recommendedAction.deepLink || "/dashboard")}
                    className="insight-feed-btn"
                  >
                    <span>{ins.recommendedAction.actionLabel || "View Strategy"}</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            ))}

            {insights.length === 0 && (
              <p className="empty-intel-msg">No active insights at this time.</p>
            )}
          </div>
        </section>
      </FadeIn>
    </PageTransition>
  );
};

export default CareerIntelligence;
