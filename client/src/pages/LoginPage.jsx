import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import GECMLogo from '../components/GECMLogo';
import './LoginPage.css';

// ─────────────────────────────────────────────
// Role configuration
// ─────────────────────────────────────────────
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
      password: 'password123',
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
      password: 'password123',
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
      password: 'password123',
      name: 'Dr. Ramesh Kumar',
      hint: 'System Administrator'
    }
  }
];

// Extra demo accounts (warden, accounts, hod) shown only under Administrator role
const EXTRA_DEMOS = {
  administrator: [
    {
      email: 'hod.cse@smartcampus.edu',
      password: 'password123',
      label: 'HOD',
      hint: 'Head of Dept — CSE'
    },
    {
      email: 'warden@smartcampus.edu',
      password: 'password123',
      label: 'Warden',
      hint: 'Hostel Admin'
    },
    {
      email: 'accounts@smartcampus.edu',
      password: 'password123',
      label: 'Accounts',
      hint: 'Fee Cell'
    }
  ]
};

// Map role UI → backend role(s) accepted
const ROLE_REDIRECT = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  hod: '/faculty/dashboard',
  warden: '/warden/dashboard',
  accounts: '/accounts/dashboard',
  admin: '/admin/dashboard',
};

// ─────────────────────────────────────────────
// Error messages (user-facing, safe)
// ─────────────────────────────────────────────
function getFriendlyError(err) {
  const status = err?.response?.status;
  const msg = err?.response?.data?.message;

  if (!err?.response) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  if (status === 400) return msg || 'Please check the information you entered.';
  if (status === 401) return 'Incorrect email or password. Please try again.';
  if (status === 403) return msg || 'You do not have permission to access this role.';
  if (status === 429) {
    const retry = err?.response?.data?.retryAfter;
    return `Too many login attempts. Please wait ${retry || 15} minutes before trying again.`;
  }
  if (status >= 500) return 'A server error occurred. Please try again in a moment.';
  return msg || 'Login failed. Please try again.';
}

// ─────────────────────────────────────────────
// Main Login Page Component
// ─────────────────────────────────────────────
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [demoFilled, setDemoFilled] = useState(false);

  // Prevent duplicate submissions
  const isSubmittingRef = useRef(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const dest = ROLE_REDIRECT[user.role] || '/';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  // Clear errors when user types
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

  // Switch role tab — clears form (do NOT auto-fill credentials)
  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setEmail('');
    setPassword('');
    setErrors({});
    setLoginError('');
    setDemoFilled(false);
  };

  // Fill demo credentials (does NOT submit)
  const fillDemo = useCallback((demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    setLoginError('');
    setDemoFilled(true);
    toast.success('Demo credentials filled — click Login to continue', { duration: 3000 });
  }, []);

  // Validate form
  const validate = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double-click / duplicate submissions
    if (isSubmittingRef.current || loading) return;

    if (!validate()) return;

    isSubmittingRef.current = true;
    setLoading(true);
    setLoginError('');

    try {
      // Pass the selected UI role to backend for verification
      const loggedUser = await login(email.trim(), password, selectedRole);

      toast.success(`Welcome back, ${loggedUser.name}!`, {
        icon: '🎉',
        duration: 4000
      });

      // Redirect to the role-specific dashboard
      const from = location.state?.from || ROLE_REDIRECT[loggedUser.role] || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = getFriendlyError(err);
      setLoginError(msg);

      // Only show toast for 429 (rate limit) — others are shown inline
      if (err?.response?.status === 429) {
        toast.error(msg, { duration: 6000 });
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const currentRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const extraDemos = EXTRA_DEMOS[selectedRole] || [];

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

          {/* Role Selector */}
          <div className="login-role-selector">
            {ROLES.map(role => (
              <button
                key={role.id}
                type="button"
                className={`login-role-btn ${selectedRole === role.id ? 'active' : ''}`}
                onClick={() => handleRoleChange(role.id)}
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
          <div className="login-role-desc" style={{ color: currentRole.color, background: currentRole.bg }}>
            <span>{currentRole.icon}</span>
            <span>{currentRole.desc}</span>
          </div>

          {/* Demo Credentials Box */}
          <div className="login-demo-box">
            <div className="login-demo-header">
              <span className="login-demo-badge">🧪 DEMO</span>
              <span className="login-demo-title">Development Credentials</span>
            </div>
            <div className="login-demo-card">
              <div className="login-demo-info">
                <div className="login-demo-name">
                  {currentRole.icon} {currentRole.demo.name}
                </div>
                <div className="login-demo-hint">{currentRole.demo.hint}</div>
                <div className="login-demo-creds">
                  <span className="login-demo-cred-item">
                    <strong>Email:</strong> {currentRole.demo.email}
                  </span>
                  <span className="login-demo-cred-item">
                    <strong>Password:</strong> password123
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="login-demo-fill-btn"
                onClick={() => fillDemo(currentRole.demo.email, currentRole.demo.password)}
                disabled={loading}
              >
                Use Demo
              </button>
            </div>

            {/* Extra demos for administrator role */}
            {extraDemos.length > 0 && (
              <div className="login-extra-demos">
                <div className="login-extra-demos-label">Other staff roles:</div>
                <div className="login-extra-demos-pills">
                  {extraDemos.map(d => (
                    <button
                      key={d.email}
                      type="button"
                      className="login-extra-pill"
                      onClick={() => fillDemo(d.email, d.password)}
                      disabled={loading}
                      title={d.hint}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Demo filled indicator */}
          {demoFilled && (
            <div className="login-demo-filled-notice">
              ✅ Demo credentials filled. Review and click <strong>Login</strong>.
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="login-form"
            autoComplete="on"
          >
            {/* Global Login Error */}
            {loginError && (
              <div className="login-error-banner" role="alert">
                <span className="login-error-icon">⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className={`login-field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="login-email" className="login-label">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="your.email@smartcampus.edu"
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

            {/* Helpers row */}
            <div className="login-helpers">
              <label className="login-remember">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <button
                type="button"
                className="login-forgot"
                onClick={() => toast.info('Password reset link will be sent to your registered email.', { duration: 4000 })}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="login-submit-btn"
              disabled={loading}
              style={{ '--role-color': currentRole.color }}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Authenticating...
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
