import React from "react";
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import FadeIn from "../motion/FadeIn";

const AIInsightCard = ({ insight, onNavigate }) => {
  if (!insight) return null;

  const { title, category, tip, deepLink, deepLinkLabel, rationale } = insight;

  return (
    <FadeIn direction="up" distance={15}>
      <div className="ai-insight-card">
        <div className="insight-card-header">
          <div className="insight-tag">
            <Lightbulb size={14} />
            <span>AI CAREER INSIGHT</span>
          </div>
          <span className="insight-category">{category || 'Optimization'}</span>
        </div>

        <h4 className="insight-title">{title}</h4>
        <p className="insight-tip">{tip}</p>

        {rationale && (
          <p className="insight-rationale">
            <Sparkles size={12} className="inline-sparkle" /> {rationale}
          </p>
        )}

        <div className="insight-footer">
          <button
            onClick={() => onNavigate(deepLink || '/dashboard')}
            className="insight-action-link"
          >
            <span>{deepLinkLabel || 'Learn More'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </FadeIn>
  );
};

export default AIInsightCard;
