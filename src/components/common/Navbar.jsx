import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Badge from './Badge';

const Navbar = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="page-info">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="topbar-actions">
        <Badge
          variant={user?.role === 'HOSTELER' ? 'hosteler' : 'warden'}
          text={user?.role === 'HOSTELER' ? 'Student' : 'Owner / Warden'}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
            {user?.fullName}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            ({user?.email})
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
