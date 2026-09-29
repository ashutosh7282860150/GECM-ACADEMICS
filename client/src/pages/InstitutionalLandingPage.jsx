import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GECMLogo from '../components/GECMLogo';
import toast from 'react-hot-toast';

// Public asset
const campusImg = '/gecm_campus.jpg';

const ROLE_DEMOS = {
  student: [
    { email: 'student1@smartcampus.edu', password: 'password123', name: 'Arjun Patel', label: 'B.Tech CSE — Sem 7' },
    { email: 'student2@smartcampus.edu', password: 'password123', name: 'Priya Sharma', label: 'B.Tech ECE — Sem 5' }
  ],
  faculty: [
    { email: 'faculty1@smartcampus.edu', password: 'password123', name: 'Dr. Vikram Singh', label: 'Associate Prof (CSE)' },
    { email: 'faculty2@smartcampus.edu', password: 'password123', name: 'Prof. Anjali Roy', label: 'Assistant Prof (ECE)' }
  ],
  admin: [
    { email: 'admin@smartcampus.edu', password: 'password123', name: 'System Admin', label: 'Administrator' },
    { email: 'hod.cse@smartcampus.edu', password: 'password123', name: 'Dr. HOD CSE', label: 'HOD CSE' },
    { email: 'warden@smartcampus.edu', password: 'password123', name: 'Hostel Warden', label: 'Hostel Warden' },
    { email: 'accounts@smartcampus.edu', password: 'password123', name: 'Accounts Officer', label: 'Fee Cell' }
  ]
};

const NOTICES = [
  { 
    id: 1, 
    date: '27 SEP 2026', 
    title: 'B.Tech 7th Semester Mid-Term Examination Schedule Released', 
    dept: 'Examination Cell', 
    category: 'Exam',
    details: 'The mid-term examination for B.Tech 7th Semester students will commence from 10th October 2026. Students are requested to download hall tickets from the student dashboard after clearing dues.'
  },
  { 
    id: 2, 
    date: '25 SEP 2026', 
    title: 'Hostel Fee Payment & No-Dues Clearance Deadline Notice', 
    dept: 'Accounts & Hostel Cell', 
    category: 'Accounts',
    details: 'All hostellers must complete mess fee payments and online digital No-Dues clearance before 5th October 2026 to avoid penalty charges.'
  },
  { 
    id: 3, 
    date: '22 SEP 2026', 
    title: 'Registration for Campus Recruitment Drive 2026 (TCS / Infosys)', 
    dept: 'Training & Placement', 
    category: 'Placement',
    details: 'Training & Placement Cell invites applications for TCS NQT and Infosys Campus Drive 2026. Eligible branches: CSE, ECE, Civil (2027 Passing batch).'
  },
  { 
    id: 4, 
    date: '20 SEP 2026', 
    title: 'Circular regarding Mandatory 75% Attendance Requirement for End-Sem Exams', 
    dept: 'Academic Affairs', 
    category: 'Academic',
    details: 'As per AICTE & University norms, students falling short of 75% overall attendance will not be permitted to appear for end-semester practical and theory exams.'
  },
  { 
    id: 5, 
    date: '18 SEP 2026', 
    title: 'National Conference on Recent Advances in Engineering (NCRAE-2026)', 
    dept: 'R&D Cell', 
    category: 'Event',
    details: 'GECM Madhubani is hosting NCRAE-2026 on 15-16 November 2026. Paper submissions are open for faculty members, research scholars, and final-year students.'
  }
];

