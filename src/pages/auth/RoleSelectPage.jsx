import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, ArrowRight, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RoleSelectPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSelectRole = (role) => {
    sessionStorage.setItem('selectedRole', role);
    // If already logged in with matching role, go directly to that dashboard
    if (isAuthenticated) {
      if ((role === 'WARDEN' || role === 'ADMIN') && (user?.role === 'WARDEN' || user?.role === 'ADMIN')) {
        navigate('/warden');
        return;
      }
      if (role === 'HOSTELER' && user?.role === 'HOSTELER') {
        navigate('/student');
        return;
      }
    }
    navigate(`/login?role=${role}`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e6fffa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span>HOSTEL MANAGEMENT SYSTEM</span>
          </div>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-1px',
              marginBottom: '10px',
            }}
          >
            Welcome to HostelHub
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
            Select your account type to access your dedicated management portal.
          </p>
        </div>

        {isAuthenticated && user && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 20px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
              <UserCheck size={20} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Currently logged in as: </span>
                <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{user.fullName}</strong>
                <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', marginLeft: '6px', fontWeight: 700 }}>
                  {user.role}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate(user.role === 'HOSTELER' ? '/student' : '/warden')}
              >
                Go to Dashboard →
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={logout}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Hosteller Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 28px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left',
              transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
              cursor: 'pointer',
            }}
            onClick={() => handleSelectRole('HOSTELER')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '24px',
                boxShadow: '0 8px 16px rgba(13, 148, 136, 0.3)',
              }}
            >
              <GraduationCap size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Hosteller
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px', flex: 1 }}>
              View your room allocation, track monthly fee payments, submit maintenance complaints, request visitor passes, and receive hostel notices.
            </p>

            <button
              type="button"
              className="btn btn-teal"
              style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole('HOSTELER');
              }}
            >
              <span>Continue as Hosteller</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Owner / Warden Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 28px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left',
              transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
              cursor: 'pointer',
            }}
            onClick={() => handleSelectRole('WARDEN')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '24px',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Building2 size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Owner / Warden
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px', flex: 1 }}>
              Full administrative control to manage rooms, assign occupants, record fees, review and resolve complaints, approve visitor passes, and broadcast announcements.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole('WARDEN');
              }}
            >
              <span>Continue as Owner / Warden</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectPage;
