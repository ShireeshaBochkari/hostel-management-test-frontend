import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '72px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '24px' }}>
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} /> Return Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
