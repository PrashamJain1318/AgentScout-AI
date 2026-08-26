import React from 'react';

const WorkflowProgress = ({ progress = 0, currentStep = 0, totalSteps = 15 }) => {
  return (
    <div className="workflow-progress-wrapper" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>
        <span className="subtitle-text">Progress ({currentStep}/{totalSteps} steps completed)</span>
        <span className="text-primary">{Math.min(100, Math.max(0, progress))}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border-muted)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            background: 'var(--primary)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};

export default WorkflowProgress;
