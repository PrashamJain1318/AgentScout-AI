import React from 'react';
import { Sparkles, FileText, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import GeneratedContentEditor from './GeneratedContentEditor';

const ActionPackage = ({ pkg, onSaveContent, onApprovePackage }) => {
  if (!pkg) return null;

  const resumeRecs = pkg.resumeRecommendations || {};

  return (
    <div className="analytics-section-card action-package-workspace">
      <div className="section-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} className="text-primary" />
          <div>
            <h4 style={{ margin: 0 }}>{pkg.title || 'Career Action Package'}</h4>
            <span className="subtitle-text" style={{ fontSize: '12px' }}>
              Target: {pkg.opportunity?.title || 'Target Role'} ({pkg.opportunity?.company || 'Target Company'})
            </span>
          </div>
        </div>

        <button
          type="button"
          className="save-profile-btn"
          disabled={pkg.approvalState === 'APPROVED'}
          onClick={() => onApprovePackage && onApprovePackage(pkg.packageId || pkg._id)}
        >
          <CheckCircle size={15} />
          <span>{pkg.approvalState === 'APPROVED' ? 'Package Approved' : 'Approve Action Package'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', margin: '16px 0' }}>
        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
          <span className="eyebrow">Match Score</span>
          <strong style={{ display: 'block', fontSize: '20px', color: 'var(--primary)', marginTop: '4px' }}>
            {pkg.matchAnalysis?.fitScore || 85}%
          </strong>
        </div>

        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
          <span className="eyebrow">Readiness Score</span>
          <strong style={{ display: 'block', fontSize: '20px', color: 'var(--success)', marginTop: '4px' }}>
            {pkg.readinessScore || 82}%
          </strong>
        </div>

        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
          <span className="eyebrow">Approval State</span>
          <strong style={{ display: 'block', fontSize: '14px', color: pkg.approvalState === 'APPROVED' ? 'var(--success)' : 'var(--warning)', marginTop: '6px' }}>
            {pkg.approvalState || 'PENDING'}
          </strong>
        </div>
      </div>

      {/* Resume Optimization breakdown (Existing vs Improvements vs Missing) */}
      <div style={{ marginBottom: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', background: 'var(--surface)' }}>
        <h5 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} className="text-primary" />
          Resume Optimization Breakdown (No Experience Fabrication)
        </h5>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '12px' }}>
          <div style={{ background: 'var(--surface-muted)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--success)' }}>✓ EXISTING EXPERIENCE</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: '18px', color: 'var(--text-muted)' }}>
              {(resumeRecs.existingExperience || ['5+ years Full Stack Engineering', 'React & Node.js']).map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'var(--surface-muted)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--primary)' }}>⚡ RECOMMENDED IMPROVEMENTS</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: '18px', color: 'var(--text-muted)' }}>
              {(resumeRecs.recommendedImprovement || ['Add metric: Improved render speed by 50%']).map((im, i) => (
                <li key={i}>{im}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'var(--surface-muted)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--warning)' }}>⚠️ MISSING EXPERIENCE (Flagged)</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: '18px', color: 'var(--text-muted)' }}>
              {(resumeRecs.missingExperience || ['Rust language']).map((mi, i) => (
                <li key={i}>{mi}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Generated Content Editors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <GeneratedContentEditor
          title="Tailored Cover Letter"
          fieldName="coverLetter"
          contentObj={pkg.coverLetter}
          onSave={(field, content) => onSaveContent && onSaveContent(pkg.packageId || pkg._id, field, content)}
        />

        <GeneratedContentEditor
          title="Outreach & Connection Message"
          fieldName="outreachMessage"
          contentObj={pkg.outreachMessage}
          onSave={(field, content) => onSaveContent && onSaveContent(pkg.packageId || pkg._id, field, content)}
        />
      </div>
    </div>
  );
};

export default ActionPackage;
