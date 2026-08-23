import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import MonitorHeader from "../components/opportunity-monitor/MonitorHeader";
import MonitorStatus from "../components/opportunity-monitor/MonitorStatus";
import OpportunityDigest from "../components/opportunity-monitor/OpportunityDigest";
import OpportunityRecommendationGrid from "../components/opportunity-monitor/OpportunityRecommendationGrid";
import Watchlist from "../components/opportunity-monitor/Watchlist";
import MonitorPreferences from "../components/opportunity-monitor/MonitorPreferences";
import { MonitorEmptyState } from "../components/opportunity-monitor/MonitorStates";
import { getCachedData, setCachedData } from "../services/api";

import {
  getMonitor,
  updateMonitor,
  startMonitor,
  pauseMonitor,
  runMonitor,
  getRecommendations,
  getDigest,
  watchOpportunity,
  unwatchOpportunity,
  dismissOpportunity
} from "../services/opportunityMonitor.api";

const CACHE_KEY = "opportunity-monitor-data";

const OpportunityMonitor = () => {
  const cached = getCachedData(CACHE_KEY);

  const [monitor, setMonitor] = useState(cached?.data?.monitor || null);
  const [recommendations, setRecommendations] = useState(cached?.data?.recommendations || []);
  const [digest, setDigest] = useState(cached?.data?.digest || null);

  const [loading, setLoading] = useState(!cached?.data);
  const [running, setRunning] = useState(false);
  const [savingPref, setSavingPref] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchData = async () => {
    if (!cached?.data) setLoading(true);
    setErrorNotice(null);

    try {
      const results = await Promise.allSettled([
        getMonitor(),
        getRecommendations(),
        getDigest()
      ]);

      const monRes = results[0].status === "fulfilled" ? results[0].value?.data : monitor;
      const recRes = results[1].status === "fulfilled" ? results[1].value?.data : recommendations;
      const digRes = results[2].status === "fulfilled" ? results[2].value?.data : digest;

      setMonitor(monRes || null);
      setRecommendations(recRes || []);
      setDigest(digRes || null);

      setCachedData(CACHE_KEY, {
        monitor: monRes,
        recommendations: recRes,
        digest: digRes
      });
    } catch (err) {
      setErrorNotice("Failed to refresh opportunity monitor data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Run Monitor Manual Trigger
  const handleRunMonitor = async () => {
    setRunning(true);
    setErrorNotice(null);

    try {
      await runMonitor();
      await fetchData();
    } catch (err) {
      setErrorNotice("Unable to run opportunity monitoring engine.");
    } finally {
      setRunning(false);
    }
  };

  // Handle Toggle Monitor Pause/Start
  const handleToggleMonitor = async () => {
    if (!monitor) return;
    const isEnabled = monitor.enabled !== false;

    try {
      const res = isEnabled ? await pauseMonitor() : await startMonitor();
      setMonitor(res.data || null);
    } catch (err) {
      setErrorNotice("Unable to update monitoring status.");
    }
  };

  // Handle Save Preferences
  const handleSavePreferences = async (prefUpdates) => {
    setSavingPref(true);
    try {
      const res = await updateMonitor(prefUpdates);
      setMonitor(res.data || null);
    } catch (err) {
      setErrorNotice("Failed to save monitor preferences.");
    } finally {
      setSavingPref(false);
    }
  };

  // Watch / Unwatch / Dismiss Handlers
  const handleWatch = async (oppId) => {
    try {
      await watchOpportunity(oppId);
      setRecommendations((prev) =>
        prev.map((item) =>
          (item.opportunity?._id || item.opportunity?.id) === oppId
            ? { ...item, observation: { ...item.observation, saved: true } }
            : item
        )
      );
    } catch (err) {
      // Ignore
    }
  };

  const handleUnwatch = async (oppId) => {
    try {
      await unwatchOpportunity(oppId);
      setRecommendations((prev) =>
        prev.map((item) =>
          (item.opportunity?._id || item.opportunity?.id) === oppId
            ? { ...item, observation: { ...item.observation, saved: false } }
            : item
        )
      );
    } catch (err) {
      // Ignore
    }
  };

  const handleDismiss = async (oppId) => {
    try {
      await dismissOpportunity(oppId);
      setRecommendations((prev) =>
        prev.filter((item) => (item.opportunity?._id || item.opportunity?.id) !== oppId)
      );
    } catch (err) {
      // Ignore
    }
  };

  return (
    <div className="resume-page-container">
      {/* 1. Header Shell Renders Immediately */}
      <MonitorHeader
        monitor={monitor || {}}
        onToggleMonitor={handleToggleMonitor}
        onRunMonitor={handleRunMonitor}
        running={running}
      />

      {errorNotice && (
        <div className="inline-error-state" style={{ margin: "16px 0" }}>
          <AlertCircle size={20} />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* 2. Main Layout Shell Renders Immediately */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Monitor Status Banner */}
        <MonitorStatus monitor={monitor || {}} digest={digest || {}} />

        {/* Daily Digest */}
        <OpportunityDigest digest={digest || {}} />

        {/* 2-Column Layout Shell */}
        <div className="details-2col-layout">
          {/* Main Column */}
          <div className="details-main-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {loading && recommendations.length === 0 ? (
              <div className="skeleton-details-body" style={{ minHeight: "280px" }} />
            ) : recommendations.length === 0 ? (
              <MonitorEmptyState onRun={handleRunMonitor} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="section-header-flex">
                  <div>
                    <span className="eyebrow">RANKED MATCHES</span>
                    <h3>Top Matched Opportunities ({recommendations.length})</h3>
                  </div>
                </div>

                <OpportunityRecommendationGrid
                  recommendations={recommendations}
                  onWatch={handleWatch}
                  onUnwatch={handleUnwatch}
                  onDismiss={handleDismiss}
                />
              </div>
            )}
          </div>

          {/* Side Column */}
          <div className="details-side-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Watchlist items={recommendations} onUnwatch={handleUnwatch} />

            <MonitorPreferences
              monitor={monitor || {}}
              onSave={handleSavePreferences}
              saving={savingPref}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityMonitor;
