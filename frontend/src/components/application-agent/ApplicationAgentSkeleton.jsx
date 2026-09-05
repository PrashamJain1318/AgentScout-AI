import React from 'react';

const ApplicationAgentSkeleton = () => {
  return (
    <div className="container-fluid p-4" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Skeleton */}
      <div className="card border-0 p-4 mb-4 shadow-sm" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="placeholder-glow">
            <div className="placeholder rounded-3" style={{ width: '52px', height: '52px' }} />
          </div>
          <div className="flex-grow-1 placeholder-glow">
            <div className="placeholder col-4 mb-2 rounded-2" style={{ height: '22px' }} />
            <div className="placeholder col-7 rounded-1" style={{ height: '14px' }} />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="card border-0 p-3 shadow-sm placeholder-glow text-center" style={{ borderRadius: '12px' }}>
              <div className="placeholder col-6 mb-2 mx-auto rounded-1" style={{ height: '12px' }} />
              <div className="placeholder col-4 mx-auto rounded-2" style={{ height: '28px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="card border-0 p-4 mb-4 shadow-sm placeholder-glow" style={{ borderRadius: '16px' }}>
        <div className="placeholder col-3 mb-3 rounded-2" style={{ height: '20px' }} />
        <div className="placeholder col-12 mb-2 rounded-2" style={{ height: '14px' }} />
        <div className="placeholder col-8 rounded-2" style={{ height: '14px' }} />
      </div>
    </div>
  );
};

export default ApplicationAgentSkeleton;
