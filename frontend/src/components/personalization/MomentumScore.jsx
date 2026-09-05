import React from "react";
import { Zap, TrendingUp, TrendingDown, Minus, Activity, Award } from "lucide-react";
import FadeIn from "../motion/FadeIn";

const MomentumScore = ({ momentum, onNavigate }) => {
  const score = momentum?.score || 70;
  const trend = momentum?.trend || 'STABLE';
  const changePercentage = momentum?.changePercentage || 5;
  const weeklyCount = momentum?.weeklyActivityCount || 3;

  const getTrendIcon = () => {
    if (trend === 'UP') return <TrendingUp size={14} className="trend-up" />;
    if (trend === 'DOWN') return <TrendingDown size={14} className="trend-down" />;
    return <Minus size={14} className="trend-stable" />;
  };

  return (
    <FadeIn direction="up" distance={15}>
      <div className="momentum-widget-card" onClick={() => onNavigate('/analytics')}>
        <div className="momentum-card-header">
          <div className="momentum-title-row">
            <Zap size={18} className="momentum-header-icon" />
            <h4 className="momentum-title">Career Momentum</h4>
          </div>
          <span className={`momentum-trend-badge trend-${trend.toLowerCase()}`}>
            {getTrendIcon()}
            {changePercentage > 0 ? `+${changePercentage}%` : `${changePercentage}%`}
          </span>
        </div>

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
                <span className="stat-value">{score >= 70 ? 'High Speed' : 'Moderate'}</span>
                <span className="stat-label">Velocity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default MomentumScore;
