import React from 'react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Unable to load requested data at this time.',
  onRetry
}) => {
  return (
    <div className="glass-card" style={{
      padding: '32px',
      textAlign: 'center',
      maxWidth: '480px',
      margin: '24px auto',
      borderColor: 'rgba(244, 63, 94, 0.3)'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        background: 'rgba(244, 63, 94, 0.15)',
        color: '#f43f5e',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
        fontSize: '1.25rem',
        fontWeight: 'bold'
      }}>
        ⚠️
      </div>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
