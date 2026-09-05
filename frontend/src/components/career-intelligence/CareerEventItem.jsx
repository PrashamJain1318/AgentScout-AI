import React from 'react';
import {
  CheckCircle2,
  Clock,
  Archive,
  Check,
  Sparkles,
  FileText,
  BookmarkCheck,
  MessageSquare
} from 'lucide-react';

const CATEGORY_ICONS = {
  PROFILE: Sparkles,
  RESUME: FileText,
  APPLICATION: BookmarkCheck,
  INTERVIEW: MessageSquare,
  OPPORTUNITY: Sparkles
};

const CareerEventItem = ({ event = {}, onMarkRead, onArchive }) => {
  const Icon = CATEGORY_ICONS[event.category] || Sparkles;
  const dateStr = event.occurredAt
    ? new Date(event.occurredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  return (
    <div
      className={`p-4 rounded-xl border transition-all space-y-2 ${
        event.isRead
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
          : 'bg-white dark:bg-slate-900 border-indigo-500/30 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {event.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {dateStr}
          </span>

          {!event.isRead && onMarkRead && (
            <button
              onClick={() => onMarkRead(event._id)}
              title="Mark as Read"
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          {onArchive && (
            <button
              onClick={() => onArchive(event._id)}
              title="Archive Event"
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
        {event.description}
      </p>
    </div>
  );
};

export default CareerEventItem;
