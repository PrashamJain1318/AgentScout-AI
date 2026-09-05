import React from 'react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'OPPORTUNITY', label: 'Opportunities' },
  { id: 'RESUME', label: 'Resume' },
  { id: 'APPLICATION', label: 'Applications' },
  { id: 'INTERVIEW', label: 'Interview' },
  { id: 'SKILL', label: 'Skills' }
];

const PRIORITIES = [
  { id: 'ALL', label: 'All Priorities' },
  { id: 'CRITICAL', label: 'Critical' },
  { id: 'HIGH', label: 'High' },
  { id: 'MEDIUM', label: 'Medium' },
  { id: 'LOW', label: 'Low' }
];

const CareerIntelligenceFilters = ({
  selectedCategory = 'ALL',
  selectedPriority = 'ALL',
  onCategoryChange,
  onPriorityChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
        <span className="text-xs font-semibold text-slate-400 mr-1 hidden lg:inline">Category:</span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Priority Selector */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <span className="text-xs font-semibold text-slate-400">Priority:</span>
        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CareerIntelligenceFilters;
