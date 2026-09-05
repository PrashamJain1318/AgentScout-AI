import React from 'react';

const HealthScoreRing = ({ score = 0, size = 140, strokeWidth = 10 }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#3b82f6'; // Blue for developing
  if (normalizedScore >= 80) strokeColor = '#10b981'; // Green for strong/excellent
  else if (normalizedScore >= 60) strokeColor = '#f59e0b'; // Amber for moderate
  else strokeColor = '#ef4444'; // Red for critical

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {normalizedScore}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
};

export default HealthScoreRing;
