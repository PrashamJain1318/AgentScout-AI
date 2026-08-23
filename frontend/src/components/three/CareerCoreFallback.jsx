import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import './CareerCore.css';

/**
 * 2D CSS Fallback for WebGL-disabled environments or prefers-reduced-motion
 */
const CareerCoreFallback = ({ readiness = 75, agentStatus = 'IDLE' }) => {
  return (
    <div className="career-core-fallback-stage">
      <div className="fallback-orbit-ring" />
      <div className="fallback-center-core">
        <Bot size={28} />
      </div>
    </div>
  );
};

export default CareerCoreFallback;