const ROLE_SERVICES_TABS = {
  student: [
    { icon: '📊', title: 'Attendance Records', desc: 'Track course attendance & 75% criteria', link: '/student/attendance' },
    { icon: '📝', title: 'Exams & Admit Card', desc: 'Download hall tickets & view datesheet', link: '/student/exams' },
    { icon: '🏆', title: 'Semester Results', desc: 'SGPA, CGPA & grade cards', link: '/student/results' },
    { icon: '💳', title: 'Fees & Receipts', desc: 'Tuition & hostel fee payments', link: '/student/fees' },
    { icon: '🚪', title: 'Digital Gate Pass', desc: 'Apply for campus outing pass', link: '/student/gatepass' },
    { icon: '✅', title: 'No-Dues Clearance', desc: 'Submit multi-department clearance', link: '/student/nodues' }
  ],
  faculty: [
    { icon: '📚', title: 'Courses & Syllabus', desc: 'Assigned semester teaching modules', link: '/faculty/courses' },
    { icon: '📋', title: 'Attendance Marking', desc: 'Daily lecture attendance entry', link: '/faculty/attendance' },
    { icon: '📝', title: 'Internal Marks Entry', desc: 'Mid-term & practical assessments', link: '/faculty/results' },
    { icon: '👥', title: 'Student Directory', desc: 'Class roll list & mentor groups', link: '/faculty/students' },
    { icon: '📩', title: 'Approvals Inbox', desc: 'Gate pass & no-dues requests', link: '/faculty/applications-inbox' }
  ],
  admin: [
    { icon: '🏛️', title: 'Department Oversight', desc: 'Branch-wise student & faculty rosters', link: '/admin/departments' },
    { icon: '👥', title: 'User Management', desc: 'Role permissions & account creation', link: '/admin/users' },
    { icon: '📋', title: 'Workflow Configuration', desc: 'Institutional approval sequences', link: '/admin/workflow-config' },
    { icon: '🛡️', title: 'System Audit Logs', desc: 'Login & transaction trail monitoring', link: '/admin/audit' }
  ]
};

const ALL_ACADEMIC_SERVICES = [
  { icon: '👤', title: 'Student Profile', desc: 'Personal & Academic Bio' },
  { icon: '📑', title: 'Course Registration', desc: 'Semester Subjects Enrollment' },
  { icon: '📊', title: 'Attendance', desc: 'Course Attendance Monitoring' },
  { icon: '📝', title: 'Examination', desc: 'Exam Schedules & Hall Tickets' },
  { icon: '🏆', title: 'Results', desc: 'SGPA / CGPA Grade Sheet' },
  { icon: '📅', title: 'Time Table', desc: 'Class & Exam Schedules' },
  { icon: '🗓️', title: 'Academic Calendar', desc: 'Semester Event Timetable' },
  { icon: '📢', title: 'Notices', desc: 'Official Circulars & Orders' },
  { icon: '📚', title: 'Assignments', desc: 'Digital Submissions & Notes' },
  { icon: '👨‍🏫', title: 'Faculty Directory', desc: 'Professors & Mentors' },
  { icon: '🏛️', title: 'Department Info', desc: 'CSE, ECE & Civil Programs' },
  { icon: '📜', title: 'Certificates', desc: 'Bonafide & Clearance' }
];

const ACADEMIC_INFO_CARDS = [
  {
    category: 'DEPARTMENTS',
    title: 'Academic Departments',
    desc: 'B.Tech degree programs in CSE, ECE, and Civil Engineering with modern labs.',
    meta: '3 Core Branches',
    linkText: 'View Details →',
    content: 'Department of Computer Science & Engineering (60 Seats)\nDepartment of Electronics & Communication Engineering (60 Seats)\nDepartment of Civil Engineering (60 Seats)\nAll programs feature modern laboratories, smart classrooms, and dedicated faculty.'
  },
  {
    category: 'COURSES',
    title: 'Degree & Curriculum',
    desc: 'AICTE and University prescribed course structure, semester syllabus, and electives.',
    meta: 'B.Tech Program',
    linkText: 'View Syllabus →',
    content: 'Comprehensive 8-semester B.Tech curriculum covering core engineering foundations, specialized electives, summer internships, and minor/major research projects.'
  },
  {
    category: 'CALENDAR',
    title: 'Academic Calendar',
    desc: 'Semester schedule, mid-term examinations, holidays, and university exams.',
    meta: 'Session 2026-27',
    linkText: 'Download Calendar →',
    content: 'Odd Semester Session: July to December 2026\nEven Semester Session: January to June 2027\nMid-Term Exams: October 2026\nEnd-Sem University Exams: December 2026'
  },
  {
    category: 'EXAMINATION',
    title: 'Examination Cell',
    desc: 'Conduct of exams, admit card issuance, and evaluation guidelines.',
    meta: 'Exam Services',
    linkText: 'Exam Guidelines →',
    content: 'The Examination Cell oversees question paper setting, hall ticket generation, invigilation duties, and grade card publication with strict security and confidentiality.'
  }
];

