import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import GECMLogo from '../components/GECMLogo';
import './LoginPage.css';

// ─────────────────────────────────────────────────────────────────────────────
// Role configuration — must match ROLE_ALIAS_MAP in server/routes/auth.js
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: '🎓',
    color: '#1d4ed8',
    bg: '#eff6ff',
    desc: 'Access your academics, fees, gate pass & hostel',
    dashboard: '/student/dashboard',
    demo: {
      email: 'student1@smartcampus.edu',
      password: 'Student@123',
      name: 'Arjun Patel',
      hint: 'B.Tech CSE — Semester 7'
    }
  },
  {
    id: 'faculty',
    label: 'Faculty',
    icon: '👨‍🏫',
    color: '#7c3aed',
    bg: '#f5f3ff',
    desc: 'Manage courses, attendance & student records',
    dashboard: '/faculty/dashboard',
    demo: {
      email: 'faculty1@smartcampus.edu',
      password: 'Faculty@123',
      name: 'Dr. Vikram Singh',
      hint: 'Associate Professor — CSE Dept'
    }
  },
  {
    id: 'administrator',
    label: 'Administrator',
    icon: '🏛️',
    color: '#0f766e',
    bg: '#f0fdfa',
    desc: 'System admin, user management & campus oversight',
    dashboard: '/admin/dashboard',
    demo: {
      email: 'admin@smartcampus.edu',
      password: 'Admin@123',
      name: 'Dr. Ramesh Kumar',
      hint: 'System Administrator'
    }
  }
];

// Extra demo accounts shown only under Administrator role
const EXTRA_DEMOS = {
  administrator: [
    {
      email: 'hod.cse@smartcampus.edu',
      password: 'Admin@123',
      label: 'HOD',
      hint: 'Head of Dept — CSE'
    },
    {
      email: 'warden@smartcampus.edu',
      password: 'Admin@123',
      label: 'Warden',
      hint: 'Hostel Admin'
    },
    {
      email: 'accounts@smartcampus.edu',
      password: 'Admin@123',
      label: 'Accounts',
      hint: 'Fee Cell'
    }
  ]
};

// Backend role → frontend route mapping (matches App.jsx ProtectedRoute allowedRoles)
const ROLE_REDIRECT = {
  student:  '/student/dashboard',
  faculty:  '/faculty/dashboard',
  hod:      '/faculty/dashboard',
  warden:   '/warden/dashboard',
  accounts: '/accounts/dashboard',
  admin:    '/admin/dashboard',
};

