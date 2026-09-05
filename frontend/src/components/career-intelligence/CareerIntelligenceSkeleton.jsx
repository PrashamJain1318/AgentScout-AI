import React from 'react';

const CareerIntelligenceSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800" />

      {/* Highlights Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Breakdown Skeleton */}
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />

      {/* Feed Skeleton */}
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
};

export default CareerIntelligenceSkeleton;
