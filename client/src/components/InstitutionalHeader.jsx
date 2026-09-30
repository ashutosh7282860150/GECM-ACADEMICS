import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GECMLogo from './GECMLogo';
import toast from 'react-hot-toast';

export default function InstitutionalHeader({ onOpenLoginModal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const dropdownRef = useRef(null);

  const isHi = lang === 'HI';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleLoginClick = (role) => {
    setLoginDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onOpenLoginModal) {
      onOpenLoginModal(role);
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* 1. TOP GOVERNMENT BAR */}
      <div className="gov-top-bar">
        <div className="gov-container gov-top-bar-content">
          <div className="gov-top-bar-left">
            <span className="gov-emblem-badge">{isHi ? 'बिहार सरकार' : 'GOVT OF BIHAR'}</span>
            <span className="gov-top-text">
              {isHi
                ? 'राजकीय इंजीनियरिंग कॉलेज, मधुबनी'
                : 'Government Engineering College, Madhubani'}
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

          {/* Desktop Nav */}
          <nav className="gov-nav-desktop">
            <NavLink to="/">{isHi ? 'होम' : 'Home'}</NavLink>
            <NavLink to="/services">{isHi ? 'सेवाएं' : 'Services'}</NavLink>
            <NavLink to="/notices">{isHi ? 'सूचनाएं' : 'Notices'}</NavLink>
            <NavLink to="/academics">{isHi ? 'अकादमिक' : 'Academics'}</NavLink>
            <NavLink to="/departments">{isHi ? 'विभाग' : 'Departments'}</NavLink>
            <NavLink to="/about">{isHi ? 'संस्थान' : 'About'}</NavLink>

            {/* Login / Dashboard Dropdown */}
            <div className="gov-nav-dropdown-wrapper" ref={dropdownRef}>
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
                        onClick={() => handleLoginClick('student')}
                      >
                        <span className="gov-dropdown-item-icon">🎓</span>
                        <div className="gov-dropdown-item-info">
                          <span className="gov-dropdown-item-label">Student Login</span>
                          <span className="gov-dropdown-item-sub">Access attendance, fees, exams</span>
                        </div>
                      </button>

                      <button
                        className="gov-dropdown-item"
                        onClick={() => handleLoginClick('faculty')}
                      >
                        <span className="gov-dropdown-item-icon">👨‍🏫</span>
                        <div className="gov-dropdown-item-info">
                          <span className="gov-dropdown-item-label">Faculty Login</span>
                          <span className="gov-dropdown-item-sub">Attendance &amp; student records</span>
                        </div>
                      </button>

                      <button
                        className="gov-dropdown-item"
                        onClick={() => handleLoginClick('admin')}
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

          {/* Hamburger for Mobile & Tablet */}
          <button
            className="gov-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile / Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="gov-nav-mobile">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/services" onClick={() => setMobileMenuOpen(false)}>Services</NavLink>
            <NavLink to="/notices" onClick={() => setMobileMenuOpen(false)}>Notices</NavLink>
            <NavLink to="/academics" onClick={() => setMobileMenuOpen(false)}>Academics</NavLink>
            <NavLink to="/departments" onClick={() => setMobileMenuOpen(false)}>Departments</NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</NavLink>

            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  <button className="gov-btn-primary w-full" onClick={() => handleLoginClick('student')}>
                    🎓 Student Login
                  </button>
                  <button className="gov-btn-outline w-full" onClick={() => handleLoginClick('faculty')}>
                    👨‍🏫 Faculty Login
                  </button>
                  <button className="gov-btn-outline w-full" onClick={() => handleLoginClick('admin')}>
                    🏛️ Admin Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