// ─────────────────────────────────────────────────────────────────────────────
// User-friendly error messages — one toast per request, always
// ─────────────────────────────────────────────────────────────────────────────
function getFriendlyError(err) {
  if (!err?.response) {
    // Network / CORS / backend unreachable
    return 'Unable to reach the server. Please check your internet connection or try again later.';
  }

  const status = err.response.status;
  const msg    = err.response?.data?.message;

  if (status === 400) return msg || 'Please check the information you entered.';
  if (status === 401) return 'Incorrect email/registration number or password. Please try again.';
  if (status === 403) return msg || 'You do not have permission to access this role. Please select the correct tab.';
  if (status === 404) return 'Login service not found. Please contact support.';
  if (status === 429) {
    const retry = err.response?.data?.retryAfter;
    return `Too many login attempts. Please wait ${retry || 15} minutes before trying again.`;
  }
  if (status >= 500) return 'A server error occurred. Please try again in a moment.';
  return msg || 'Login failed. Please try again.';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Login Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate        = useNavigate();
  const location        = useLocation();

  const [selectedRole,  setSelectedRole]  = useState('student');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [errors,        setErrors]        = useState({});
  const [loginError,    setLoginError]    = useState('');
  const [demoFilled,    setDemoFilled]    = useState(false);

  // ── Single submission gate — prevents any duplicate requests ─────────────
  const isSubmittingRef = useRef(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const dest = ROLE_REDIRECT[user.role] || '/';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  // ── Field change handlers ─────────────────────────────────────────────────
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors(prev => ({ ...prev, email: '' }));
    setLoginError('');
    setDemoFilled(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors(prev => ({ ...prev, password: '' }));
    setLoginError('');
    setDemoFilled(false);
  };

  // ── Role tab switch — clear form ──────────────────────────────────────────
  const handleRoleChange = (roleId) => {
    if (loading) return;           // don't switch while a request is running
    setSelectedRole(roleId);
    setEmail('');
    setPassword('');
    setErrors({});
    setLoginError('');
    setDemoFilled(false);
  };

  // ── Fill demo credentials (does NOT submit) ───────────────────────────────
  const fillDemo = useCallback((demoEmail, demoPassword) => {
    if (loading) return;
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    setLoginError('');
    setDemoFilled(true);
    toast.success('Demo credentials filled — click Sign In to continue', {
      id: 'demo-filled',       // deduplicate: same ID = replace existing toast
      duration: 3000
    });
  }, [loading]);

  // ── Form validation ───────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) && !/^[A-Za-z0-9]+$/.test(trimmedEmail)) {
      // Accept email addresses OR alphanumeric enrollment numbers (e.g. CSE2021001)
      newErrors.email = 'Please enter a valid email address or registration number.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit handler — ONE handler, ONE request, deduplication enforced ─────
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Gate 1: ref-based guard (survives re-renders)
    if (isSubmittingRef.current) return;

    // Gate 2: React state-based guard (extra safety for rapid double-clicks)
    if (loading) return;

    if (!validate()) return;

    // Acquire the lock
    isSubmittingRef.current = true;
    setLoading(true);
    setLoginError('');

    try {
      // Pass the selected UI role to backend for verification
      const loggedUser = await login(email.trim(), password, selectedRole);

      toast.success(`Welcome back, ${loggedUser.name || 'User'}!`, {
        id: 'login-success',
        icon: '🎉',
        duration: 4000
      });

      // Navigate to where the user was trying to go, or their role dashboard
      const from = location.state?.from || ROLE_REDIRECT[loggedUser.role] || '/';
      navigate(from, { replace: true });

    } catch (err) {
      const msg = getFriendlyError(err);
      setLoginError(msg);   // inline banner (always shown)

      // Toast only for 429 (rate limit) — all other errors shown inline only
      // Using toast ID to prevent duplicate stacking
      if (err?.response?.status === 429) {
        toast.error(msg, { id: 'login-error-429', duration: 8000 });
      }

    } finally {
      // Always release the lock, always re-enable the button
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const currentRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const extraDemos  = EXTRA_DEMOS[selectedRole] || [];

  return (
    <div className="login-root">
      {/* Left decorative panel */}
      <div className="login-panel-left" style={{ '--role-color': currentRole.color }}>
        <div className="login-left-content">
          <div className="login-left-logo">
            <GECMLogo size="large" showText={false} theme="dark" />
          </div>
          <div className="login-left-text">
            <div className="login-left-badge">GOVT OF BIHAR</div>
            <h1 className="login-left-title">GECM ACADEMICS</h1>
            <p className="login-left-subtitle">
              Government Engineering College, Madhubani
            </p>
            <p className="login-left-desc">
              Academic Management &amp; Student Services Portal
            </p>
          </div>

          <div className="login-left-features">
            <div className="login-feat">
              <span className="login-feat-icon">🎓</span>
              <span>Student Portal &amp; Dashboard</span>
            </div>
            <div className="login-feat">
              <span className="login-feat-icon">📊</span>
              <span>Attendance &amp; Results</span>
            </div>
            <div className="login-feat">
              <span className="login-feat-icon">📝</span>
              <span>Digital Gate Pass System</span>
            </div>
            <div className="login-feat">
              <span className="login-feat-icon">✅</span>
              <span>No-Dues &amp; Clearance Workflow</span>
            </div>
          </div>

          <div className="login-left-footer">
            Dept. of Science, Technology &amp; Technical Education
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-panel-right">
        <div className="login-form-wrapper">
          {/* Back to home */}
          <a href="/" className="login-back-link">
            ← Back to Portal
          </a>

          <div className="login-form-header">
            <h2 className="login-form-title">Sign In to Your Account</h2>
            <p className="login-form-subtitle">Select your role and enter your credentials</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="login-role-selector">
            {ROLES.map(role => (
              <button
                key={role.id}
                type="button"
                className={`login-role-btn ${selectedRole === role.id ? 'active' : ''}`}
                onClick={() => handleRoleChange(role.id)}
                disabled={loading}
                style={selectedRole === role.id ? {
                  borderColor: role.color,
                  background: role.bg,
                  color: role.color
                } : {}}
                aria-pressed={selectedRole === role.id}
              >
                <span className="login-role-icon">{role.icon}</span>
                <span className="login-role-label">{role.label}</span>
              </button>
            ))}
          </div>

          {/* Role description */}
          <div
            className="login-role-desc"
            style={{ color: currentRole.color, background: currentRole.bg, marginBottom: '16px' }}
          >
            <span>{currentRole.icon}</span>
            <span>{currentRole.desc}</span>
          </div>

          {/* Quick Demo section */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.72rem', fontWeight: 800, color: currentRole.color,
                background: currentRole.bg, padding: '2px 8px', borderRadius: '6px'
              }}>
                ⚡ QUICK DEMO
              </span>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                {currentRole.label} Credentials
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {/* Primary demo button */}
              <button
                type="button"
                onClick={() => fillDemo(currentRole.demo.email, currentRole.demo.password)}
                disabled={loading}
                title={`Email: ${currentRole.demo.email}\nPassword: ${currentRole.demo.password}\n${currentRole.demo.hint}`}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{currentRole.icon}</span>
                <span>{currentRole.demo.name} ({currentRole.demo.email})</span>
              </button>

              {/* Extra demos (HOD / Warden / Accounts) */}
              {extraDemos.map(d => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => fillDemo(d.email, d.password)}
                  disabled={loading}
                  title={`Email: ${d.email}\nPassword: ${d.password}\n${d.hint}`}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {d.label} ({d.email})
                </button>
              ))}
            </div>

            {/* Credential hint shown after demo fill */}
            {demoFilled && (
              <div style={{
                marginTop: '8px',
                padding: '6px 10px',
                background: currentRole.bg,
                borderRadius: '6px',
                fontSize: '0.74rem',
                color: currentRole.color,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>✅</span>
                <span>Demo credentials loaded. Click <strong>Sign In</strong> to continue.</span>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="login-form"
            autoComplete="on"
          >
            {/* Global Login Error Banner */}
            {loginError && (
              <div className="login-error-banner" role="alert" aria-live="assertive">
                <span className="login-error-icon">⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Email / Registration Number Field */}
            <div className={`login-field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="login-email" className="login-label">
                Email Address or Registration Number
              </label>
              <input
                id="login-email"
                type="text"
                className="login-input"
                placeholder="your.email@smartcampus.edu or CSE2021001"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
                disabled={loading}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span id="email-error" className="login-field-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className={`login-field ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="login-password" className="login-label">
                Password
              </label>
              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  disabled={loading}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="login-show-pass"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span id="password-error" className="login-field-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember me / Forgot password row */}
            <div className="login-helpers">
              <label className="login-remember">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <button
                type="button"
                className="login-forgot"
                onClick={() => toast.info(
                  'Password reset link will be sent to your registered email.',
                  { id: 'forgot-pwd', duration: 4000 }
                )}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button — disabled while loading to prevent duplicate requests */}
            <button
              id="login-submit-btn"
              type="submit"
              className="login-submit-btn"
              disabled={loading}
              aria-disabled={loading}
              aria-busy={loading}
              style={{ '--role-color': currentRole.color }}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Authenticating…
                </>
              ) : (
                <>
                  {currentRole.icon} Sign in as {currentRole.label}
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="login-footer-note">
            <span>🔒 Secure login — Government Engineering College, Madhubani</span>
          </div>
        </div>
      </div>
    </div>
  );
}
