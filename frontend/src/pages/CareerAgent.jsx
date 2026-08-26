import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Play,
  Pause,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Brain,
  FileText,
  BookmarkCheck,
  UserCheck,
  ArrowRight,
  Loader2,
  Trash2,
  History,
  Lock,
  Radio,
  Check,
  Layers,
  Plus
} from 'lucide-react';
import { getCachedData, setCachedData } from '../services/api';

import {
  getAgentState,
  getAgentContext,
  getNextAction,
  runAgent,
  getAgentActivity,
  getAgentMemory,
  deleteAgentMemory,
  approveAction,
  rejectAction,
  executeAction,
  enableAgent,
  disableAgent,
  getAgentStatistics,
  getAutomationStatus,
  updateMode,
  evaluateAgent,
  getNotifications,
  getExecutions,
  // Phase 17.2 APIs
  createWorkflow,
  getWorkflows,
  startWorkflow,
  pauseWorkflow,
  cancelWorkflow,
  approveWorkflow,
  rejectWorkflow,
  getApprovalCenter,
  getActionPreview,
  editActionPackageContent,
  approveActionPackage,
  getOutcomes
} from '../services/careerAgent.api';

import WorkflowCard from '../components/career-agent/WorkflowCard';
import WorkflowSteps from '../components/career-agent/WorkflowSteps';
import ActionPackage from '../components/career-agent/ActionPackage';
import ApprovalCenter from '../components/career-agent/ApprovalCenter';
import ActionPreview from '../components/career-agent/ActionPreview';
import WorkflowOutcome from '../components/career-agent/WorkflowOutcome';

const CACHE_KEY = "career-agent-data-v17_2";

