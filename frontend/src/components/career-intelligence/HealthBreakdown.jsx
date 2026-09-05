import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRound,
  FileText,
  BookmarkCheck,
  Brain,
  MessageSquare,
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const CATEGORY_CONFIG = {
  profile: { label: 'Profile', weight: '10%', icon: UserRound, path: '/profile' },
  resume: { label: 'Resume', weight: '20%', icon: FileText, path: '/dashboard/resume' },
  applications: { label: 'Applications', weight: '20%', icon: BookmarkCheck, path: '/dashboard/applications' },
  skills: { label: 'Skills', weight: '15%', icon: Brain, path: '/dashboard/career-planner' },
  interview: { label: 'Interview', weight: '15%', icon: MessageSquare, path: '/dashboard/interview-coach' },
  activity: { label: 'Activity', weight: '10%', icon: Activity, path: '/dashboard/analytics' },
  opportunities: { label: 'Opportunities', weight: '10%', icon: Sparkles, path: '/opportunities' }
};

const HealthBreakdown = ({ breakdown = {} }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Career Health Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weighted performance breakdown across 7 core platform categories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const catData = breakdown[key] || { score: 70, weight: 10 };
          const score = catData.score ?? 70;
          const Icon = config.icon;

          let barColor = 'bg-blue-500';
          if (score >= 80) barColor = 'bg-emerald-500';
          else if (score >= 60) barColor = 'bg-amber-500';
          else barColor = 'bg-rose-500';

          return (
            <div
              key={key}
              onClick={() => navigate(config.path)}
              className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {config.label}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {config.weight}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span>Score</span>
                  <span className="font-bold text-slate-900 dark:text-white">{score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>View Module</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthBreakdown;
