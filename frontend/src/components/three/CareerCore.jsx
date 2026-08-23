import React, { useState, useEffect, useMemo, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight } from 'lucide-react';
import CareerCoreScene from './CareerCoreScene';
import CareerCoreFallback from './CareerCoreFallback';
import './CareerCore.css';

/**
 * Robust ErrorBoundary catching any Three.js / WebGL / R3F Canvas errors.
 * Guarantees zero blank screens on any device or browser environment.
 */
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('CareerCore 3D Canvas notice:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <CareerCoreFallback readiness={this.props.readiness} agentStatus={this.props.agentStatus} />;
    }
    return this.props.children;
  }
}

/**
 * Top-level CareerCore component integrating R3F 3D Canvas, Overlays,
 * Navigation callbacks, and WebGL Error Safety.
 */
const CareerCore = ({
  readiness = {},
  agentStatus = 'IDLE',
  nextAction = null
}) => {
  const navigate = useNavigate();
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isWebGLAvailable, setIsWebGLAvailable] = useState(true);

  // Check WebGL context support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLAvailable(false);
      }
    } catch (e) {
      setIsWebGLAvailable(false);
    }
  }, []);

  // 6 Core Career Pillar Nodes in hexagonal 3D spatial orbit
  const nodes = useMemo(() => {
    const radius = 2.45;
    const angles = [0, 60, 120, 180, 240, 300].map(deg => (deg * Math.PI) / 180);

    return [
      {
        id: 1,
        label: 'RESUME',
        category: 'resume',
        score: readiness.resume || 75,
        deepLink: '/dashboard/resume',
        position: [radius * Math.cos(angles[0]), radius * Math.sin(angles[0]) * 0.7, 0.4]
      },
      {
        id: 2,
        label: 'SKILLS',
        category: 'skills',
        score: readiness.skills || 70,
        deepLink: '/dashboard/career-copilot',
        position: [radius * Math.cos(angles[1]), radius * Math.sin(angles[1]) * 0.7, -0.3]
      },
      {
        id: 3,
        label: 'OPPORTUNITIES',
        category: 'opportunities',
        score: readiness.opportunities || 85,
        deepLink: '/dashboard/opportunities',
        position: [radius * Math.cos(angles[2]), radius * Math.sin(angles[2]) * 0.7, 0.3]
      },
      {
        id: 4,
        label: 'APPLICATIONS',
        category: 'applications',
        score: readiness.application || 65,
        deepLink: '/dashboard/applications',
        position: [radius * Math.cos(angles[3]), radius * Math.sin(angles[3]) * 0.7, -0.4]
      },
      {
        id: 5,
        label: 'INTERVIEWS',
        category: 'interview',
        score: readiness.interview || 75,
        deepLink: '/dashboard/interview-coach',
        position: [radius * Math.cos(angles[4]), radius * Math.sin(angles[4]) * 0.7, 0.2]
      },
      {
        id: 6,
        label: 'CAREER PLAN',
        category: 'career',
        score: readiness.overall || 80,
        deepLink: '/dashboard/career-planner',
        position: [radius * Math.cos(angles[5]), radius * Math.sin(angles[5]) * 0.7, -0.2]
      }
    ];
  }, [readiness]);

  const currentActionTitle = nextAction?.title || 'Optimize Resume ATS Score';
  const nextActionCategory = nextAction?.category || 'resume';

  return (
    <div className="career-core-container">
      
      {/* TOP HEADER OVERLAY */}
      <div className="career-core-overlay-top">
        <div className="career-core-badge">
          <Bot size={13} />
          <span>AI CAREER CORE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <span>AGENT • {agentStatus}</span>
        </div>
      </div>

      {/* THREE.JS 3D CANVAS WRAPPER */}
      <div className="career-core-canvas-wrapper">
        {!isWebGLAvailable ? (
          <CareerCoreFallback readiness={readiness.overall} agentStatus={agentStatus} />
        ) : (
          <WebGLErrorBoundary readiness={readiness.overall} agentStatus={agentStatus}>
            <CareerCoreScene
              readiness={readiness}
              agentStatus={agentStatus}
              nextActionCategory={nextActionCategory}
              nodes={nodes}
              hoveredNodeId={hoveredNodeId}
              onHoverNode={(id) => setHoveredNodeId(id)}
              onUnhoverNode={() => setHoveredNodeId(null)}
            />
          </WebGLErrorBoundary>
        )}
      </div>

      {/* BOTTOM ACTION FOOTER OVERLAY */}
      <div className="career-core-overlay-bottom">
        <div className="core-action-info">
          <span className="core-action-label">TARGET PRIORITY</span>
          <strong className="core-action-title">{currentActionTitle}</strong>
        </div>

        <button
          type="button"
          className="save-profile-btn"
          onClick={() => navigate('/dashboard/agent')}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            border: 'none',
            padding: '7px 14px',
            fontSize: '12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <span>Command Center</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};

export default CareerCore;
