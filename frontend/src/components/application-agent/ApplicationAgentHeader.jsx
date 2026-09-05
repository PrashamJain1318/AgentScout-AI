import React from 'react';
import { Bot, Play, Pause, Shield, Sparkles } from 'lucide-react';

const ApplicationAgentHeader = ({ agent, onEnableMode, onDisableAgent, onRunAgent, running }) => {
  const currentMode = agent?.mode || 'ASSISTED';
  const status = agent?.status || 'IDLE';
  const isEnabled = agent?.enabled && status !== 'PAUSED';

  return (
    <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Bot size={28} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="m-0 font-bold" style={{ fontSize: '22px' }}>AI Application Agent</h2>
              <span className={`badge ${isEnabled ? 'bg-success' : 'bg-warning'} px-2 py-1 style-badge`}>
                {status}
              </span>
            </div>
            <p className="text-muted m-0 mt-1" style={{ fontSize: '13px' }}>
              Autonomous AI agent for role analysis, ATS resume tailoring, cover letter drafting, and submission safety.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center flex-wrap gap-2">
          {/* Mode Switcher */}
          <div className="btn-group role-tab-group" role="group" aria-label="Agent Modes">
            {['MANUAL', 'ASSISTED', 'AUTONOMOUS'].map((mode) => (
              <button
                key={mode}
                type="button"
                className={`btn btn-sm ${currentMode === mode ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => onEnableMode(mode)}
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Action Trigger CTAs */}
          {isEnabled ? (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
              onClick={onDisableAgent}
            >
              <Pause size={14} />
              <span>Pause Agent</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
              onClick={() => onEnableMode('ASSISTED')}
            >
              <Play size={14} />
              <span>Enable Agent</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3"
            onClick={onRunAgent}
            disabled={running}
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }}
          >
            <Sparkles size={14} />
            <span>{running ? 'Running...' : 'Run Agent'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationAgentHeader;
