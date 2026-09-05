import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { getOverview } from '../../services/careerIntelligence.api';

const CareerIntelligenceWidget = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getOverview()
      .then((res) => {
        if (isMounted && res?.data) {
          setData(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const health = data?.health || {};
  const score = health.overallScore ?? 75;
  const trend = health.trend || 'STABLE';
  const change = health.change || 0;
  const topInsight = data?.highlights?.[0]?.title || 'Review top AI recommendations to optimize your candidate profile.';

  const renderTrend = () => {
    if (trend === 'IMPROVING' || change > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          📈 Improving (+{Math.abs(change)} pts)
        </span>
      );
    }
    if (trend === 'DECLINING' || change < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
          <TrendingDown className="w-3.5 h-3.5" />
          📉 Declining ({change} pts)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-500/10 px-2.5 py-0.5 rounded-full border border-slate-500/20">
        <Minus className="w-3.5 h-3.5" />
        ➡ Stable
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Career Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proactive AI career health and next actions
            </p>
          </div>
        </div>
        {renderTrend()}
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Career Health Score
          </span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? '...' : score} <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </span>
        </div>
        <button
          onClick={() => onNavigate('/dashboard/intelligence')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <span>View Intelligence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {topInsight && (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
          💡 <strong>Top Insight:</strong> {topInsight}
        </p>
      )}
    </div>
  );
};

export default CareerIntelligenceWidget;
