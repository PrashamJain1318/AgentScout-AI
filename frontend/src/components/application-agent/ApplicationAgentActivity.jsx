import React from 'react';
import { Activity, Clock } from 'lucide-react';

const ApplicationAgentActivity = ({ activities = [] }) => {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Activity size={18} className="text-primary" />
        <h4 className="m-0 font-bold" style={{ fontSize: '15px' }}>Recent Agent Activity</h4>
      </div>

      <div className="d-flex flex-column gap-2">
        {activities.slice(0, 5).map((act, idx) => (
          <div key={idx} className="p-2 border-bottom d-flex align-items-center justify-content-between" style={{ fontSize: '12px' }}>
            <div>
              <strong className="d-block text-dark">{act.title}</strong>
              <span className="text-muted">{act.description}</span>
            </div>
            <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
              <Clock size={11} /> {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationAgentActivity;
