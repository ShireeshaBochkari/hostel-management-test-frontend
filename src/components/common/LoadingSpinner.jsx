import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 28, fullPage = false }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px' }}>
      <Loader2 className="animate-spin" size={size} style={{ color: 'var(--primary)' }} />
      {message && <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
