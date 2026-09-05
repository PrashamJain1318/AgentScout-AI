import React from 'react';
import { Briefcase, MapPin, Building, Sparkles } from 'lucide-react';

const TargetOpportunity = ({ opportunity, matchScore, onAnalyze }) => {
  if (!opportunity) {
    return (
      <div className="card shadow-sm border-0 p-4 mb-4 text-center" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
        <div className="text-muted mb-2">
          <Briefcase size={32} />
        </div>
        <h4 className="font-bold mb-1" style={{ fontSize: '15px' }}>No Active Target Role Selected</h4>
        <p className="text-muted mb-3" style={{ fontSize: '12px' }}>
          Select an opportunity from Explorer to start AI Application Agent optimization.
        </p>
      </div>
    );
  }

  const { title, company, location, type, skills = [] } = opportunity;

  return (
    <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#374151',
              fontSize: '16px'
            }}
          >
            {company ? company.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <h4 className="m-0 font-bold" style={{ fontSize: '16px' }}>{title}</h4>
            <div className="d-flex align-items-center gap-3 text-muted mt-1" style={{ fontSize: '12px' }}>
              <span className="d-flex align-items-center gap-1"><Building size={12} /> {company}</span>
              <span className="d-flex align-items-center gap-1"><MapPin size={12} /> {location || 'Remote'}</span>
              <span className="badge bg-light text-dark border">{type}</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {matchScore > 0 && (
            <div className="text-end">
              <span className="text-muted d-block" style={{ fontSize: '11px' }}>Role Match</span>
              <strong className="text-primary" style={{ fontSize: '16px' }}>{matchScore}%</strong>
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
            onClick={() => onAnalyze(opportunity.id || opportunity._id)}
          >
            <Sparkles size={13} />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-2">
          {skills.slice(0, 6).map((skill, idx) => (
            <span key={idx} className="badge bg-soft-primary text-primary px-2 py-1" style={{ fontSize: '11px' }}>
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TargetOpportunity;
