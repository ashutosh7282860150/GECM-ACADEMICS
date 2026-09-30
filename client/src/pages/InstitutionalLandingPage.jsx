import { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GECMLogo from '../components/GECMLogo';
import toast from 'react-hot-toast';

const ROLE_DEMOS = {
  student: [
    { email: 'student1@smartcampus.edu', password: 'Student@123', name: 'Arjun Patel',  label: 'B.Tech CSE — Sem 7' },
    { email: 'student2@smartcampus.edu', password: 'Student@123', name: 'Priya Sharma', label: 'B.Tech ECE — Sem 5' }
  ],
  faculty: [
    { email: 'faculty1@smartcampus.edu', password: 'Faculty@123', name: 'Dr. Vikram Singh', label: 'Associate Prof (CSE)' },
    { email: 'faculty2@smartcampus.edu', password: 'Faculty@123', name: 'Dr. Kavitha Rao',  label: 'Assistant Prof (ECE)' }
  ],
  admin: [
    { email: 'admin@smartcampus.edu',    password: 'Admin@123', name: 'Dr. Ramesh Kumar',  label: 'Administrator' },
    { email: 'hod.cse@smartcampus.edu', password: 'Admin@123', name: 'Prof. Anita Sharma', label: 'HOD CSE' },
    { email: 'warden@smartcampus.edu',   password: 'Admin@123', name: 'Mr. Suresh Patel',  label: 'Hostel Warden' },
    { email: 'accounts@smartcampus.edu', password: 'Admin@123', name: 'Mrs. Priya Mehta',  label: 'Fee Cell' }
  ]
};

export default function InstitutionalLandingPage({ initialOpenLogin = false }) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [lang, setLang] = useState('EN');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(initialOpenLogin);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const loginDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openRoleLogin = (roleName) => {
    setSelectedRole(roleName);
    setShowLoginModal(true);
    setLoginDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password, selectedRole);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      setShowLoginModal(false);
      
      const ROLE_REDIRECT = {
        student: '/student/dashboard',
        faculty: '/faculty/dashboard',
        hod: '/faculty/dashboard',
        warden: '/warden/dashboard',
        accounts: '/accounts/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(ROLE_REDIRECT[loggedUser.role] || '/student/dashboard');
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      // Use toast IDs to prevent duplicate toasts from double-clicks or retries
      if (!err?.response) {
        toast.error('Unable to reach the server. Please check your connection.', { id: 'landing-login-err', duration: 5000 });
      } else if (status === 401) {
        toast.error('Incorrect email/registration number or password.', { id: 'landing-login-err', duration: 4000 });
      } else if (status === 403) {
        toast.error(msg || 'Access denied. Please select the correct role tab.', { id: 'landing-login-err', duration: 5000 });
      } else if (status === 429) {
        toast.error('Too many attempts. Please wait before trying again.', { id: 'landing-login-err', duration: 8000 });
      } else if (status >= 500) {
        toast.error('Server error. Please try again in a moment.', { id: 'landing-login-err', duration: 5000 });
      } else {
        toast.error(msg || 'Login failed. Please try again.', { id: 'landing-login-err', duration: 4000 });
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const fillRoleDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    // Use toast ID so rapid clicks don't stack multiple toasts
    toast.success(`Demo credentials loaded — click Sign In to continue`, {
      id: 'demo-filled',
      duration: 3000
    });
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    const ROLE_REDIRECT = {
      student: '/student/dashboard',
      faculty: '/faculty/dashboard',
      hod: '/faculty/dashboard',
      warden: '/warden/dashboard',
      accounts: '/accounts/dashboard',
      admin: '/admin/dashboard',
    };
    return ROLE_REDIRECT[user.role] || '/student/dashboard';
  };

  const isHi = lang === 'HI';

  return (
    <div className="gov-landing-container">
      {/* 1. TOP GOVERNMENT BAR */}
      <div className="gov-top-bar">
        <div className="gov-container gov-top-bar-content">
          <div className="gov-top-bar-left">
            <span className="gov-emblem-badge">{isHi ? 'बिहार सरकार' : 'GOVT OF BIHAR'}</span>
            <span className="gov-top-text">
              {isHi
                ? 'राजकीय इंजीनियरिंग कॉलेज, मधुबनी | विज्ञान, प्रौद्योगिकी एवं तकनीकी शिक्षा विभाग'
                : 'Government Engineering College, Madhubani | Dept. of Science & Technology, Bihar'}
            </span>
          </div>
          <div className="gov-top-bar-right">
            <NavLink to="/about">{isHi ? 'परिचय' : 'About'}</NavLink>
            <span className="gov-divider">|</span>
            <NavLink to="/notices">{isHi ? 'सूचना' : 'Notices'}</NavLink>
            <span className="gov-divider">|</span>
            <NavLink to="/departments">{isHi ? 'विभाग' : 'Departments'}</NavLink>
            <span className="gov-divider">|</span>
            <button 
              className="gov-lang-toggle"
              onClick={() => setLang(isHi ? 'EN' : 'HI')}
            >
              🌐 {isHi ? 'English' : 'हिन्दी'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="gov-header">
        <div className="gov-container gov-header-content">
          <NavLink to="/" className="gov-brand-left" style={{ textDecoration: 'none' }}>
            <GECMLogo size="medium" showText={false} theme="light" />
            <div className="gov-brand-titles">
              <div className="gov-brand-main">GECM ACADEMICS</div>
              <div className="gov-brand-fullname">
                {isHi ? 'राजकीय इंजीनियरिंग कॉलेज, मधुबनी' : 'Government Engineering College, Madhubani'}
              </div>
              <div className="gov-brand-sub">
                {isHi ? 'अकादमिक प्रबंधन एवं डिजिटल सेवा पोर्टल' : 'Academic Management & Digital Services Portal'}
              </div>
            </div>
          </NavLink>

          <nav className="gov-nav-desktop">
            <NavLink to="/">{isHi ? 'होम' : 'Home'}</NavLink>
            <NavLink to="/services">{isHi ? 'सेवाएं' : 'Services'}</NavLink>
            <NavLink to="/notices">{isHi ? 'सूचनाएं' : 'Notices'}</NavLink>
            <NavLink to="/academics">{isHi ? 'अकादमिक' : 'Academics'}</NavLink>
            <NavLink to="/departments">{isHi ? 'विभाग' : 'Departments'}</NavLink>
            <NavLink to="/about">{isHi ? 'संस्थान' : 'About'}</NavLink>

            {/* Login / Dashboard Dropdown */}
            <div className="gov-nav-dropdown-wrapper" ref={loginDropdownRef}>
              {user ? (
                <button
                  className="gov-btn-primary"
                  onClick={() => setLoginDropdownOpen(prev => !prev)}
                >
                  Dashboard ({user.role.toUpperCase()}) ▾
                </button>
              ) : (
                <button
                  className="gov-btn-primary"
                  onClick={() => setLoginDropdownOpen(prev => !prev)}
                >
                  {isHi ? 'पोर्टल लॉगिन ▾' : 'Login / Dashboard ▾'}
                </button>
              )}

              {loginDropdownOpen && (
                <div className="gov-nav-dropdown-menu">
                  {user ? (
                    <>
                      <div className="gov-dropdown-user-header">
                        <div className="gov-dropdown-user-name">
                          <span>{user.name}</span>
                          <span className="gov-dropdown-user-role">{user.role}</span>
                        </div>
                        <div className="gov-dropdown-user-email">{user.email}</div>
                      </div>

                      <div className="gov-dropdown-section-title">Dashboards</div>

                      <button
                        className="gov-dropdown-item"
                        onClick={() => { setLoginDropdownOpen(false); navigate('/student/dashboard'); }}
                      >
                        <span className="gov-dropdown-item-icon">🎓</span>
                        <div className="gov-dropdown-item-info">
                          <span className="gov-dropdown-item-label">Student Dashboard</span>
                          <span className="gov-dropdown-item-sub">Attendance, Results &amp; Gate Pass</span>
                        </div>
                      </button>

                      <button
                        className="gov-dropdown-item"
                        onClick={() => { setLoginDropdownOpen(false); navigate('/faculty/dashboard'); }}
                      >
                        <span className="gov-dropdown-item-icon">👨‍🏫</span>
                        <div className="gov-dropdown-item-info">
                          <span className="gov-dropdown-item-label">Faculty Dashboard</span>
                          <span className="gov-dropdown-item-sub">Coursework &amp; Marks</span>
                        </div>
                      </button>

                      <button
                        className="gov-dropdown-item"
                        onClick={() => { setLoginDropdownOpen(false); navigate('/admin/dashboard'); }}
                      >
                        <span className="gov-dropdown-item-icon">🏛️</span>
                        <div className="gov-dropdown-item-info">
                          <span className="gov-dropdown-item-label">Admin Dashboard</span>
                          <span className="gov-dropdown-item-sub">Institutional Management</span>
                        </div>
                      </button>

                      <div className="gov-dropdown-divider" />

                      <button
                        className="gov-dropdown-item logout"
                        onClick={() => {
                          setLoginDropdownOpen(false);
                          logout();
                          navigate('/');
                          toast.success('Signed out successfully');
                        }}
                      >
                        <span className="gov-dropdown-item-icon">🚪</span>
                        <span className="gov-dropdown-item-label" style={{ color: '#dc2626' }}>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="gov-dropdown-section-title">Select Portal</div>

                      <button
                        className="gov-dropdown-item"
                        onClick={() => openRoleLogin('student')}
                      >
                        <span className="gov-dropdown-item-icon">🎓</span>
                        <div className="gov-dropdown-item-info">
                          <span className="gov-dropdown-item-label">Student Login</span>
                          <span className="gov-dropdown-item-sub">Access attendance, fees, exams</span>
                        </div>
                      </button>

                      <button
                        className="gov-dropdown-item"
                        onClick={() => openRoleLogin('faculty')}
                      >
                        <span className="gov-dropdown-item-icon">👨‍🏫</span>
                        <div className="gov-dropdown-item-info">
                          <span className="gov-dropdown-item-label">Faculty Login</span>
                          <span className="gov-dropdown-item-sub">Attendance &amp; student records</span>
                        </div>
                      </button>

                      <button
                        className="gov-dropdown-item"
                        onClick={() => openRoleLogin('admin')}
                      >
                        <span className="gov-dropdown-item-icon">🏛️</span>
                        <div className="gov-dropdown-item-info">
                          <span className="gov-dropdown-item-label">Admin Login</span>
                          <span className="gov-dropdown-item-sub">Campus administrative access</span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>

          <button className="gov-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="gov-nav-mobile">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/services" onClick={() => setMobileMenuOpen(false)}>Services</NavLink>
            <NavLink to="/notices" onClick={() => setMobileMenuOpen(false)}>Notices</NavLink>
            <NavLink to="/academics" onClick={() => setMobileMenuOpen(false)}>Academics</NavLink>
            <NavLink to="/departments" onClick={() => setMobileMenuOpen(false)}>Departments</NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</NavLink>

            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {user ? (
                <>
                  <button className="gov-btn-primary w-full" onClick={() => { setMobileMenuOpen(false); navigate(getDashboardRoute()); }}>
                    Go to My Dashboard ({user.role.toUpperCase()}) →
                  </button>
                  <button
                    className="gov-btn-outline w-full"
                    style={{ color: '#dc2626', borderColor: '#ef4444' }}
                    onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); toast.success('Signed out'); }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button className="gov-btn-primary w-full" onClick={() => openRoleLogin('student')}>
                    🎓 Student Login
                  </button>
                  <button className="gov-btn-outline w-full" onClick={() => openRoleLogin('faculty')}>
                    👨‍🏫 Faculty Login
                  </button>
                  <button className="gov-btn-outline w-full" onClick={() => openRoleLogin('admin')}>
                    🏛️ Admin Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN CONTENT WITH FULL CAMPUS BACKGROUND BETWEEN HEADER & FOOTER */}
      <main className="gov-main-backdrop">
        {/* NOTICE TICKER */}
        <div className="gov-notice-ticker-bar">
          <div className="gov-container gov-notice-ticker-content">
            <span className="gov-notice-badge">NOTICE</span>
            <span className="gov-notice-text">
              📢 Admissions, examination schedules, academic notices and important campus circulars.
            </span>
            <NavLink to="/notices" className="gov-notice-link">
              View All Notices →
            </NavLink>
          </div>
        </div>

        {/* HERO SECTION */}
        <section id="hero" className="gov-hero-simple">
          <div className="gov-container">
            <div className="gov-hero-center-box">
              <span className="gov-hero-badge-simple">
                🏛️ Government of Bihar • AICTE Approved
              </span>
              <h1 className="gov-hero-title-simple">GECM ACADEMICS</h1>
              <h2 className="gov-hero-subtitle-simple">Academic Management &amp; Student Services</h2>
              <p className="gov-hero-desc-simple">
                The centralized digital portal for students, faculty and administrators of Government Engineering College, Madhubani. Access attendance records, examination schedules, grade sheets, digital gate pass, and campus circulars.
              </p>

              <div className="gov-hero-actions-simple">
                {user ? (
                  <button className="gov-btn-primary" onClick={() => navigate(getDashboardRoute())}>
                    Open My Dashboard ({user.role.toUpperCase()}) →
                  </button>
                ) : (
                  <>
                    <button className="gov-btn-primary" onClick={() => openRoleLogin('student')}>
                      🎓 Student Login →
                    </button>
                    <button className="gov-btn-outline" onClick={() => openRoleLogin('faculty')}>
                      👨‍🏫 Faculty Login
                    </button>
                    <button className="gov-btn-outline" onClick={() => openRoleLogin('admin')}>
                      🏛️ Admin Login
                    </button>
                  </>
                )}
                <NavLink to="/services" className="gov-btn-outline">
                  Explore Services →
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. SIMPLE INSTITUTIONAL FOOTER */}
      <footer id="contact" className="gov-footer">
        <div className="gov-container">
          <div className="gov-footer-grid">
            <div className="gov-footer-col">
              <div className="gov-footer-title">GECM ACADEMICS</div>
              <div className="gov-footer-subtitle">Government Engineering College, Madhubani</div>
              <p className="gov-footer-desc">
                Official Academic Management &amp; Student Services Portal of Government Engineering College, Madhubani (Dept. of Science, Technology &amp; Technical Education, Govt. of Bihar).
              </p>
            </div>

            <div className="gov-footer-col">
              <h4 className="gov-footer-heading">Quick Links</h4>
              <ul className="gov-footer-links">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/services">Services Directory</NavLink></li>
                <li><NavLink to="/notices">Official Notices</NavLink></li>
                <li><NavLink to="/academics">Academics &amp; Syllabus</NavLink></li>
                <li><NavLink to="/departments">Departments</NavLink></li>
                <li><NavLink to="/about">About GECM</NavLink></li>
              </ul>
            </div>

            <div className="gov-footer-col">
              <h4 className="gov-footer-heading">Portals</h4>
              <ul className="gov-footer-links">
                <li><a href="#" onClick={(e) => { e.preventDefault(); openRoleLogin('student'); }}>Student Portal</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openRoleLogin('faculty'); }}>Faculty Portal</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openRoleLogin('admin'); }}>Admin Portal</a></li>
                <li><NavLink to="/notices">Circulars &amp; Orders</NavLink></li>
              </ul>
            </div>

            <div className="gov-footer-col">
              <h4 className="gov-footer-heading">Contact Details</h4>
              <div className="gov-footer-contact">
                <p>📍 GEC Madhubani Campus, Araria Sangram, Jhanjharpur, Madhubani, Bihar - 847211</p>
                <p>📧 principal@gecmadhubani.ac.in</p>
                <p>📞 +91 612 2221234</p>
                <p>🌐 gecmadhubani.ac.in</p>
              </div>
            </div>
          </div>

          <div className="gov-footer-bottom">
            <p>© 2026 Government Engineering College, Madhubani. All Rights Reserved.</p>
            <span>Dept. of Science, Technology &amp; Technical Education, Govt. of Bihar</span>
          </div>
        </div>
      </footer>

      {/* 7. CLEAN INTERACTIVE LOGIN MODAL */}
      {showLoginModal && (
        <div className="gov-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="gov-modal-close" onClick={() => setShowLoginModal(false)}>✕</button>

            <div className="gov-modal-header">
              <GECMLogo size="medium" showText={false} theme="light" />
              <h3 className="gov-modal-title">Student / Faculty Login</h3>
              <p className="gov-modal-sub">Government Engineering College, Madhubani</p>
            </div>

            {/* Role Options */}
            <div className="gov-role-tabs">
              {[
                { role: 'student', label: 'Student' },
                { role: 'faculty', label: 'Faculty' },
                { role: 'admin', label: 'Administrator' }
              ].map(r => (
                <button
                  key={r.role}
                  type="button"
                  className={`gov-role-tab ${selectedRole === r.role ? 'active' : ''}`}
                  onClick={() => setSelectedRole(r.role)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Role-Specific Quick Demo Accounts */}
            <div className="gov-role-demo-banner">
              <div className="gov-role-demo-header">
                <span className="gov-role-demo-badge">⚡ QUICK DEMO</span>
                <span className="gov-role-demo-title">
                  {selectedRole === 'student' && 'Student Accounts'}
                  {selectedRole === 'faculty' && 'Faculty Accounts'}
                  {selectedRole === 'admin' && 'Admin & Staff Accounts'}
                </span>
              </div>
              <div className="gov-role-demo-actions">
                {(ROLE_DEMOS[selectedRole] || []).map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="gov-role-demo-btn"
                    onClick={() => fillRoleDemo(demo)}
                  >
                    <span>{selectedRole === 'student' ? '🎓' : selectedRole === 'faculty' ? '👨‍🏫' : '🏛️'}</span>
                    <span>{demo.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="gov-modal-form">
              <div className="gov-form-group">
                <label className="gov-form-label">Email or Registration Number</label>
                <input
                  type="text"
                  className="gov-form-input"
                  placeholder="e.g. student1@smartcampus.edu or CSE2021001"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="gov-form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                      color: '#64748b'
                    }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="gov-form-footer">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569' }}>
                  <input type="checkbox" defaultChecked /> Remember me
                </label>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); toast.info('Password reset instructions sent to your email.'); }} 
                  style={{ fontSize: '0.8rem', color: '#0b1d3a', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="gov-btn-primary w-full" disabled={loading} style={{ marginTop: '12px', padding: '10px', justifyContent: 'center' }}>
                {loading ? 'Authenticating...' : 'Sign In →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