export default function InstitutionalLandingPage({ initialOpenLogin = false }) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [lang, setLang] = useState('EN');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(initialOpenLogin);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState('student');
  const [noticeCategory, setNoticeCategory] = useState('All');
  const [noticeSearch, setNoticeSearch] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [activeNoticeModal, setActiveNoticeModal] = useState(null);
  const [activeInfoModal, setActiveInfoModal] = useState(null);

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
      if (status === 429) {
        toast.error('Too many attempts. Please wait before trying again.', { duration: 6000 });
      } else if (status === 403) {
        toast.error(err.response?.data?.message || 'Access denied for the selected role.');
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const fillRoleDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password || 'password123');
    toast.success(`Loaded credentials for ${demo.name || demo.label}`);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (id.startsWith('#')) id = id.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToolClick = (tool) => {
    if (!user) {
      openRoleLogin(activePortalTab);
    } else {
      navigate(tool.link);
    }
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
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

  // Filtered Services
  const filteredServices = ALL_ACADEMIC_SERVICES.filter(s => 
    s.title.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  // Filtered Notices
  const filteredNotices = NOTICES.filter(n => {
    const matchesCategory = noticeCategory === 'All' || n.category.toLowerCase() === noticeCategory.toLowerCase();
    const matchesSearch = !noticeSearch || 
      n.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.dept.toLowerCase().includes(noticeSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>{isHi ? 'परिचय' : 'About'}</a>
            <span className="gov-divider">|</span>
            <a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>{isHi ? 'सूचना' : 'Notices'}</a>
            <span className="gov-divider">|</span>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>{isHi ? 'संपर्क' : 'Contact'}</a>
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
          <div className="gov-brand-left" onClick={() => scrollToSection('hero')}>
            <GECMLogo size="medium" showText={false} theme="light" />
            <div className="gov-brand-titles">
              <div className="gov-brand-main">GECM ACADEMICS</div>
              <div className="gov-brand-fullname">
                {isHi ? 'राजकीय इंजीनियरिंग कॉलेज, मधुबनी' : 'Government Engineering College, Madhubani'}
              </div>
              <div className="gov-brand-sub">
                {isHi ? 'अकादमिक प्रबंधन एवं छात्र सेवा पोर्टल' : 'Academic Management & Student Services Portal'}
              </div>
            </div>
          </div>

          <nav className="gov-nav-desktop">
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>{isHi ? 'होम' : 'Home'}</a>
            <a href="#portals" onClick={(e) => { e.preventDefault(); scrollToSection('portals'); }}>{isHi ? 'सेवाएं' : 'Portals'}</a>
            <a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>{isHi ? 'सूचनाएं' : 'Notices'}</a>
            <a href="#academics" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>{isHi ? 'अकादमिक' : 'Academics'}</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>{isHi ? 'संस्थान' : 'About'}</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>{isHi ? 'संपर्क' : 'Contact'}</a>

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
                          <span className="gov-dropdown-item-sub">Coursework &amp; Approvals</span>
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
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a>
            <a href="#portals" onClick={(e) => { e.preventDefault(); scrollToSection('portals'); }}>Portals</a>
            <a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>Notices</a>
            <a href="#academics" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>Academics</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>

            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {user ? (
                <>
                  <button className="gov-btn-primary w-full" onClick={() => { setMobileMenuOpen(false); navigate(getDashboardRoute()); }}>
                    Go to My Dashboard ({user.role.toUpperCase()}) →
                  </button>
                  <button
                    className="gov-btn-outline w-full"
                    style={{ color: '#dc2626', borderColor: '#ef4444' }}
                    onClick={() => { setMobileMenuOpen(false); logout(); toast.success('Signed out'); }}
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

      {/* 3. NOTICE TICKER */}
      <div className="gov-notice-ticker-bar">
        <div className="gov-container gov-notice-ticker-content">
          <span className="gov-notice-badge">NOTICE</span>
          <span className="gov-notice-text">
            📢 Admissions, examination schedules, academic notices and important campus circulars.
          </span>
          <a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }} className="gov-notice-link">
            View All Notices →
          </a>
        </div>
      </div>

      {/* 4. SIMPLE CLEAN HERO SECTION */}
      <section id="hero" className="gov-hero-simple">
        <div className="gov-container">
          <div className="gov-hero-grid">
            <div>
              <span className="gov-hero-badge-simple">
                🏛️ Government of Bihar • AICTE Approved
              </span>
              <h1 className="gov-hero-title-simple">GECM ACADEMICS</h1>
              <h2 className="gov-hero-subtitle-simple">Academic Management &amp; Student Services</h2>
              <p className="gov-hero-desc-simple">
                The centralized portal for students, faculty and administrators to access attendance records, examination schedules, results, digital gate pass, and campus circulars.
              </p>

              <div className="gov-hero-actions-simple">
                {user ? (
                  <button className="gov-btn-primary" onClick={() => navigate(getDashboardRoute())}>
                    Open My Dashboard ({user.role.toUpperCase()}) →
                  </button>
                ) : (
                  <>
                    <button className="gov-btn-primary" onClick={() => openRoleLogin('student')}>
                      Student Login →
                    </button>
                    <button className="gov-btn-outline" onClick={() => openRoleLogin('faculty')}>
                      Faculty Login
                    </button>
                    <button className="gov-btn-outline" onClick={() => openRoleLogin('admin')}>
                      Admin Login
                    </button>
                  </>
                )}
                <button className="gov-btn-outline" onClick={() => scrollToSection('portals')}>
                  Explore Services ↓
                </button>
              </div>
            </div>

            <div className="gov-hero-card-side">
              <img
                src={campusImg}
                alt="Government Engineering College Madhubani Campus"
                className="gov-hero-campus-img"
              />
              <div className="gov-hero-facts-list">
                <div className="gov-hero-fact-item">
                  <span>🏛️</span>
                  <span><strong>Institution:</strong> Govt. Engineering College, Madhubani</span>
                </div>
                <div className="gov-hero-fact-item">
                  <span>📍</span>
                  <span><strong>Location:</strong> Araria Sangram, Jhanjharpur, Bihar</span>
                </div>
                <div className="gov-hero-fact-item">
                  <span>🎓</span>
                  <span><strong>Programs:</strong> B.Tech in CSE, ECE, Civil Engineering</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE ROLE PORTAL SERVICES PANEL */}
      <section id="portals" className="gov-role-portal-tabs">
        <div className="gov-container">
          <div className="gov-tabs-nav">
            <button
              className={`gov-tab-btn ${activePortalTab === 'student' ? 'active' : ''}`}
              onClick={() => setActivePortalTab('student')}
            >
              🎓 Student Services
            </button>
            <button
              className={`gov-tab-btn ${activePortalTab === 'faculty' ? 'active' : ''}`}
              onClick={() => setActivePortalTab('faculty')}
            >
              👨‍🏫 Faculty Services
            </button>
            <button
              className={`gov-tab-btn ${activePortalTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActivePortalTab('admin')}
            >
              🏛️ Admin / Staff Services
            </button>
          </div>

          <div className="gov-tab-panel">
            <div className="gov-tab-panel-header">
              <div>
                <div className="gov-tab-panel-title">
                  {activePortalTab === 'student' && 'Student Academic & Campus Services'}
                  {activePortalTab === 'faculty' && 'Faculty Teaching & Assessment Portal'}
                  {activePortalTab === 'admin' && 'Administration & Institutional Oversight'}
                </div>
                <div className="gov-tab-panel-desc">
                  {activePortalTab === 'student' && 'Click any service below to open your dashboard or sign in.'}
                  {activePortalTab === 'faculty' && 'Manage courses, attendance records, and student clearance requests.'}
                  {activePortalTab === 'admin' && 'Configure system workflows, manage users, and review institutional logs.'}
                </div>
              </div>

              {!user && (
                <button
                  className="gov-btn-primary"
                  onClick={() => openRoleLogin(activePortalTab)}
                >
                  Sign In to {activePortalTab.toUpperCase()} Portal →
                </button>
              )}
            </div>

            <div className="gov-tab-tools-grid">
              {(ROLE_SERVICES_TABS[activePortalTab] || []).map((tool, idx) => (
                <div
                  key={idx}
                  className="gov-tool-btn"
                  onClick={() => handleToolClick(tool)}
                >
                  <span style={{ fontSize: '1.2rem' }}>{tool.icon}</span>
                  <div>
                    <div style={{ color: '#0b1d3a', fontWeight: 700 }}>{tool.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{tool.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE NOTICE BOARD */}
      <section id="notices" className="gov-section">
        <div className="gov-container">
          <div className="gov-section-header-flex">
            <div>
              <span className="gov-section-tag">OFFICIAL CIRCULARS</span>
              <h2 className="gov-section-title">Latest Campus Notices</h2>
              <p className="gov-section-desc">Search and filter official circulars from Examination, Academic, and Administrative cells</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search notices..."
                className="gov-form-input"
                style={{ width: '220px', padding: '6px 10px', fontSize: '0.82rem' }}
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="gov-notice-filter-pills">
            {['All', 'Exam', 'Accounts', 'Placement', 'Academic', 'Event'].map(cat => (
              <button 
                key={cat}
                className={`gov-filter-pill ${noticeCategory === cat ? 'active' : ''}`}
                onClick={() => setNoticeCategory(cat)}
              >
                {cat === 'All' ? 'All Notices' : cat}
              </button>
            ))}
          </div>

          <div className="gov-notices-list">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((n) => (
                <div key={n.id} className="gov-notice-card" onClick={() => setActiveNoticeModal(n)}>
                  <div className="gov-notice-date-box">
                    <span className="gov-notice-day">{n.date.split(' ')[0]}</span>
                    <span className="gov-notice-month">{n.date.split(' ')[1]} {n.date.split(' ')[2]}</span>
                  </div>
                  <div className="gov-notice-details">
                    <div className="gov-notice-meta">
                      <span className="gov-notice-tag">{n.category}</span>
                      <span className="gov-notice-dept">📍 {n.dept}</span>
                    </div>
                    <div className="gov-notice-item-title">{n.title}</div>
                  </div>
                  <button className="gov-btn-sm" onClick={(e) => { e.stopPropagation(); setActiveNoticeModal(n); }}>
                    View Circular →
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                No notices found matching your filter criteria.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. ALL ACADEMIC SERVICES (WITH LIVE SEARCH) */}
      <section id="services" className="gov-section gov-bg-light">
        <div className="gov-container">
          <div className="gov-section-header">
            <span className="gov-section-tag">SERVICES DIRECTORY</span>
            <h2 className="gov-section-title">Academic Services Directory</h2>
            <p className="gov-section-desc">Search through unified institutional services and modules</p>
          </div>

          {/* Live Search */}
          <div className="gov-service-search-box">
            <span className="gov-service-search-icon">🔍</span>
            <input 
              type="text" 
              className="gov-service-search-input" 
              placeholder="Search services (e.g., Attendance, Results, Fees, Gate Pass)..." 
              value={serviceSearchQuery}
              onChange={(e) => setServiceSearchQuery(e.target.value)}
            />
          </div>

          <div className="gov-services-grid">
            {filteredServices.map((svc, idx) => (
              <div 
                key={idx} 
                className="gov-service-item"
                onClick={() => {
                  if (!user) openRoleLogin('student');
                  else navigate(getDashboardRoute());
                }}
              >
                <div className="gov-service-icon-wrapper">{svc.icon}</div>
                <div>
                  <div className="gov-service-title">{svc.title}</div>
                  <div className="gov-service-desc">{svc.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ACADEMIC RESOURCES (DEPARTMENTS & SYLLABUS) */}
      <section id="academics" className="gov-section">
        <div className="gov-container">
          <div className="gov-section-header">
            <span className="gov-section-tag">CURRICULUM &amp; BRANCHES</span>
            <h2 className="gov-section-title">Academic Information</h2>
            <p className="gov-section-desc">Department programs, curriculum syllabus, calendar, and examination cell</p>
          </div>

          <div className="gov-academic-grid">
            {ACADEMIC_INFO_CARDS.map((card, idx) => (
              <div key={idx} className="gov-academic-card" onClick={() => setActiveInfoModal(card)}>
                <span className="gov-card-badge">{card.category}</span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <div className="gov-card-footer">
                  <span>{card.meta}</span>
                  <span className="gov-link">{card.linkText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. ABOUT INSTITUTION */}
      <section id="about" className="gov-section gov-bg-light">
        <div className="gov-container">
          <div className="gov-about-grid">
            <div>
              <span className="gov-section-tag">INSTITUTION OVERVIEW</span>
              <h2 className="gov-section-title">Government Engineering College, Madhubani</h2>
              <p className="gov-about-text">
                Government Engineering College, Madhubani (GECM) is a government technical institution under the Department of Science, Technology &amp; Technical Education, Government of Bihar.
              </p>
              <p className="gov-about-text">
                The institution offers AICTE-approved undergraduate B.Tech engineering programs across core disciplines, supported by digital academic workflows and modern laboratories.
              </p>

              <div className="gov-about-features">
                <div className="gov-feat-item">
                  <span className="gov-feat-icon">🏛️</span>
                  <div>
                    <strong>Govt. Technical College</strong>
                    <div style={{ color: '#64748b' }}>Dept. of Science &amp; Tech, Bihar</div>
                  </div>
                </div>
                <div className="gov-feat-item">
                  <span className="gov-feat-icon">⚡</span>
                  <div>
                    <strong>Digital ERP System</strong>
                    <div style={{ color: '#64748b' }}>Attendance, Gate Pass &amp; No-Dues</div>
                  </div>
                </div>
              </div>

              <div className="gov-about-actions">
                <button className="gov-btn-primary" onClick={() => openRoleLogin('student')}>
                  Student Portal Login
                </button>
                <button className="gov-btn-outline" onClick={() => scrollToSection('academics')}>
                  Explore Academic Programs
                </button>
              </div>
            </div>

            <div className="gov-about-image-side">
              <img
                src={campusImg}
                alt="Government Engineering College Madhubani Campus"
                className="gov-about-campus-img"
              />
              <div className="gov-about-img-caption">
                📍 GEC Madhubani Campus, Bihar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SIMPLE INSTITUTIONAL FOOTER */}
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
                <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a></li>
                <li><a href="#portals" onClick={(e) => { e.preventDefault(); scrollToSection('portals'); }}>Portals</a></li>
                <li><a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>Notices</a></li>
                <li><a href="#academics" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>Academics</a></li>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About GECM</a></li>
              </ul>
            </div>

            <div className="gov-footer-col">
              <h4 className="gov-footer-heading">Portals</h4>
              <ul className="gov-footer-links">
                <li><a href="#" onClick={(e) => { e.preventDefault(); openRoleLogin('student'); }}>Student Portal</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openRoleLogin('faculty'); }}>Faculty Portal</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openRoleLogin('admin'); }}>Admin Portal</a></li>
                <li><a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>Circulars &amp; Notices</a></li>
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

      {/* NOTICE DETAILS MODAL */}
      {activeNoticeModal && (
        <div className="gov-modal-overlay" onClick={() => setActiveNoticeModal(null)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="gov-modal-close" onClick={() => setActiveNoticeModal(null)}>✕</button>
            <div className="gov-modal-header">
              <span className="gov-notice-tag">{activeNoticeModal.category}</span>
              <h3 className="gov-modal-title">{activeNoticeModal.title}</h3>
              <p className="gov-modal-sub">Issued by: {activeNoticeModal.dept} | Date: {activeNoticeModal.date}</p>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, padding: '14px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              {activeNoticeModal.details}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button className="gov-btn-outline" onClick={() => { toast.success('Circular downloaded'); setActiveNoticeModal(null); }}>
                Download Notice
              </button>
              <button className="gov-btn-primary" onClick={() => setActiveNoticeModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC INFO MODAL */}
      {activeInfoModal && (
        <div className="gov-modal-overlay" onClick={() => setActiveInfoModal(null)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="gov-modal-close" onClick={() => setActiveInfoModal(null)}>✕</button>
            <div className="gov-modal-header">
              <span className="gov-card-badge">{activeInfoModal.category}</span>
              <h3 className="gov-modal-title">{activeInfoModal.title}</h3>
              <p className="gov-modal-sub">{activeInfoModal.meta}</p>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, padding: '14px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', whiteSpace: 'pre-line' }}>
              {activeInfoModal.content}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button className="gov-btn-primary" onClick={() => setActiveInfoModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAN INTERACTIVE LOGIN MODAL */}
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
                <label className="gov-form-label">Email / Registration Number</label>
                <input
                  type="email"
                  className="gov-form-input"
                  placeholder="Enter your Email or Registration No."
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
