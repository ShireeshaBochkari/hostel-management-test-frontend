import React from 'react';

const StatCard = ({ title, value, hint, icon: Icon, color = 'blue' }) => {
  return (
    <div className="stat-card">
      {Icon && (
        <div className={`stat-icon-wrapper ${color}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
};

export default StatCard;
