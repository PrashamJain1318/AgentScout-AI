import React from 'react';

const ApplicationReadiness = ({ readinessMetrics }) => {
  const {
    overall = 0,
    resume = 0,
    skills = 0,
    experience = 0,
    projects = 0,
    ats = 0,
    interview = 0
  } = readinessMetrics || {};

  const getBarColor = (val) => {
    if (val >= 85) return '#10b981';
    if (val >= 70) return '#6366f1';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const metricsList = [
    { label: 'Resume Content', value: resume },
    { label: 'Skills Coverage', value: skills },
    { label: 'Experience Match', value: experience },
    { label: 'Projects & Portfolio', value: projects },
    { label: 'ATS Score', value: ats },
    { label: 'Interview Preparedness', value: interview }
  ];

  return (
    <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'var(--card-bg, #ffffff)' }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0 font-bold" style={{ fontSize: '16px' }}>Application Readiness</h4>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted" style={{ fontSize: '13px' }}>Overall Readiness:</span>
          <span className="font-extrabold" style={{ fontSize: '20px', color: getBarColor(overall) }}>
            {overall}%
          </span>
        </div>
      </div>

      {/* Main Composite Progress Bar */}
      <div className="progress mb-4" style={{ height: '10px', borderRadius: '6px', backgroundColor: 'var(--progress-bg, #e5e7eb)' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{
            width: `${overall}%`,
            backgroundColor: getBarColor(overall),
            borderRadius: '6px',
            transition: 'width 0.6s ease'
          }}
          aria-valuenow={overall}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      {/* Breakdown Grid */}
      <div className="row g-3">
        {metricsList.map((m) => (
          <div key={m.label} className="col-12 col-md-6">
            <div className="p-2 border rounded" style={{ background: 'var(--subcard-bg, rgba(249, 250, 251, 0.6))' }}>
              <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '12px' }}>
                <span className="font-semibold">{m.label}</span>
                <span className="font-bold" style={{ color: getBarColor(m.value) }}>{m.value}%</span>
              </div>
              <div className="progress" style={{ height: '6px', borderRadius: '4px', backgroundColor: 'var(--progress-bg, #e5e7eb)' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${m.value}%`,
                    backgroundColor: getBarColor(m.value),
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationReadiness;
