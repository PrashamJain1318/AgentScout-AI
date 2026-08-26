import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, AlertCircle, Circle } from 'lucide-react';

const WorkflowSteps = ({ steps = [] }) => {
  if (!steps || steps.length === 0) {
    return <p className="subtitle-text">No step details available.</p>;
  }

  const getStepIcon = (status, riskLevel) => {
    if (status === 'COMPLETED') return <CheckCircle2 size={16} className="text-success" />;
    if (status === 'FAILED') return <AlertCircle size={16} className="text-danger" />;
    if (riskLevel === 'EXTERNAL_ACTION' || riskLevel === 'HIGH_IMPACT') return <ShieldAlert size={16} className="text-primary" />;
    if (status === 'IN_PROGRESS') return <Clock size={16} className="text-primary spin" />;
    return <Circle size={16} className="text-muted" />;
  };

  return (
    <div className="workflow-steps-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {steps.map((step, idx) => (
        <div
          key={step.stepId || idx}
          className={`step-item-row ${step.status === 'COMPLETED' ? 'completed' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ marginTop: '2px' }}>{getStepIcon(step.status, step.riskLevel)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text)' }}>
                {idx + 1}. {step.title}
              </strong>
              {step.riskLevel && (
                <span className={`eyebrow ${step.riskLevel === 'EXTERNAL_ACTION' ? 'text-primary' : ''}`} style={{ fontSize: '10px' }}>
                  {step.riskLevel}
                </span>
              )}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowSteps;
