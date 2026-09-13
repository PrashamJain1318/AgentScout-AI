import React from "react";
import { Zap, TrendingUp, TrendingDown, Minus, Activity, Award } from "lucide-react";
import FadeIn from "../motion/FadeIn";

const MomentumScore = ({ momentum, onNavigate }) => {
  const rawScore = momentum?.score;
  const score = typeof rawScore === "number" ? Math.round(rawScore) : null;
  const hasData = score !== null && score > 0;

  const trend = momentum?.trend || "STABLE";
  const changePercentage = typeof momentum?.changePercentage === "number" ? momentum.changePercentage : 0;
  const weeklyCount = typeof momentum?.weeklyActivityCount === "number" ? momentum.weeklyActivityCount : 0;

  const getTrendIcon = () => {
    if (trend === 'UP') return <TrendingUp size={14} className="trend-up" />;
    if (trend === 'DOWN') return <TrendingDown size={14} className="trend-down" />;
    return <Minus size={14} className="trend-stable" />;
  };

  return (
    <FadeIn direction="up" distance={15}>
      <div className="momentum-widget-card" onClick={() => onNavigate('/dashboard/analytics')}>
        <div className="momentum-card-header">
          <div className="momentum-title-row">
            <Zap size={18} className="momentum-header-icon" />
            <h4 className="momentum-title">Career Momentum</h4>
          </div>
          {hasData ? (
            <span className={`momentum-trend-badge trend-${trend.toLowerCase()}`}>
              {getTrendIcon()}
              {changePercentage > 0 ? `+${changePercentage}%` : `${changePercentage}%`}
            </span>
          ) : (
            <span className="momentum-trend-badge trend-stable">
              <Minus size={14} className="trend-stable" />
              0%
            </span>
          )}
        </div>

        {hasData ? (
          <div className="momentum-gauge-section">
            <div className="momentum-score-circle">
              <svg viewBox="0 0 100 100" className="gauge-svg">
                <path
                  className="gauge-bg"
                  d="M 20 80 A 40 40 0 1 1 80 80"
                  fill="none"
                  strokeWidth="10"
                />
                <path
                  className="gauge-value"
                  d="M 20 80 A 40 40 0 1 1 80 80"
                  fill="none"
                  strokeWidth="10"
                  strokeDasharray={`${(score / 100) * 180} 200`}
                />
              </svg>
              <div className="gauge-text-overlay">
                <span className="gauge-number">{score}%</span>
                <span className="gauge-label">SCORE</span>
              </div>
            </div>

            <div className="momentum-stats-list">
              <div className="momentum-stat-item">
                <Activity size={14} className="stat-icon" />
                <div>
                  <span className="stat-value">{weeklyCount} actions</span>
                  <span className="stat-label">This Week</span>
                </div>
              </div>
              <div className="momentum-stat-item">
                <Award size={14} className="stat-icon" />
                <div>
                  <span className="stat-value">{score >= 70 ? 'High Speed' : score >= 40 ? 'Moderate' : 'Building'}</span>
                  <span className="stat-label">Velocity</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Not enough activity yet.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Complete a few career actions to start tracking momentum telemetry.
            </p>
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default MomentumScore;
