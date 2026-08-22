import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import MonitorHeader from "../components/opportunity-monitor/MonitorHeader";
import MonitorStatus from "../components/opportunity-monitor/MonitorStatus";
import OpportunityDigest from "../components/opportunity-monitor/OpportunityDigest";
import OpportunityRecommendationGrid from "../components/opportunity-monitor/OpportunityRecommendationGrid";
import Watchlist from "../components/opportunity-monitor/Watchlist";
import MonitorPreferences from "../components/opportunity-monitor/MonitorPreferences";
import { MonitorEmptyState, MonitorSkeleton } from "../components/opportunity-monitor/MonitorStates";

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

const OpportunityMonitor = () => {
  const [monitor, setMonitor] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [digest, setDigest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [savingPref, setSavingPref] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorNotice(null);

    try {
      const [monRes, recRes, digRes] = await Promise.all([
        getMonitor(),
        getRecommendations(),
        getDigest()
      ]);

      setMonitor(monRes.data || null);
      setRecommendations(recRes.data || []);
      setDigest(digRes.data || null);
    } catch (err) {
      setErrorNotice("Failed to load opportunity monitor context.");
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
      // Refresh recommendations and digest
      const [monRes, recRes, digRes] = await Promise.all([
        getMonitor(),
        getRecommendations(),
        getDigest()
      ]);

      setMonitor(monRes.data || null);
      setRecommendations(recRes.data || []);
      setDigest(digRes.data || null);
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
      {/* Header */}
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

      {loading ? (
        <MonitorSkeleton />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Monitor Status Banner */}
          <MonitorStatus monitor={monitor || {}} digest={digest || {}} />

          {/* Daily Digest */}
          <OpportunityDigest digest={digest || {}} />

          {/* 2-Column Layout */}
          <div className="details-2col-layout">
            {/* Main Column: Opportunity Recommendations Grid */}
            <div className="details-main-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {recommendations.length === 0 ? (
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

            {/* Side Column: Watchlist & Monitor Preferences */}
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
      )}
    </div>
  );
};

export default OpportunityMonitor;
