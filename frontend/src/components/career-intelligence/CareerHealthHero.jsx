import React from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Sparkles } from 'lucide-react';
import HealthScoreRing from './HealthScoreRing';

const CareerHealthHero = ({ health = {}, onRefresh, isRefreshing = false }) => {
  const {
    overallScore = 70,
    previousScore = 70,
    change = 0,
    trend = 'STABLE',
    strengths = [],
    concerns = []
  } = health;

  const renderTrendBadge = () => {
    if (trend === 'IMPROVING' || change > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          📈 Improving (+{Math.abs(change)} pts)
        </span>
      );
    }
    if (trend === 'DECLINING' || change < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <TrendingDown className="w-3.5 h-3.5" />
          📉 Declining ({change} pts)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
        <Minus className="w-3.5 h-3.5" />
        ➡ Stable (0 pts)
      </span>
    );
  };

  const aiExplanation = change > 0
    ? `Your career health improved because your resume ATS score and application activity increased.`
    : change < 0
    ? `Your career health declined due to low recent application submissions. Recommended actions can restore momentum.`
    : `Your career health is steady. Optimize resume keywords and practice interviews to boost overall score.`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-white shadow-xl border border-slate-800">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Career Health Score
            </span>
            {renderTrendBadge()}
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Overall Health: <span className="text-indigo-400">{overallScore}</span> / 100
          </h2>

          <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
            {aiExplanation}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Recalculating...' : 'Recalculate Health'}
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 p-2">
          <HealthScoreRing score={overallScore} size={150} strokeWidth={12} />
        </div>
      </div>
    </div>
  );
};

export default CareerHealthHero;