const CareerAgent = () => {
  const navigate = useNavigate();
  const cached = getCachedData(CACHE_KEY);

  const [agentState, setAgentState] = useState(cached?.data?.agentState || null);
  const [context, setContext] = useState(cached?.data?.context || null);
  const [nextAction, setNextAction] = useState(cached?.data?.nextAction || null);
  const [activities, setActivities] = useState(cached?.data?.activities || []);
  const [memories, setMemories] = useState(cached?.data?.memories || []);
  const [stats, setStats] = useState(cached?.data?.stats || {});

  // Phase 17.2 State
  const [workflows, setWorkflows] = useState(cached?.data?.workflows || []);
  const [approvalData, setApprovalData] = useState(cached?.data?.approvalData || null);
  const [outcomes, setOutcomes] = useState(cached?.data?.outcomes || []);
  const [activePackage, setActivePackage] = useState(cached?.data?.activePackage || null);
  const [actionPreview, setActionPreview] = useState(null);

  const [loading, setLoading] = useState(!cached?.data);
  const [running, setRunning] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [creatingWf, setCreatingWf] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchAgentDashboardData = async () => {
    if (!cached?.data) setLoading(true);
    setErrorNotice(null);

    try {
      const results = await Promise.allSettled([
        getAgentState(),
        getAgentContext(),
        getAgentActivity(),
        getAgentMemory(),
        getAgentStatistics(),
        getAutomationStatus(),
        getWorkflows(),
        getApprovalCenter(),
        getOutcomes(),
        getNextAction()
      ]);

      const stateRes = results[0].status === "fulfilled" ? results[0].value?.data : agentState;
      const ctxRes = results[1].status === "fulfilled" ? results[1].value?.data : context;
      const actRes = results[2].status === "fulfilled" ? results[2].value?.data : activities;
      const memRes = results[3].status === "fulfilled" ? results[3].value?.data : memories;
      const statRes = results[4].status === "fulfilled" ? results[4].value?.data : stats;
      const wfRes = results[6].status === "fulfilled" ? results[6].value?.data : workflows;
      const appRes = results[7].status === "fulfilled" ? results[7].value?.data : approvalData;
      const outRes = results[8].status === "fulfilled" ? results[8].value?.data : outcomes;
      const nextRes = results[9].status === "fulfilled" ? results[9].value?.data : nextAction;

      if (stateRes) setAgentState(stateRes);
      if (ctxRes) setContext(ctxRes);
      if (actRes) setActivities(actRes || []);
      if (memRes) setMemories(memRes || []);
      if (statRes) setStats(statRes || {});
      if (wfRes) {
        setWorkflows(wfRes || []);
        if (wfRes.length > 0 && wfRes[0].actionPackage) {
          setActivePackage(wfRes[0].actionPackage);
        }
      }
      if (appRes) setApprovalData(appRes || null);
      if (outRes) setOutcomes(outRes || []);
      if (nextRes) setNextAction(nextRes);

      setCachedData(CACHE_KEY, {
        agentState: stateRes,
        context: ctxRes,
        activities: actRes,
        memories: memRes,
        stats: statRes,
        workflows: wfRes,
        approvalData: appRes,
        outcomes: outRes,
        nextAction: nextRes
      });
    } catch (err) {
      console.error('Error fetching Career Agent dashboard data:', err);
      setErrorNotice('Failed to load Career Agent data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDashboardData();
  }, []);

  const handleRunAgent = async () => {
    setRunning(true);
    setErrorNotice(null);
    try {
      const res = await runAgent();
      if (res?.data) {
        setAgentState(res.data.agent);
        setNextAction(res.data.nextAction);
        fetchAgentDashboardData();
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.message || err.message || 'Unable to execute agent run.');
    } finally {
      setRunning(false);
    }
  };

  const handleCreateWorkflow = async (type = 'PREPARE_APPLICATION') => {
    setCreatingWf(true);
    try {
      const res = await createWorkflow({ type });
      if (res?.data) {
        fetchAgentDashboardData();
      }
    } catch (err) {
      setErrorNotice('Failed to generate workflow.');
    } finally {
      setCreatingWf(false);
    }
  };

  const handleStartWorkflow = async (wfId) => {
    try {
      await startWorkflow(wfId);
      fetchAgentDashboardData();
    } catch (err) {
      setErrorNotice('Failed to start workflow.');
    }
  };

  const handlePauseWorkflow = async (wfId) => {
    try {
      await pauseWorkflow(wfId);
      fetchAgentDashboardData();
    } catch (err) {
      setErrorNotice('Failed to pause workflow.');
    }
  };

  const handleCancelWorkflow = async (wfId) => {
    try {
      await cancelWorkflow(wfId);
      fetchAgentDashboardData();
    } catch (err) {
      setErrorNotice('Failed to cancel workflow.');
    }
  };

  const handleApproveWorkflow = async (wfId) => {
    try {
      await approveWorkflow(wfId);
      fetchAgentDashboardData();
    } catch (err) {
      setErrorNotice('Failed to approve workflow.');
    }
  };

  const handlePreviewAction = async (actionId) => {
    try {
      const res = await getActionPreview(actionId);
      if (res?.data) {
        setActionPreview(res.data);
      }
    } catch (err) {
      setErrorNotice('Failed to fetch action preview.');
    }
  };

  const handleApproveAction = async (actionId) => {
    setActionLoading(actionId);
    try {
      const res = await approveAction(actionId);
      if (res?.data) {
        await executeAction(actionId);
        setActionPreview(null);
        fetchAgentDashboardData();
      }
    } catch (err) {
      setErrorNotice('Failed to approve action.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAction = async (actionId) => {
    setActionLoading(actionId);
    try {
      await rejectAction(actionId);
      setActionPreview(null);
      fetchAgentDashboardData();
    } catch (err) {
      setErrorNotice('Failed to reject action.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSavePackageContent = async (pkgId, field, content) => {
    try {
      const res = await editActionPackageContent(pkgId, field, content);
      if (res?.data) {
        setActivePackage(res.data);
      }
    } catch (err) {
      setErrorNotice('Failed to update package content draft.');
    }
  };

  const handleApprovePackage = async (pkgId) => {
    try {
      const res = await approveActionPackage(pkgId);
      if (res?.data) {
        setActivePackage(res.data);
        fetchAgentDashboardData();
      }
    } catch (err) {
      setErrorNotice('Failed to approve action package.');
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    try {
      await deleteAgentMemory(memoryId);
      setMemories(prev => prev.filter(m => m._id !== memoryId));
    } catch (err) {
      setErrorNotice('Failed to delete memory item.');
    }
  };

  const readiness = agentState?.readiness || { overall: 75, profile: 80, resume: 75, application: 70, interview: 65, skills: 70 };
  const currentMode = agentState?.mode || 'AUTONOMOUS';

  return (
    <div className="resume-page-container">
      {/* 1. AGENT HEADER */}
      <div className="application-assistant-header flex-between" style={{ background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)', padding: '24px', borderRadius: '16px', border: '1px solid #27272a', color: '#ffffff' }}>
        <div>
          <div className="header-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Bot size={14} />
            <span>AI CAREER AGENT INTELLIGENCE • PHASE 17.2</span>
          </div>
          <h2 style={{ fontSize: '26px', margin: '8px 0 4px 0', color: '#ffffff' }}>AI Career Agent Command Center</h2>
          <p className="subtitle-text" style={{ color: '#a1a1aa', margin: 0 }}>
            Workflow orchestration, Action Packages, Human Approval Center, and real-world career execution.
          </p>
        </div>

        <div className="flex-between" style={{ gap: '12px' }}>
          <button
            type="button"
            className="save-profile-btn"
            onClick={handleRunAgent}
            disabled={running}
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            {running ? <Loader2 className="spin" size={16} /> : <Zap size={16} />}
            <span>{running ? 'Reasoning...' : 'Run Agent Cycle'}</span>
          </button>
        </div>
      </div>

      {errorNotice && (
        <div className="inline-error-state" style={{ margin: '16px 0', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>{errorNotice}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        
        {/* APPROVAL CENTER (HUMAN IN THE LOOP) */}
        <ApprovalCenter
          data={approvalData}
          onPreviewAction={handlePreviewAction}
          onApproveAction={handleApproveAction}
          onRejectAction={handleRejectAction}
        />

        {/* ACTIVE WORKFLOWS SECTION */}
        <div className="resume-section-card" style={{ background: 'var(--card-bg, #18181b)', border: '1px solid var(--border-color, #27272a)', borderRadius: '14px', padding: '20px' }}>
          <div className="section-header-flex" style={{ marginBottom: '16px' }}>
            <div>
              <span className="eyebrow" style={{ color: '#818cf8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>WORKFLOW ORCHESTRATION</span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '18px' }}>Active Career Workflows ({workflows.length})</h3>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="action-btn secondary-btn"
                disabled={creatingWf}
                onClick={() => handleCreateWorkflow('PREPARE_APPLICATION')}
              >
                <Plus size={14} />
                <span>New Application Workflow</span>
              </button>

              <button
                type="button"
                className="action-btn secondary-btn"
                disabled={creatingWf}
                onClick={() => handleCreateWorkflow('PREPARE_INTERVIEW')}
              >
                <Plus size={14} />
                <span>New Interview Workflow</span>
              </button>
            </div>
          </div>

          {workflows.length === 0 ? (
            <p className="subtitle-text">No active workflows. Click above to launch an automated career preparation workflow.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {workflows.map((wf) => (
                <div key={wf._id || wf.workflowId}>
                  <WorkflowCard
                    workflow={wf}
                    onStart={handleStartWorkflow}
                    onPause={handlePauseWorkflow}
                    onCancel={handleCancelWorkflow}
                    onApprove={handleApproveWorkflow}
                    onViewPackage={(w) => setActivePackage(w.actionPackage)}
                  />
                  <div style={{ marginTop: '12px' }}>
                    <WorkflowSteps steps={wf.steps} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTION PACKAGE WORKSPACE */}
        {activePackage && (
          <ActionPackage
            pkg={activePackage}
            onSaveContent={handleSavePackageContent}
            onApprovePackage={handleApprovePackage}
          />
        )}

        {/* RECENT OUTCOMES & AGENT MEMORY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* OUTCOMES */}
          <div className="resume-section-card" style={{ background: 'var(--card-bg, #18181b)', border: '1px solid var(--border-color, #27272a)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '16px' }}>Recent Workflow Outcomes ({outcomes.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto' }}>
              {outcomes.length === 0 ? (
                <p className="subtitle-text">No outcomes recorded yet.</p>
              ) : (
                outcomes.map(out => (
                  <WorkflowOutcome key={out._id || out.outcomeId} outcome={out} />
                ))
              )}
            </div>
          </div>

          {/* AGENT MEMORY */}
          <div className="resume-section-card" style={{ background: 'var(--card-bg, #18181b)', border: '1px solid var(--border-color, #27272a)', borderRadius: '14px', padding: '20px' }}>
            <div className="section-header-flex" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={18} className="text-primary" />
                <h4 style={{ margin: 0, fontSize: '16px' }}>Learned Preferences & Memory ({memories.length})</h4>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
              {memories.length === 0 ? (
                <p className="subtitle-text">No long-term preferences stored yet.</p>
              ) : (
                memories.map((mem) => (
                  <div key={mem._id} className="flex-between" style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>{mem.category || 'PREFERENCE'}</span>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#e4e4e7', marginTop: '2px' }}>{mem.key}: {String(mem.value)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMemory(mem._id)}
                      style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ACTION PREVIEW MODAL */}
      {actionPreview && (
        <ActionPreview
          preview={actionPreview}
          onApprove={() => handleApproveAction(actionPreview.actionId)}
          onReject={() => handleRejectAction(actionPreview.actionId)}
          onClose={() => setActionPreview(null)}
        />
      )}
    </div>
  );
};

export default CareerAgent;
