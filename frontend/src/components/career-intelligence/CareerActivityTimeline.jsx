import React from 'react';
import { History, Sparkles } from 'lucide-react';
import CareerEventItem from './CareerEventItem';

const CareerActivityTimeline = ({ events = [], onMarkRead, onArchive }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
        No recent career activity events recorded.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Recent Career Activity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Timeline of milestone events logged across platform modules
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event, idx) => (
          <CareerEventItem
            key={event._id || idx}
            event={event}
            onMarkRead={onMarkRead}
            onArchive={onArchive}
          />
        ))}
      </div>
    </div>
  );
};

export default CareerActivityTimeline;
