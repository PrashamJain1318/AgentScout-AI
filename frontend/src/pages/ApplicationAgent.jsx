import React, { useState, useEffect, useCallback } from 'react';
import {
  getApplicationAgentState,
  analyzeOpportunity,
  runApplicationAgent,
  enableApplicationAgent,
  disableApplicationAgent,
  getApplicationAgentTasks,
  getApplicationAgentMemory,
  deleteApplicationAgentMemory
} from '../services/applicationAgent.api';

import ApplicationAgentHeader from '../components/application-agent/ApplicationAgentHeader';
import ApplicationAgentStatus from '../components/application-agent/ApplicationAgentStatus';
import ApplicationReadiness from '../components/application-agent/ApplicationReadiness';
import TargetOpportunity from '../components/application-agent/TargetOpportunity';
import NextBestAction from '../components/application-agent/NextBestAction';
import ApplicationTaskTimeline from '../components/application-agent/ApplicationTaskTimeline';
import ApplicationAgentMemory from '../components/application-agent/ApplicationAgentMemory';
import ApplicationAgentActivity from '../components/application-agent/ApplicationAgentActivity';
import ApplicationAgentSkeleton from '../components/application-agent/ApplicationAgentSkeleton';

const ApplicationAgent = () => {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const [agent, setAgent] = useState(null);
  const [context, setContext] = useState(null);
  const [decision, setDecision] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memories, setMemories] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [stateData, taskData, memoryData] = await Promise.all([
        getApplicationAgentState(),
        getApplicationAgentTasks(),
        getApplicationAgentMemory()
      ]);

      setAgent(stateData.agent);
      setContext(stateData.context);
      setDecision(stateData.decision);
      setTasks(taskData || []);
      setMemories(memoryData || []);
    } catch (err) {
      console.error('Failed to load Application Agent state:', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect to Application Agent');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnableMode = async (mode) => {
    try {
      const updatedAgent = await enableApplicationAgent(mode);
      setAgent(updatedAgent);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update agent mode');
    }
  };

  const handleDisableAgent = async () => {
    try {
      const updatedAgent = await disableApplicationAgent();
      setAgent(updatedAgent);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to pause agent');
    }
  };

  const handleAnalyze = async (opportunityId) => {
    try {
      setRunning(true);
      const result = await analyzeOpportunity(opportunityId);
      setAgent(result.agent);
      setContext(result.context);
      setDecision(result.decision);
      const updatedTasks = await getApplicationAgentTasks();
      setTasks(updatedTasks || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to analyze opportunity');
    } finally {
      setRunning(false);
    }
  };

  const handleRunAgent = async () => {
    try {
      setRunning(true);
      const result = await runApplicationAgent(context?.opportunity?.id || null);
      setAgent(result.agent);
      setContext(result.context);
      setDecision(result.decision);
      const [updatedTasks, updatedMemories] = await Promise.all([
        getApplicationAgentTasks(),
        getApplicationAgentMemory()
      ]);
      setTasks(updatedTasks || []);
      setMemories(updatedMemories || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to execute Application Agent action');
    } finally {
      setRunning(false);
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    try {
      await deleteApplicationAgentMemory(memoryId);
      setMemories(prev => prev.filter(m => String(m._id || m.id) !== String(memoryId)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete memory');
    }
  };

  if (loading) {
    return <ApplicationAgentSkeleton />;
  }

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {error && (
        <div className="alert alert-danger shadow-sm border-0 mb-4" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Header */}
      <ApplicationAgentHeader
        agent={agent}
        onEnableMode={handleEnableMode}
        onDisableAgent={handleDisableAgent}
        onRunAgent={handleRunAgent}
        running={running}
      />

      {/* Stats Summary */}
      <ApplicationAgentStatus stats={agent?.statistics} />

      {/* Next Best Action Banner */}
      <NextBestAction
        decision={decision}
        onRunAgent={handleRunAgent}
        running={running}
      />

      <div className="row g-4">
        {/* Left Column: Target Role & Readiness Breakdown */}
        <div className="col-12 col-lg-7">
          <TargetOpportunity
            opportunity={context?.opportunity}
            matchScore={context?.match?.score}
            onAnalyze={handleAnalyze}
          />

          <ApplicationReadiness
            readinessMetrics={context?.readinessMetrics}
          />

          <ApplicationTaskTimeline
            tasks={tasks}
          />
        </div>

        {/* Right Column: Learned Memory & Activity Log */}
        <div className="col-12 col-lg-5">
          <ApplicationAgentMemory
            memories={memories}
            onDeleteMemory={handleDeleteMemory}
          />

          <ApplicationAgentActivity
            activities={context?.recentActivity}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationAgent;
