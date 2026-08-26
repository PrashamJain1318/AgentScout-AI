import React, { useState } from 'react';
import { Edit3, Check, RotateCcw, FileText } from 'lucide-react';

const GeneratedContentEditor = ({ title, fieldName, contentObj, onSave }) => {
  const originalText = typeof contentObj === 'string' ? contentObj : (contentObj?.original || '');
  const currentText = typeof contentObj === 'string' ? contentObj : (contentObj?.edited || contentObj?.original || '');

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(currentText);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (onSave) {
        await onSave(fieldName, text);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Save content error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setText(originalText);
  };

  return (
    <div className="generated-content-editor" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', background: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} className="text-primary" />
          <strong style={{ fontSize: '14px' }}>{title}</strong>
          {contentObj?.edited && <span className="status-badge status-info" style={{ fontSize: '10px' }}>EDITED (v{contentObj.version || 2})</span>}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {!isEditing ? (
            <button type="button" className="action-btn secondary-btn" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setIsEditing(true)}>
              <Edit3 size={13} />
              <span>Edit Content</span>
            </button>
          ) : (
            <>
              <button type="button" className="action-btn secondary-btn" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleReset}>
                <RotateCcw size={13} />
                <span>Reset Original</span>
              </button>

              <button type="button" className="save-profile-btn" style={{ padding: '4px 12px', fontSize: '12px' }} disabled={saving} onClick={handleSave}>
                <Check size={13} />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface-muted)',
            color: 'var(--text)',
            fontSize: '13px',
            lineHeight: 1.5,
            resize: 'vertical'
          }}
        />
      ) : (
        <div style={{ background: 'var(--surface-muted)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
          {text || <span className="subtitle-text">No content generated.</span>}
        </div>
      )}
    </div>
  );
};

export default GeneratedContentEditor;
