import React from 'react';
import { Brain, Sparkles, RefreshCw } from 'lucide-react';

const CareerIntelligenceEmptyState = ({
  title = "No Intelligence Insights Yet",
  description = "Start building your profile, analyzing resumes, or searching opportunities to generate AI career insights.",
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        <Brain className="w-10 h-10" />
      </div>

      <div className="max-w-md space-y-2">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analysis</span>
        </button>
      )}
    </div>
  );
};

export default CareerIntelligenceEmptyState;
