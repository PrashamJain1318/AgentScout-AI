import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Play,
  Pause,
  RefreshCw,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Brain,
  FileText,
  BookmarkCheck,
  UserCheck,
  FolderGit2,
  ArrowRight,
  Loader2,
  Trash2,
  Activity,
  History,
  Lock,
  Radio,
  Bell,
  Sliders,
  Check
} from 'lucide-react';
import {
  getAgentState,
  getAgentContext,
  getNextAction,
  runAgent,
  refreshAgent,
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
  getExecutions
} from '../services/careerAgent.api';

const CareerAgent = () => {
  const navigate = useNavigate();

  const [agentState, setAgentState] = useState(null);
  const [context, setContext] = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [activities, setActivities] = useState([]);
  const [memories, setMemories] = useState([]);
  const [stats, setStats] = useState({});
  const [automationStatus, setAutomationStatus] = useState({});
  const [agentNotifications, setAgentNotifications] = useState([]);
  const [executions, setExecutions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchAgentDashboardData = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const [stateRes, ctxRes, actRes, memRes, statRes, autoRes, notifRes, execRes] = await Promise.all([
        getAgentState(),
        getAgentContext(),
        getAgentActivity(),
        getAgentMemory(),
        getAgentStatistics(),
        getAutomationStatus(),
        getNotifications(),
        getExecutions()
      ]);

      if (stateRes?.data) setAgentState(stateRes.data);
      if (ctxRes?.data) setContext(ctxRes.data);
      if (actRes?.data) setActivities(actRes.data || []);
      if (memRes?.data) setMemories(memRes.data || []);
      if (statRes?.data) setStats(statRes.data || {});
      if (autoRes?.data) setAutomationStatus(autoRes.data || {});
      if (notifRes?.data) setAgentNotifications(notifRes.data || []);
      if (execRes?.data) setExecutions(execRes.data || []);

      // Fetch Next Best Action
      const nextRes = await getNextAction();
      if (nextRes?.data) setNextAction(nextRes.data);
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
      console.error('Error running agent:', err);
      setErrorNotice(err.response?.data?.message || err.message || 'Unable to execute agent run.');
    } finally {
      setRunning(false);
    }
  };

  const handleEvaluateTriggers = async () => {
    setEvaluating(true);
    try {
      await evaluateAgent('SCHEDULED_REVIEW');
      fetchAgentDashboardData();
    } catch (err) {
      setErrorNotice('Failed to evaluate triggers.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleModeChange = async (newMode) => {
    try {
      const res = await updateMode(newMode);
      if (res?.data) {
        setAgentState(res.data);
      }
    } catch (err) {
      setErrorNotice('Failed to update automation mode.');
    }
  };

  const handleToggleAgent = async () => {
    if (!agentState) return;
    try {
      if (agentState.enabled) {
        const res = await disableAgent();
        if (res?.data) setAgentState(res.data);
      } else {
        const res = await enableAgent();
        if (res?.data) setAgentState(res.data);
      }
    } catch (err) {
      setErrorNotice('Failed to toggle agent state.');
    }
  };

  const handleApproveAction = async (actionId) => {
    setActionLoading(actionId);
    try {
      const res = await approveAction(actionId);
      if (res?.data) {
        await executeAction(actionId);
        fetchAgentDashboardData();
      }
    } catch (err) {
      setErrorNotice('Failed to approve and execute action.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAction = async (actionId) => {
    setActionLoading(actionId);
    try {
      await rejectAction(actionId);
      fetchAgentDashboardData();
    } catch (err) {
      setErrorNotice('Failed to reject action.');
    } finally {
      setActionLoading(null);
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

  const readiness = agentState?.readiness || context?.analytics?.careerScore
    ? {
        overall: agentState?.readiness?.overall || context?.analytics?.careerScore || 0,
        profile: agentState?.readiness?.profile || context?.profile?.completion || 0,
        resume: agentState?.readiness?.resume || context?.resume?.atsScore || 0,
        application: agentState?.readiness?.application || context?.applicationReadiness || 0,
        interview: agentState?.readiness?.interview || context?.interviewReadiness || 0,
        skills: agentState?.readiness?.skills || context?.skills?.coverageScore || 0
      }
    : { overall: 75, profile: 80, resume: 75, application: 70, interview: 65, skills: 70 };

  const currentActionObj = nextAction || agentState?.agentState || {
    title: 'Optimize Resume ATS Score',
    reason: 'Resume ATS score requires optimization before submitting applications',
    confidence: 0.85,
    impact: 'high',
    urgency: 'high',
    deepLink: '/dashboard/resume'
  };

  const pendingAction = activities.find(a => a.eventType === 'ACTION_REQUESTED' && a.metadata?.actionRecordId);
  const currentMode = agentState?.mode || 'AUTONOMOUS';

  return (
    <div className="resume-page-container">
      
      {/* 1. AGENT HEADER */}
      <div className="application-assistant-header flex-between" style={{ background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)', padding: '24px', borderRadius: '16px', border: '1px solid #27272a', color: '#ffffff' }}>
        <div>
          <div className="header-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Bot size={14} />
            <span>AI CAREER AGENT AUTOMATION • PHASE 17.1</span>
          </div>
          <h2 style={{ fontSize: '26px', margin: '8px 0 4px 0', color: '#ffffff' }}>AI Career Agent Command Center</h2>
          <p className="subtitle-text" style={{ color: '#a1a1aa', margin: 0 }}>
            Proactive event-driven career agent executing safe actions, routing approvals, and optimizing hiring velocity.
          </p>
        </div>

        <div className="flex-between" style={{ gap: '12px' }}>
          <div style={{ textAlign: 'right', marginRight: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 600, display: 'block' }}>Automation Mode</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <Zap size={13} /> {currentMode}
            </span>
          </div>

          <button
            type="button"
            className="save-profile-btn"
            onClick={handleRunAgent}
            disabled={running || !agentState?.enabled}
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            {running ? <Loader2 className="spin" size={16} /> : <Zap size={16} />}
            <span>{running ? 'Reasoning...' : 'Run Agent'}</span>
          </button>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={handleEvaluateTriggers}
            disabled={evaluating}
            style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {evaluating ? <Loader2 className="spin" size={15} /> : <Radio size={15} />}
            <span>Evaluate Triggers</span>
          </button>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={handleToggleAgent}
            style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {agentState?.enabled ? <Pause size={15} /> : <Play size={15} />}
            <span>{agentState?.enabled ? 'Pause' : 'Enable'}</span>
          </button>
        </div>
      </div>

      {errorNotice && (
        <div className="inline-error-state" style={{ margin: '16px 0', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>{errorNotice}</span>
        </div>
      )}

      {loading ? (
        <div className="skeleton-details-body" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          <div className="skeleton-card" style={{ height: '140px', background: 'var(--card-bg, #18181b)', borderRadius: '12px' }} />
          <div className="skeleton-card" style={{ height: '180px', background: 'var(--card-bg, #18181b)', borderRadius: '12px' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          
          {/* 2. AUTOMATION MODE SWITCHER & STATS */}
          <div className="resume-section-card" style={{ background: 'var(--card-bg, #18181b)', border: '1px solid var(--border-color, #27272a)', borderRadius: '14px', padding: '20px' }}>
            <div className="section-header-flex" style={{ marginBottom: '16px' }}>
              <div>
                <span className="eyebrow" style={{ color: '#818cf8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>AUTONOMOUS EXECUTION CONTROL</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px' }}>Automation Mode & Performance</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Mode Selection Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase' }}>Select Automation Mode</span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['MANUAL', 'ASSISTED', 'AUTONOMOUS'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleModeChange(m)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: currentMode === m ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                        background: currentMode === m ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: currentMode === m ? '#818cf8' : '#a1a1aa',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {currentMode === m && <Check size={14} />}
                      {m}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
                  {currentMode === 'MANUAL' && 'Manual Mode: Agent only acts when explicitly commanded.'}
                  {currentMode === 'ASSISTED' && 'Assisted Mode: Agent creates recommendations and waits for candidate approval.'}
                  {currentMode === 'AUTONOMOUS' && 'Autonomous Mode: Agent automatically executes SAFE internal actions. High impact & external actions require approval.'}
                </p>
              </div>

              {/* Automation Performance Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#a1a1aa', display: 'block' }}>Actions Automated</span>
                  <strong style={{ fontSize: '22px', color: '#10b981', display: 'block', marginTop: '2px' }}>{stats.actionsAutomated || 0}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#a1a1aa', display: 'block' }}>Notifications Sent</span>
                  <strong style={{ fontSize: '22px', color: '#818cf8', display: 'block', marginTop: '2px' }}>{stats.notificationsSent || 0}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#a1a1aa', display: 'block' }}>Spam Prevented</span>
                  <strong style={{ fontSize: '22px', color: '#f59e0b', display: 'block', marginTop: '2px' }}>{stats.duplicatesPrevented || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CAREER READINESS METRICS GRID */}
          <div className="resume-section-card" style={{ background: 'var(--card-bg, #18181b)', border: '1px solid var(--border-color, #27272a)', borderRadius: '14px', padding: '20px' }}>
            <div className="section-header-flex" style={{ marginBottom: '16px' }}>
              <div>
                <span className="eyebrow" style={{ color: '#818cf8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>COMPOSITE INTELLIGENCE</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px' }}>Career Readiness Snapshot</h3>
              </div>
              <span className="impact-badge excellent" style={{ fontSize: '12px', padding: '4px 10px' }}>
                <ShieldCheck size={13} /> {readiness.overall}% OVERALL SCORE
              </span>
            </div>

            <div className="pipeline-conversion-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div className="summary-metric-item" onClick={() => navigate('/dashboard/profile')} style={{ cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <span className="metric-label" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={13} className="text-primary" /> Profile
                </span>
                <strong className="metric-val" style={{ fontSize: '20px', marginTop: '4px', display: 'block' }}>{readiness.profile}%</strong>
              </div>

              <div className="summary-metric-item" onClick={() => navigate('/dashboard/resume')} style={{ cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <span className="metric-label" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={13} className="text-primary" /> Resume ATS
                </span>
                <strong className="metric-val" style={{ fontSize: '20px', marginTop: '4px', display: 'block' }}>{readiness.resume}%</strong>
              </div>

              <div className="summary-metric-item" onClick={() => navigate('/dashboard/applications')} style={{ cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <span className="metric-label" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookmarkCheck size={13} className="text-primary" /> Applications
                </span>
                <strong className="metric-val" style={{ fontSize: '20px', marginTop: '4px', display: 'block' }}>{readiness.application}%</strong>
              </div>

              <div className="summary-metric-item" onClick={() => navigate('/dashboard/interview-coach')} style={{ cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <span className="metric-label" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Brain size={13} className="text-primary" /> Interview
                </span>
                <strong className="metric-val" style={{ fontSize: '20px', marginTop: '4px', display: 'block' }}>{readiness.interview}%</strong>
              </div>

              <div className="summary-metric-item" onClick={() => navigate('/dashboard/career-copilot')} style={{ cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <span className="metric-label" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={13} className="text-primary" /> Skills
                </span>
                <strong className="metric-val" style={{ fontSize: '20px', marginTop: '4px', display: 'block' }}>{readiness.skills}%</strong>
              </div>
            </div>
          </div>

          {/* 4. NEXT BEST ACTION (PRIMARY REASONING CARD) */}
          <div className="resume-section-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.03) 100%)', border: '2px solid #6366f1', borderRadius: '14px', padding: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#6366f1', color: '#ffffff', padding: '3px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
              🎯 SINGLE HIGHEST-IMPACT ACTION
            </div>

            <div className="section-header-flex">
              <div>
                <span className="eyebrow" style={{ color: '#818cf8', fontSize: '11px', fontWeight: 700 }}>REASONING ENGINE DECISION</span>
                <h3 style={{ fontSize: '20px', margin: '4px 0 0 0' }}>{currentActionObj.title || 'Execute Next Priority'}</h3>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#e4e4e7', margin: '12px 0 16px 0', lineHeight: '1.6' }}>
              {currentActionObj.reason}
            </p>

            {/* Evidence Checklist */}
            {Array.isArray(currentActionObj.evidence) && currentActionObj.evidence.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Reasoning Evidence & Context</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentActionObj.evidence.map((ev, idx) => (
                    <div key={idx} style={{ fontSize: '13px', color: '#d4d4d8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} className="text-primary" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#a1a1aa' }}>
                <span>Confidence: <strong style={{ color: '#818cf8' }}>{Math.round((currentActionObj.confidence || 0.85) * 100)}%</strong></span>
                <span>Expected Impact: <strong style={{ color: '#10b981', textTransform: 'uppercase' }}>{currentActionObj.impact || 'HIGH'}</strong></span>
                <span>Urgency: <strong style={{ color: '#f59e0b', textTransform: 'uppercase' }}>{currentActionObj.urgency || 'HIGH'}</strong></span>
              </div>

              <button
                type="button"
                className="save-profile-btn"
                onClick={() => navigate(currentActionObj.deepLink || '/dashboard')}
                style={{ background: '#6366f1', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
              >
                <span>Execute Action</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 5. PENDING APPROVALS & HUMAN APPROVAL FRAMEWORK */}
          {pendingAction && (
            <div className="resume-section-card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '20px' }}>
              <div className="section-header-flex">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={18} style={{ color: '#f59e0b' }} />
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#f59e0b' }}>Human Approval Gate Required</h4>
                </div>
                <span className="impact-badge medium" style={{ fontSize: '11px' }}>RISK: {pendingAction.metadata?.nextAction?.riskLevel || 'HIGH_IMPACT'}</span>
              </div>

              <p style={{ fontSize: '13px', margin: '8px 0 14px 0', color: '#d4d4d8' }}>
                {pendingAction.summary}
              </p>

              <div className="flex-between" style={{ gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Explicit candidate authorization needed for safety and security.</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="action-btn secondary-btn"
                    onClick={() => handleRejectAction(pendingAction.metadata?.actionRecordId)}
                    disabled={Boolean(actionLoading)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <XCircle size={14} /> Reject
                  </button>

                  <button
                    type="button"
                    className="action-btn primary-btn"
                    onClick={() => handleApproveAction(pendingAction.metadata?.actionRecordId)}
                    disabled={Boolean(actionLoading)}
                    style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    {actionLoading === pendingAction.metadata?.actionRecordId ? <Loader2 className="spin" size={14} /> : <CheckCircle2 size={14} />}
                    Approve & Execute
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. 2-COLUMN LAYOUT: ACTIVITY LOG & CANDIDATE MEMORY */}
          <div className="details-2col-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* AGENT ACTIVITY & AUDIT TIMELINE */}
            <div className="resume-section-card" style={{ background: 'var(--card-bg, #18181b)', border: '1px solid var(--border-color, #27272a)', borderRadius: '14px', padding: '20px' }}>
              <div className="section-header-flex" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} className="text-primary" />
                  <h4 style={{ margin: 0, fontSize: '16px' }}>Agent Activity & Audit Log</h4>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
                {activities.length === 0 ? (
                  <p className="no-data-text" style={{ fontSize: '13px', color: '#a1a1aa' }}>No agent activities recorded yet.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act._id} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                      <div className="flex-between">
                        <strong style={{ fontSize: '13px', color: '#e4e4e7' }}>{act.summary}</strong>
                        <span style={{ fontSize: '11px', color: '#71717a' }}>
                          {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {act.reason && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a1a1aa' }}>{act.reason}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CANDIDATE AGENT MEMORY */}
            <div className="resume-section-card" style={{ background: 'var(--card-bg, #18181b)', border: '1px solid var(--border-color, #27272a)', borderRadius: '14px', padding: '20px' }}>
              <div className="section-header-flex" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={18} className="text-primary" />
                  <h4 style={{ margin: 0, fontSize: '16px' }}>Candidate Agent Memory ({memories.length})</h4>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
                {memories.length === 0 ? (
                  <p className="no-data-text" style={{ fontSize: '13px', color: '#a1a1aa' }}>No long-term memories stored yet. Agent auto-saves preferences during runs.</p>
                ) : (
                  memories.map((mem) => (
                    <div key={mem._id} className="flex-between" style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>{mem.memoryType}</span>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#e4e4e7', marginTop: '2px' }}>{mem.key}: {String(mem.value)}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMemory(mem._id)}
                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
                        title="Remove memory"
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
      )}

    </div>
  );
};

export default CareerAgent;
