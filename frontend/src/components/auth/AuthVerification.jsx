import React from 'react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  LockKeyhole,
  AlertCircle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import './AuthVerification.css';

/**
 * Premium AI Authentication Verification & Route Transition Screen
 * Renders an AI Status Orbit with dark glassmorphism, smooth CSS keyframes,
 * telemetry indicators, and fast response-dependent state transitions.
 */
const AuthVerification = ({
  state = 'CHECKING',
  title = null,
  description = null,
  onRetry = null,
  fullScreen = true
}) => {

  const stateConfigs = {
    CHECKING: {
      defaultTitle: 'Verifying Session',
      defaultDesc: 'Securing your career workspace...',
      icon: <Bot size={32} className="ai-orbit-icon" />
    },
    AUTHENTICATED: {
      defaultTitle: 'Access Granted',
      defaultDesc: 'Your career workspace is ready.',
      icon: <CheckCircle2 size={34} className="ai-orbit-icon" />
    },
    UNAUTHENTICATED: {
      defaultTitle: 'Session Required',
      defaultDesc: 'Redirecting you to secure sign in...',
      icon: <LockKeyhole size={30} className="ai-orbit-icon" />
    },
    ERROR: {
      defaultTitle: 'Connection Check Failed',
      defaultDesc: 'Unable to verify your session. Please try again.',
      icon: <AlertCircle size={32} className="ai-orbit-icon" />
    }
  };

  const config = stateConfigs[state] || stateConfigs.CHECKING;
  const displayTitle = title || config.defaultTitle;
  const displayDesc = description || config.defaultDesc;

  return (
    <div className={`auth-verification-wrapper state-${state} ${fullScreen ? 'fullscreen' : 'embedded'}`}>
      
      <div className="auth-verification-card">
        
        {/* BRAND LOGO HEADER */}
        <div className="auth-verification-header">
          <div className="auth-brand-mark">A</div>
          <span className="auth-brand-title">AgentScout AI</span>
        </div>

        {/* AI STATUS ORBIT STAGE */}
        <div className="ai-orbit-stage">
          <div className="ai-orbit-ring-outer" />
          <div className="ai-orbit-ring-middle" />
          <div className="ai-orbit-particle" />
          
          <div className="ai-orbit-core">
            {config.icon}
          </div>
        </div>

        {/* STATUS TITLE & DESCRIPTION */}
        <h3 className="auth-status-title">{displayTitle}</h3>
        <p className="auth-status-desc">{displayDesc}</p>

        {/* RETRY ACTION ON ERROR STATE */}
        {state === 'ERROR' && onRetry && (
          <button
            type="button"
            className="auth-retry-btn"
            onClick={onRetry}
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        )}

        {/* FOOTER TELEMETRY INDICATORS */}
        {state !== 'ERROR' && (
          <div className="auth-telemetry-row active">
            <div className="auth-telemetry-item">
              <span className="auth-telemetry-dot" />
              <span>SESSION</span>
            </div>
            <span>•</span>
            <div className="auth-telemetry-item">
              <span>PROFILE</span>
            </div>
            <span>•</span>
            <div className="auth-telemetry-item">
              <span>SECURITY</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AuthVerification;
