import React from "react";
import { CheckCircle2, Compass, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import FadeIn from "../motion/FadeIn";

const CareerJourney = ({ phases, onNavigate }) => {
  const journeyPhases = phases && phases.length > 0 ? phases : [
    { id: 'phase-profile', label: 'Profile Setup', status: 'completed', progress: 100, deepLink: '/settings' },
    { id: 'phase-resume', label: 'Resume Optimization', status: 'active', progress: 65, deepLink: '/resume-studio' },
    { id: 'phase-opportunities', label: 'Job Discovery', status: 'upcoming', progress: 20, deepLink: '/opportunity-discovery' },
    { id: 'phase-applications', label: 'Applications', status: 'upcoming', progress: 0, deepLink: '/applications' },
    { id: 'phase-interviews', label: 'Interviews', status: 'upcoming', progress: 0, deepLink: '/interview-prep' },
    { id: 'phase-growth', label: 'Career OS', status: 'upcoming', progress: 0, deepLink: '/career-os' }
  ];

  return (
    <FadeIn direction="up" distance={15}>
      <div className="career-journey-container">
        <div className="journey-header">
          <div className="journey-title-wrap">
            <Compass size={18} className="journey-icon" />
            <h3 className="journey-heading">Adaptive Career Roadmap</h3>
          </div>
          <span className="journey-sublabel">Automated Stage Tracker</span>
        </div>

        <div className="journey-pipeline-grid">
          {journeyPhases.map((phase, idx) => {
            const isCompleted = phase.status === 'completed';
            const isActive = phase.status === 'active';

            return (
              <div
                key={phase.id || idx}
                className={`journey-step-card ${isCompleted ? 'step-completed' : isActive ? 'step-active' : 'step-upcoming'}`}
                onClick={() => onNavigate(phase.deepLink || '/dashboard')}
                title={`Click to navigate to ${phase.label}`}
              >
                <div className="step-top-row">
                  <span className="step-number">0{idx + 1}</span>
                  <span className={`step-status-tag status-${phase.status}`}>
                    {isCompleted ? <CheckCircle2 size={12} /> : isActive ? <ShieldCheck size={12} /> : null}
                    {phase.status.toUpperCase()}
                  </span>
                </div>

                <h4 className="step-label">{phase.label}</h4>
                {phase.description && <p className="step-desc">{phase.description}</p>}

                <div className="step-progress-bar-bg">
                  <div
                    className="step-progress-fill"
                    style={{ width: `${phase.progress || (isCompleted ? 100 : isActive ? 50 : 0)}%` }}
                  />
                </div>

                <div className="step-footer">
                  <span className="step-progress-txt">{phase.progress || (isCompleted ? 100 : isActive ? 50 : 0)}%</span>
                  <ChevronRight size={14} className="step-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
};

export default CareerJourney;
