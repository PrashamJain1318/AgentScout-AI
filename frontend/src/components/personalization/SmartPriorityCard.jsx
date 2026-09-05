import React from "react";
import { ArrowRight, AlertCircle, Sparkles, Target, Zap, Mic, FileText, Briefcase } from "lucide-react";
import FadeIn from "../motion/FadeIn";

const getIcon = (iconName) => {
  switch (iconName) {
    case 'mic':
      return <Mic size={20} className="priority-icon-active" />;
    case 'target':
      return <Target size={20} className="priority-icon-active" />;
    case 'file-text':
      return <FileText size={20} className="priority-icon-active" />;
    case 'zap':
      return <Zap size={20} className="priority-icon-active" />;
    case 'briefcase':
      return <Briefcase size={20} className="priority-icon-active" />;
    default:
      return <Sparkles size={20} className="priority-icon-active" />;
  }
};

const SmartPriorityCard = ({ topPriority, onNavigate }) => {
  if (!topPriority) return null;

  const { title, description, category, priority, deepLink, actionLabel, impact, reason, icon } = topPriority;
  const isCritical = priority === 'critical';

  return (
    <FadeIn direction="up" distance={12}>
      <section className={`smart-priority-banner ${isCritical ? 'banner-critical' : 'banner-recommended'}`}>
        <div className="banner-top-meta">
          <span className={`priority-badge ${isCritical ? 'badge-critical' : 'badge-high'}`}>
            {isCritical ? <AlertCircle size={13} /> : <Sparkles size={13} />}
            {isCritical ? 'URGENT PRIORITIZED ACTION' : 'TOP RECOMMENDED ACTION'}
          </span>
          <span className="priority-category-tag">{category.toUpperCase()}</span>
        </div>

        <div className="banner-content-body">
          <div className="banner-icon-container">
            {getIcon(icon)}
          </div>

          <div className="banner-text-block">
            <h2 className="banner-title">{title}</h2>
            <p className="banner-description">{description}</p>
            {reason && (
              <p className="banner-reason">
                💡 <em>AI Rationale: {reason}</em>
              </p>
            )}
          </div>

          <div className="banner-action-side">
            <span className="impact-pill">{impact || 'High Impact'}</span>
            <button
              onClick={() => onNavigate(deepLink || '/dashboard')}
              className="banner-primary-btn"
            >
              <span>{actionLabel || 'Take Action'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </FadeIn>
  );
};

export default SmartPriorityCard;
