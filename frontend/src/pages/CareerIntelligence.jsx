import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

import PageTransition from '../components/motion/PageTransition';
import ComponentErrorFallback from '../components/common/ComponentErrorFallback';

import CareerHealthHero from '../components/career-intelligence/CareerHealthHero';
import IntelligenceHighlights from '../components/career-intelligence/IntelligenceHighlights';
import HealthBreakdown from '../components/career-intelligence/HealthBreakdown';
import CareerIntelligenceFilters from '../components/career-intelligence/CareerIntelligenceFilters';
import IntelligenceFeed from '../components/career-intelligence/IntelligenceFeed';
import CareerActivityTimeline from '../components/career-intelligence/CareerActivityTimeline';
import CareerIntelligenceSkeleton from '../components/career-intelligence/CareerIntelligenceSkeleton';

import {
  getOverview,
  refreshIntelligence,
  markEventRead,
  archiveEvent
} from '../services/careerIntelligence.api';

const CareerIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOverview();
      setData(res?.data || null);
    } catch (err) {
      console.error('Error fetching Career Intelligence:', err);
      setError('Unable to load Career Intelligence. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await refreshIntelligence();
      setData(res?.data || null);
    } catch (err) {
      console.error('Error refreshing intelligence:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkRead = async (eventId) => {
    try {
      await markEventRead(eventId);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          events: (prev.events || []).map((e) => (e._id === eventId ? { ...e, isRead: true } : e))
        };
      });
    } catch (err) {
      console.error('Error marking event as read:', err);
    }
  };

  const handleArchive = async (eventId) => {
    try {
      await archiveEvent(eventId);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          events: (prev.events || []).filter((e) => e._id !== eventId)
        };
      });
    } catch (err) {
      console.error('Error archiving event:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Career Intelligence
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              Loading your personalized view of what is improving, what needs attention, and what to do next...
            </p>
          </div>
          <CareerIntelligenceSkeleton />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <ComponentErrorFallback
            title="Career Intelligence Error"
            message={error}
            onRetry={loadData}
          />
        </div>
      </PageTransition>
    );
  }

  const {
    health = {},
    highlights = [],
    feed = [],
    events = []
  } = data || {};

  // Filter feed items based on category and priority filters
  const filteredFeed = feed.filter((item) => {
    const matchCategory = selectedCategory === 'ALL' || item.category?.toUpperCase() === selectedCategory;
    const matchPriority = selectedPriority === 'ALL' || item.priority?.toUpperCase() === selectedPriority;
    return matchCategory && matchPriority;
  });

  return (
    <PageTransition>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Brain className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Career Intelligence
              </h1>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your personalized view of what is improving, what needs attention, and what to do next.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Intelligence'}</span>
          </button>
        </div>

        {/* Section 1: Career Health Hero */}
        <CareerHealthHero
          health={health}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
        />

        {/* Section 2: What's Important Now */}
        <IntelligenceHighlights highlights={highlights} />

        {/* Section 3: Career Health Breakdown */}
        <HealthBreakdown breakdown={health.breakdown} />

        {/* Section 4: AI Intelligence Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Intelligence Feed
            </h3>
            <span className="text-xs font-medium text-slate-400">
              Showing {filteredFeed.length} insight(s)
            </span>
          </div>

          <CareerIntelligenceFilters
            selectedCategory={selectedCategory}
            selectedPriority={selectedPriority}
            onCategoryChange={setSelectedCategory}
            onPriorityChange={setSelectedPriority}
          />

          <IntelligenceFeed feed={filteredFeed} />
        </div>

        {/* Section 5: Recent Career Activity Timeline */}
        <CareerActivityTimeline
          events={events}
          onMarkRead={handleMarkRead}
          onArchive={handleArchive}
        />
      </div>
    </PageTransition>
  );
};

export default CareerIntelligence;
