import React from 'react';
import { ShieldCheck, Layers, FileCheck, AlertTriangle } from 'lucide-react';

const ApplicationAgentStatus = ({ stats }) => {
  const {
    applicationsAnalyzed = 0,
    applicationsPrepared = 0,
    applicationsCompleted = 0,
    duplicatesPrevented = 0
  } = stats || {};

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 p-3 text-center" style={{ borderRadius: '12px', background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex align-items-center justify-content-center text-primary mb-2">
            <Layers size={22} />
          </div>
          <span className="text-muted font-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Analyzed</span>
          <h3 className="m-0 font-extrabold mt-1">{applicationsAnalyzed}</h3>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 p-3 text-center" style={{ borderRadius: '12px', background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex align-items-center justify-content-center text-info mb-2">
            <FileCheck size={22} />
          </div>
          <span className="text-muted font-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Prepared</span>
          <h3 className="m-0 font-extrabold mt-1">{applicationsPrepared}</h3>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 p-3 text-center" style={{ borderRadius: '12px', background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex align-items-center justify-content-center text-success mb-2">
            <ShieldCheck size={22} />
          </div>
          <span className="text-muted font-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Completed</span>
          <h3 className="m-0 font-extrabold mt-1">{applicationsCompleted}</h3>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 p-3 text-center" style={{ borderRadius: '12px', background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex align-items-center justify-content-center text-warning mb-2">
            <AlertTriangle size={22} />
          </div>
          <span className="text-muted font-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Duplicates Blocked</span>
          <h3 className="m-0 font-extrabold mt-1">{duplicatesPrevented}</h3>
        </div>
      </div>
    </div>
  );
};

export default ApplicationAgentStatus;
