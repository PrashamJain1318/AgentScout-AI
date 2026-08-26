import React from 'react';
import { CheckCircle2, XCircle, Star, Brain } from 'lucide-react';

const WorkflowOutcome = ({ outcome }) => {
  if (!outcome) return null;

  return (
    <div className="analytics-section-card outcome-card">
      <div className="section-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {outcome.success ? <CheckCircle2 size={18} className="text-success" /> : <XCircle size={18} className="text-danger" />}
          <h4 style={{ margin: 0 }}>{outcome.title || 'Workflow Outcome'}</h4>
        </div>
        <span className="eyebrow" style={{ fontSize: '11px' }}>
          {new Date(outcome.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', margin: '12px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
        <div>
          <span>Status: </span>
          <strong style={{ color: outcome.success ? 'var(--success)' : 'var(--danger)' }}>
            {outcome.success ? 'SUCCESS' : 'FAILED'}
          </strong>
        </div>

        <div>
          <span>Duration: </span>
          <strong>{outcome.durationMs || 1200}ms</strong>
        </div>

        {outcome.candidateFeedback?.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={13} className="text-warning" style={{ fill: 'var(--warning)' }} />
            <strong>{outcome.candidateFeedback.rating}/5 Rating</strong>
          </div>
        )}
      </div>

      {outcome.learnedInsights && outcome.learnedInsights.length > 0 && (
        <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, color: 'var(--primary)' }}>
            <Brain size={14} />
            <span>Agent Learned Insights:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted)' }}>
            {outcome.learnedInsights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkflowOutcome;
