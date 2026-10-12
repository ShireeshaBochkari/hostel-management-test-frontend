import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AlertBanner = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: AlertCircle },
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', icon: CheckCircle2 },
    info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', icon: Info },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: AlertCircle },
  };

  const current = styles[type] || styles.info;
  const Icon = current.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        borderRadius: 'var(--radius-md)',
        color: current.color,
        fontSize: '13px',
        fontWeight: 600,
        marginBottom: '16px',
        animation: 'fadeIn 150ms forwards',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: current.color,
            cursor: 'pointer',
            display: 'flex',
            padding: '2px',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
