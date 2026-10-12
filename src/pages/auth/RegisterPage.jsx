import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, BookOpen, UserPlus, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/forms/FormField';
import AlertBanner from '../../components/common/AlertBanner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const initialRole = (searchParams.get('role') || 'HOSTELER').toUpperCase();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    course: '',
    role: initialRole === 'WARDEN' || initialRole === 'OWNER' ? 'WARDEN' : 'HOSTELER',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
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

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    setSuccessMsg('');

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim() || null,
        course: formData.course.trim() || null,
        role: formData.role,
      });

      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate(`/login?role=${formData.role}`);
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.message === 'Network Error'
          ? 'Network Error: Cannot connect to backend server. Make sure Spring Boot is running on port 8080.'
          : err.message) ||
        'Registration failed. Please check your information and try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isHosteller = formData.role === 'HOSTELER';

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
          maxWidth: '500px',
          padding: '36px 32px',
          animation: 'fadeIn 200ms forwards',
        }}
      >
        <div style={{ marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => navigate(`/login?role=${formData.role}`)}
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
            <span>← Back to {isHosteller ? 'Hosteller' : 'Warden'} Login</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Create {isHosteller ? 'Hosteller' : 'Warden'} Account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isHosteller
              ? 'Register student account to access room, fees, and notices'
              : 'Register administrator account to manage hostel operations'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleSelect('HOSTELER')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isHosteller ? 'var(--accent-teal)' : 'transparent',
              color: isHosteller ? '#ffffff' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            🎓 Hosteller Student
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('WARDEN')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: !isHosteller ? 'var(--primary)' : 'transparent',
              color: !isHosteller ? '#ffffff' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            🏢 Hostel Owner / Warden
          </button>
        </div>

        {serverError && (
          <AlertBanner
            type="error"
            message={serverError}
            onClose={() => setServerError('')}
          />
        )}

        {successMsg && (
          <AlertBanner
            type="success"
            message={successMsg}
          />
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            error={errors.fullName}
            icon={User}
            required
            autoComplete="name"
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@hostel.com"
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
            placeholder="At least 8 characters"
            error={errors.password}
            icon={Lock}
            required
            autoComplete="new-password"
          />

          <FormField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            icon={Phone}
          />

          <FormField
            label={isHosteller ? 'Course / Branch' : 'Designation / Department'}
            name="course"
            value={formData.course}
            onChange={handleChange}
            placeholder={isHosteller ? 'e.g. B.Tech Computer Science' : 'e.g. Senior Warden'}
            icon={BookOpen}
          />

          <button
            type="submit"
            className={`btn ${isHosteller ? 'btn-teal' : 'btn-primary'}`}
            style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register as {isHosteller ? 'Hosteller' : 'Warden'}</span>
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link
            to={`/login?role=${formData.role}`}
            style={{ color: isHosteller ? 'var(--teal)' : 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
