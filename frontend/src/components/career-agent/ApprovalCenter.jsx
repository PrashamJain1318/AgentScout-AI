import React from 'react';
import { ShieldCheck, ShieldAlert, Check, X, Eye } from 'lucide-react';

const ApprovalCenter = ({ data, onPreviewAction, onApproveAction, onRejectAction }) => {
  const pendingActions = data?.pendingActions || [];
  const waitingWorkflows = data?.waitingWorkflows || [];
  const pendingPackages = data?.pendingPackages || [];

  const totalPending = (data?.totalPendingCount) || (pendingActions.length + waitingWorkflows.length + pendingPackages.length);

  if (totalPending === 0) {
    return (
      <div className="analytics-section-card" style={{ textAlign: 'center', padding: '32px' }}>
        <ShieldCheck size={32} className="text-success" style={{ margin: '0 auto 8px' }} />
        <h4 style={{ margin: 0 }}>Approval Center — Clear</h4>
        <p className="subtitle-text" style={{ marginTop: '4px' }}>All pending agent actions and workflows have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="analytics-section-card approval-center-card">
      <div className="section-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} className="text-warning" />
          <div>
            <h4 style={{ margin: 0 }}>Human Approval Center ({totalPending} Pending)</h4>
            <span className="subtitle-text" style={{ fontSize: '12px' }}>
              Candidate review required for consequential actions & external workflows
            </span>
          </div>
        </div>
      </div>

      <div className="approval-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {pendingActions.map((action) => (
          <div
            key={action._id || action.actionId}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="status-badge status-warning" style={{ fontSize: '10px' }}>
                  {action.riskLevel || 'HIGH_IMPACT'}
                </span>
                <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{action.title}</strong>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{action.reason || action.description}</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                className="action-btn secondary-btn"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                onClick={() => onPreviewAction && onPreviewAction(action._id || action.actionId)}
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>

              <button
                type="button"
                className="action-btn text-btn-danger"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                onClick={() => onRejectAction && onRejectAction(action._id || action.actionId)}
              >
                <X size={13} />
                <span>Reject</span>
              </button>

              <button
                type="button"
                className="save-profile-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => onApproveAction && onApproveAction(action._id || action.actionId)}
              >
                <Check size={13} />
                <span>Approve</span>
              </button>
            </div>
          </div>
        ))}

        {waitingWorkflows.map((wf) => (
          <div
            key={wf._id || wf.workflowId}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="status-badge status-warning" style={{ fontSize: '10px' }}>WORKFLOW APPROVAL</span>
                <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{wf.title}</strong>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{wf.description}</p>
            </div>

            <button
              type="button"
              className="save-profile-btn"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => onApproveAction && onApproveAction(wf._id || wf.workflowId)}
            >
              <Check size={13} />
              <span>Approve Workflow</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalCenter;
