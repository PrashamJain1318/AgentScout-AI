import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, Flame, ArrowRight, ShieldAlert } from 'lucide-react';

const IntelligenceHighlights = ({ highlights = [] }) => {
  const navigate = useNavigate();

  if (!highlights || highlights.length === 0) {
    return null;
  }

  const renderBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            <Flame className="w-3 h-3 text-rose-500" />
            Critical Action
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            High Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Recommended
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            What's Important Now
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Top priority actions requiring your immediate focus
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {renderBadge(item.priority)}
                <span className="text-xs font-medium text-slate-400">
                  {item.category}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                {item.description}
              </p>

              {item.reasoning && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 italic">
                  <strong>Why it matters:</strong> {item.reasoning}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate(item.deepLink || '/dashboard')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <span>{item.actionLabel || 'Take Action'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntelligenceHighlights;
