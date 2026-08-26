import React from 'react';
import { Play, Pause, XCircle, CheckCircle2, ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import WorkflowProgress from './WorkflowProgress';

const WorkflowCard = ({ workflow, onStart, onPause, onCancel, onApprove, onViewPackage }) => {
  if (!workflow) return null;

  const isPendingApproval = workflow.status === 'WAITING_APPROVAL';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EXECUTING':
        return <span className="status-badge status-primary"><Play size={12} /> EXECUTING</span>;
      case 'WAITING_APPROVAL':
        return <span className="status-badge status-warning"><ShieldAlert size={12} /> APPROVAL REQUIRED</span>;
      case 'COMPLETED':
        return <span className="status-badge status-success"><CheckCircle2 size={12} /> COMPLETED</span>;
      case 'PAUSED':
        return <span className="status-badge status-secondary"><Pause size={12} /> PAUSED</span>;
      case 'CANCELLED':
      case 'FAILED':
        return <span className="status-badge status-danger"><XCircle size={12} /> {status}</span>;
      default:
        return <span className="status-badge status-info">{status}</span>;
    }
  };

  return (
    <div className={`analytics-section-card workflow-card ${isPendingApproval ? 'border-warning' : ''}`}>
      <div className="section-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h4>{workflow.title}</h4>
          {getStatusBadge(workflow.status)}
        </div>
        <span className="eyebrow" style={{ fontSize: '11px' }}>
          <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Est. {workflow.estimatedDuration || '5 mins'}
        </span>
      </div>

      <p className="subtitle-text" style={{ margin: '8px 0 14px' }}>
        {workflow.description || `Multi-step career workflow (${workflow.steps?.length || 0} steps)`}
      </p>

      <WorkflowProgress progress={workflow.progress || 0} currentStep={workflow.currentStep || 0} totalSteps={workflow.steps?.length || 15} />

      <div className="workflow-card-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {isPendingApproval && (
          <button type="button" className="save-profile-btn" onClick={() => onApprove && onApprove(workflow._id || workflow.workflowId)}>
            <CheckCircle2 size={15} />
            <span>Approve & Complete Workflow</span>
          </button>
        )}

        {workflow.status === 'EXECUTING' && (
          <button type="button" className="action-btn secondary-btn" onClick={() => onPause && onPause(workflow._id || workflow.workflowId)}>
            <Pause size={14} />
            <span>Pause</span>
          </button>
        )}

        {(workflow.status === 'PAUSED' || workflow.status === 'PLANNED') && (
          <button type="button" className="action-btn primary-btn" onClick={() => onStart && onStart(workflow._id || workflow.workflowId)}>
            <Play size={14} />
            <span>Start Workflow</span>
          </button>
        )}

        {onViewPackage && (
          <button type="button" className="section-link-btn" onClick={() => onViewPackage(workflow)}>
            <span>View Action Package</span>
            <ArrowRight size={14} />
          </button>
        )}

        {workflow.status !== 'COMPLETED' && workflow.status !== 'CANCELLED' && (
          <button type="button" className="action-btn text-btn-danger" style={{ marginLeft: 'auto' }} onClick={() => onCancel && onCancel(workflow._id || workflow.workflowId)}>
            <XCircle size={14} />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkflowCard;
