import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ShieldAlert } from 'lucide-react';

const ApplicationTaskTimeline = ({ tasks = [] }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
        <h4 className="font-bold mb-2" style={{ fontSize: '15px' }}>Application Task Timeline</h4>
        <p className="text-muted m-0" style={{ fontSize: '13px' }}>No workflow tasks executed yet. Click "Run Agent" to start automated application preparation.</p>
      </div>
    );
  }

  const getTaskBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge bg-success d-flex align-items-center gap-1"><CheckCircle2 size={12} /> Completed</span>;
      case 'IN_PROGRESS':
        return <span className="badge bg-primary d-flex align-items-center gap-1"><Clock size={12} /> In Progress</span>;
      case 'FAILED':
        return <span className="badge bg-danger d-flex align-items-center gap-1"><AlertCircle size={12} /> Failed</span>;
      default:
        return <span className="badge bg-secondary d-flex align-items-center gap-1"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
      <h4 className="font-bold mb-3" style={{ fontSize: '16px' }}>Application Task Timeline</h4>

      <div className="timeline-list">
        {tasks.map((t, idx) => (
          <div key={t._id || idx} className="d-flex align-items-start gap-3 p-3 border-bottom last-border-0" style={{ fontSize: '13px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: t.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                color: t.status === 'COMPLETED' ? '#10b981' : '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {t.riskLevel === 'EXTERNAL_ACTION' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
            </div>

            <div className="flex-grow-1">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <span className="font-bold text-dark">{t.title}</span>
                {getTaskBadge(t.status)}
              </div>
              {t.description && <p className="text-muted m-0 mt-1" style={{ fontSize: '12px' }}>{t.description}</p>}
              <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                Type: <code>{t.taskType}</code> • Risk: <span className="badge bg-light text-dark">{t.riskLevel}</span> • {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationTaskTimeline;
