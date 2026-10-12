import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Building2, GraduationCap, LogIn, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/forms/FormField';
import AlertBanner from '../../components/common/AlertBanner';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();

  // Detect selected role from query param or session storage
  const currentRole = (
    searchParams.get('role') ||
    sessionStorage.getItem('selectedRole') ||
    'HOSTELER'
  ).toUpperCase();

  const isHosteller = currentRole === 'HOSTELER';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'WARDEN' || user.role === 'ADMIN') {
        navigate('/warden');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.message === 'Network Error'
          ? 'Network Error: Cannot connect to backend server. Make sure Spring Boot is running on port 8080.'
          : err.message) ||
        'Invalid email or password. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    if (isHosteller) {
      setFormData({
        email: 'student@hostel.com',
        password: 'student123',
      });
    } else {
      setFormData({
        email: 'warden@hostel.com',
        password: 'admin123',
      });
    }
    setErrors({});
    setServerError('');
  };

  const handleSwitchPortal = () => {
    const targetRole = isHosteller ? 'WARDEN' : 'HOSTELER';
    sessionStorage.setItem('selectedRole', targetRole);
    setSearchParams({ role: targetRole });
    setFormData({ email: '', password: '' });
    setErrors({});
    setServerError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isHosteller
          ? 'linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #eff6ff 100%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)',
          width: '100%',
          maxWidth: '460px',
          padding: '36px 32px',
          animation: 'fadeIn 200ms forwards',
        }}
      >
        {/* Back to Role Selection Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => navigate('/select-role')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            <ArrowLeft size={16} />
            <span>← Back to Role Selection</span>
          </button>
        </div>

        {/* Header with Role Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: isHosteller
                ? 'linear-gradient(135deg, #0d9488, #0f766e)'
                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: isHosteller
                ? '0 6px 16px rgba(13, 148, 136, 0.35)'
                : '0 6px 16px rgba(37, 99, 235, 0.35)',
            }}
          >
            {isHosteller ? <GraduationCap size={30} /> : <Building2 size={30} />}
          </div>

          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: isHosteller ? '#ccfbf1' : '#dbeafe',
              color: isHosteller ? '#0f766e' : '#1e40af',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            {isHosteller ? '🎓 Hosteller Portal' : '🏢 Owner & Warden Portal'}
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {isHosteller ? 'Hosteller Sign In' : 'Owner & Warden Sign In'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isHosteller
              ? 'Enter student credentials to view your room, fees, and notices'
              : 'Enter administrative credentials to manage rooms, students, and hostel operations'}
          </p>
        </div>

        {serverError && (
          <AlertBanner
            type="error"
            message={serverError}
            onClose={() => setServerError('')}
          />
        )}

        {/* 1-Click Fast Fill Demo Button for the Selected Role */}
        <div
          style={{
            background: isHosteller ? '#f0fdfa' : '#f8fafc',
            border: `1px dashed ${isHosteller ? '#99f6e4' : '#cbd5e1'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            ⚡ 1-Click Demo Credentials
          </div>
          <button
            type="button"
            className={`btn ${isHosteller ? 'btn-teal' : 'btn-primary'} btn-sm`}
            style={{ width: '100%', padding: '9px 12px', fontWeight: 600 }}
            onClick={handleFillDemo}
          >
            {isHosteller
              ? '🎓 Auto-Fill Demo Hosteller (student@hostel.com)'
              : '🏢 Auto-Fill Demo Warden (warden@hostel.com)'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={isHosteller ? 'student@hostel.com' : 'warden@hostel.com'}
            error={errors.email}
            icon={Mail}
            required
            autoComplete="email"
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            icon={Lock}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            className={`btn ${isHosteller ? 'btn-teal' : 'btn-primary'}`}
            style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign in as {isHosteller ? 'Hosteller' : 'Owner / Warden'}</span>
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '22px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          Don't have an account yet?{' '}
          <Link
            to={`/register?role=${isHosteller ? 'HOSTELER' : 'WARDEN'}`}
            style={{
              color: isHosteller ? 'var(--teal)' : 'var(--primary)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Create {isHosteller ? 'Hosteller' : 'Warden'} account
          </Link>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
              {isHosteller ? 'Are you an Owner or Warden?' : 'Are you a Student or Hosteller?'}{' '}
            </span>
            <button
              type="button"
              onClick={handleSwitchPortal}
              style={{
                background: 'transparent',
                border: 'none',
                color: isHosteller ? 'var(--primary)' : 'var(--teal)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Switch to {isHosteller ? 'Owner / Warden Portal' : 'Hosteller Portal'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
