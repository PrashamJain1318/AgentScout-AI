import React from 'react';
import { Target, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';

const NextBestAction = ({ decision, onRunAgent, running }) => {
  if (!decision) return null;

  const { title, description, recommendation, priority, riskLevel } = decision;

  const isHighImpact = riskLevel === 'HIGH_IMPACT';
  const isExternal = riskLevel === 'EXTERNAL_ACTION';

  return (
    <div
      className="card shadow-sm border-0 p-4 mb-4"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.02) 100%)',
        borderLeft: '4px solid #6366f1'
      }}
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="d-flex align-items-start gap-3">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}
          >
            <Target size={22} />
          </div>

          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-primary font-bold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                NEXT BEST ACTION
              </span>
              <span className={`badge ${priority === 'HIGH' ? 'bg-danger' : 'bg-secondary'} px-2 py-1`} style={{ fontSize: '10px' }}>
                {priority} PRIORITY
              </span>
              {isExternal && (
                <span className="badge bg-warning text-dark px-2 py-1 d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                  <ShieldAlert size={10} /> Approval Required
                </span>
              )}
            </div>

            <h4 className="m-0 font-extrabold mt-1" style={{ fontSize: '17px' }}>{title}</h4>
            <p className="text-muted m-0 mt-1" style={{ fontSize: '13px' }}>{description}</p>
            {recommendation && (
              <div className="mt-2 p-2 rounded" style={{ background: 'rgba(99, 102, 241, 0.08)', fontSize: '12px', color: '#4f46e5' }}>
                💡 <strong>AI Recommendation:</strong> {recommendation}
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
            onClick={onRunAgent}
            disabled={running}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600
            }}
          >
            <span>{running ? 'Processing...' : 'Run Agent Action'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextBestAction;
