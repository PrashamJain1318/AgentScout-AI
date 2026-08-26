import React from 'react';
import { ShieldCheck, ShieldAlert, Globe, Info, X, Check } from 'lucide-react';

const ActionPreview = ({ preview, onApprove, onReject, onClose }) => {
  if (!preview) return null;

  const isExternal = preview.riskLevel === 'EXTERNAL_ACTION' || preview.category === 'EXTERNAL_ACTION';

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'grid', placeItems: 'center', zIndex: 300, padding: '16px' }}>
      <div className="modal-card" style={{ width: '100%', maxWidth: '540px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isExternal ? <ShieldAlert size={20} className="text-primary" /> : <ShieldCheck size={20} className="text-success" />}
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>ACTION PREVIEW</h3>
          </div>

          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700 }}>{preview.title}</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{preview.description}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Info size={16} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Why recommended:</strong>
              <p style={{ margin: '2px 0 0', color: 'var(--text-muted)' }}>{preview.reasoning}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Globe size={16} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Destination Host:</strong>
              <p style={{ margin: '2px 0 0', color: 'var(--text-muted)' }}>{preview.destinationHost || 'Internal Execution'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <ShieldCheck size={16} className="text-success" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Expected Impact:</strong>
              <p style={{ margin: '2px 0 0', color: 'var(--text-muted)' }}>{preview.expectedImpact}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="action-btn secondary-btn" onClick={onReject}>
            <X size={14} />
            <span>Reject</span>
          </button>

          <button type="button" className="save-profile-btn" onClick={onApprove}>
            <Check size={14} />
            <span>Approve Action</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPreview;
