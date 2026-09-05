import React from 'react';
import { Brain, Trash2, Tag } from 'lucide-react';

const ApplicationAgentMemory = ({ memories = [], onDeleteMemory }) => {
  if (!memories || memories.length === 0) {
    return (
      <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
        <h4 className="font-bold mb-2" style={{ fontSize: '15px' }}>Learned Candidate Preferences</h4>
        <p className="text-muted m-0" style={{ fontSize: '13px' }}>
          No memories learned yet. As you interact with Application Agent, your application preferences and patterns will be stored here.
        </p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <Brain size={20} className="text-primary" />
          <h4 className="m-0 font-bold" style={{ fontSize: '16px' }}>Learned Candidate Preferences</h4>
        </div>
        <span className="badge bg-soft-primary text-primary px-2 py-1" style={{ fontSize: '11px' }}>
          {memories.length} Memories Stored
        </span>
      </div>

      <div className="row g-2">
        {memories.map((mem) => (
          <div key={mem._id || mem.id} className="col-12 col-md-6">
            <div className="p-3 border rounded d-flex align-items-start justify-content-between gap-2" style={{ background: 'var(--subcard-bg, rgba(249, 250, 251, 0.6))' }}>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-secondary" style={{ fontSize: '10px' }}>{mem.category}</span>
                  <span className="font-semibold text-dark" style={{ fontSize: '12px' }}>{mem.key}</span>
                </div>
                <p className="m-0 text-muted" style={{ fontSize: '12px' }}>
                  {typeof mem.value === 'object' ? JSON.stringify(mem.value) : String(mem.value)}
                </p>
                <span className="text-muted d-block mt-1" style={{ fontSize: '10px' }}>
                  Confidence: {Math.round((mem.confidence || 0.8) * 100)}%
                </span>
              </div>

              <button
                type="button"
                className="btn btn-link text-danger p-0 border-0"
                onClick={() => onDeleteMemory(mem._id || mem.id)}
                title="Forget Memory"
                style={{ fontSize: '12px' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationAgentMemory;
