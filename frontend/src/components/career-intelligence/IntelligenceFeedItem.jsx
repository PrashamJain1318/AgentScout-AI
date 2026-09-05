import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

const IntelligenceFeedItem = ({ item = {} }) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getPriorityBadge(item.priority)}`}>
            {item.priority || 'MEDIUM'}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {item.category || 'INSIGHT'}
          </span>
        </div>
        {item.confidence && (
          <span className="text-[11px] font-medium text-slate-400">
            Confidence: {item.confidence}%
          </span>
        )}
      </div>

      <div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
          {item.title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {item.description}
        </p>
      </div>

      {item.reasoning && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300">
          <strong className="text-slate-800 dark:text-slate-200">Why it matters:</strong> {item.reasoning}
        </div>
      )}

      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Actionable AI Recommendation
        </span>
        <button
          onClick={() => navigate(item.deepLink || '/dashboard')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <span>{item.actionLabel || 'View Action'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default IntelligenceFeedItem;
