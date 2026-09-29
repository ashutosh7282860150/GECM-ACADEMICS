import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GECMLogo from '../components/GECMLogo';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { role: 'student', email: 'student1@smartcampus.edu', label: 'Student', desc: 'B.Tech CSE' },
  { role: 'faculty', email: 'faculty1@smartcampus.edu', label: 'Faculty', desc: 'CSE Dept' },
  { role: 'admin', email: 'admin@smartcampus.edu', label: 'Administrator', desc: 'System Admin' },
  { role: 'hod', email: 'hod.cse@smartcampus.edu', label: 'HOD', desc: 'HOD CSE' },
  { role: 'warden', email: 'warden@smartcampus.edu', label: 'Warden', desc: 'Hostel Admin' },
  { role: 'accounts', email: 'accounts@smartcampus.edu', label: 'Accounts', desc: 'Fee Cell' }
];

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

const QUICK_SERVICES = [
  { icon: '🎓', title: 'STUDENT PORTAL', desc: 'Student Dashboard & Records', link: '/student/dashboard' },
  { icon: '📚', title: 'ACADEMICS', desc: 'Courses & Departments', link: '#academics' },
  { icon: '📝', title: 'EXAMINATION', desc: 'Exam & Results Services', link: '/student/exams' },
  { icon: '📢', title: 'NOTICE BOARD', desc: 'Latest Campus Notices', link: '#notices' },
  { icon: '📋', title: 'ATTENDANCE', desc: 'Attendance Records', link: '/student/attendance' },
  { icon: '👨‍🏫', title: 'FACULTY', desc: 'Faculty Portal & Scheduling', link: '/faculty/dashboard' }
];

const ACADEMIC_SERVICES = [
  { icon: '👤', title: 'Student Profile', desc: 'Personal & Academic Bio' },
  { icon: '📑', title: 'Course Registration', desc: 'Semester Subjects Enrollment' },
  { icon: '📊', title: 'Attendance', desc: 'Course Attendance Monitoring' },
  { icon: '📝', title: 'Examination', desc: 'Exam Schedules & Hall Tickets' },
  { icon: '🏆', title: 'Results', desc: 'SGPA / CGPA Grade Sheet' },
  { icon: '📅', title: 'Time Table', desc: 'Class & Exam Schedules' },
  { icon: '🗓️', title: 'Academic Calendar', desc: 'Semester Event Timetable' },
  { icon: '📢', title: 'Notices', desc: 'Official Circulars & Orders' },
  { icon: '📚', title: 'Assignments', desc: 'Digital Submissions & Notes' },
  { icon: '👨‍🏫', title: 'Faculty Information', desc: 'Professors & Mentors Directory' },
  { icon: '🏛️', title: 'Department Information', desc: 'CSE, ECE & Civil Programs' },
  { icon: '📜', title: 'Certificates', desc: 'Bonafide & Clearance Verification' }
];

const ACADEMIC_INFO_CARDS = [
  {
    category: 'DEPARTMENTS',
    title: 'Academic Departments',
    desc: 'B.Tech degree programs in Computer Science & Engineering, Electronics & Communication, and Civil Engineering.',
    meta: '3 Core Departments',
    linkText: 'Explore Departments →',
    content: 'Department of Computer Science & Engineering (60 Seats)\nDepartment of Electronics & Communication Engineering (60 Seats)\nDepartment of Civil Engineering (60 Seats)\nAll programs feature modern labs, smart classrooms, and dedicated faculty.'
  },
  {
    category: 'COURSES',
    title: 'Degree & Curriculum',
    desc: 'AICTE and University prescribed course structures, semester syllabi, elective subjects, and lab manuals.',
    meta: 'B.Tech Program',
    linkText: 'View Syllabus →',
    content: 'Comprehensive 8-semester B.Tech curriculum covering core engineering foundations, specialized electives, summer internships, and minor/major research projects.'
  },
  {
    category: 'FACULTY',
    title: 'Faculty Members',
    desc: 'Experienced academic faculty and research mentors across specialized technical disciplines.',
    meta: 'Qualified Faculty',
    linkText: 'Faculty Directory →',
    content: 'Our faculty members hold advanced degrees from premier institutions (IITs, NITs, Central Universities) with active publications in IEEE and Springer journals.'
  },
  {
    category: 'CALENDAR',
    title: 'Academic Calendar',
    desc: 'Schedule of semester commencement, mid-term examinations, sports events, holidays, and end-sem exams.',
    meta: 'Session 2026-27',
    linkText: 'Download Calendar →',
    content: 'Odd Semester Session: July to December 2026\nEven Semester Session: January to June 2027\nMid-Term Exams: October 2026\nEnd-Sem University Exams: December 2026'
  },
  {
    category: 'EXAMINATION',
    title: 'Examination Cell',
    desc: 'Conduct of semester mid-term & end-term exams, admit card issuance, and answer sheet evaluation.',
    meta: 'Exam Services',
    linkText: 'Exam Guidelines →',
    content: 'The Examination Cell oversees question paper setting, hall ticket generation, invigilation duties, and grade card publication with strict security and confidentiality.'
  },
  {
    category: 'RESULTS',
    title: 'Semester Results',
    desc: 'Official publication of semester grade sheets, credit summaries, and CGPA performance reports.',
    meta: 'Online Verification',
    linkText: 'Check Results →',
    content: 'Students can securely view semester grade sheets, SGPA/CGPA calculations, and request re-evaluation or transcript issuance online.'
  }
];

export default function InstitutionalLandingPage({ initialOpenLogin = false }) {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [lang, setLang] = useState('EN');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(initialOpenLogin);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Interactive Notice Filter & Search States
  const [noticeCategory, setNoticeCategory] = useState('All');
  const [activeNoticeModal, setActiveNoticeModal] = useState(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [activeInfoModal, setActiveInfoModal] = useState(null);
  
  // Login modal form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (initialOpenLogin) {
      setShowLoginModal(true);
    }

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialOpenLogin]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return; // prevent double-submit
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

  const fillDemoAccount = (acc) => {
    setEmail(acc.email);
    setPassword('password123');
    setSelectedRole(acc.role);
    toast.success(`Selected ${acc.label} credentials`);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (id.startsWith('#')) id = id.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCardClick = (link) => {
    if (link.startsWith('#')) {
      scrollToSection(link);
    } else {
      if (!user) {
        setShowLoginModal(true);
      } else {
        navigate(link);
      }
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
  const filteredServices = ACADEMIC_SERVICES.filter(s => 
    s.title.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  // Filtered Notices
  const filteredNotices = NOTICES.filter(n => {
    if (noticeCategory === 'All') return true;
    return n.category.toLowerCase() === noticeCategory.toLowerCase();
  });

  // Translations
  const isHi = lang === 'HI';

  return (
    <div className="gov-landing-container">
      {/* 2. TOP GOVERNMENT / INSTITUTION BAR */}
      <div className="gov-top-bar">
        <div className="gov-container gov-top-bar-content">
          <div className="gov-top-bar-left">
            <span className="gov-emblem-badge">{isHi ? 'बिहार सरकार' : 'GOVT OF BIHAR'}</span>
            <span className="gov-top-text">
              {isHi
                ? 'राजकीय इंजीनियरिंग कॉलेज, मधुबनी | बिहार'
                : 'Government Engineering College, Madhubani | Bihar'}
            </span>
          </div>
          <div className="gov-top-bar-right">
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>{isHi ? 'सहायता' : 'Help'}</a>
            <span className="gov-divider">|</span>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>{isHi ? 'संपर्क' : 'Contact'}</a>
            <span className="gov-divider">|</span>
            <a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>{isHi ? 'सूचना' : 'Notice'}</a>
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

      {/* 3. MAIN HEADER */}
      <header className="gov-header">
        <div className="gov-container gov-header-content">
          <div className="gov-brand-left" onClick={() => scrollToSection('hero')} style={{ cursor: 'pointer' }}>
            <GECMLogo size="medium" showText={false} theme="light" onClick={() => scrollToSection('hero')} />
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
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>{isHi ? 'मुख्य पृष्ठ' : 'Home'}</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>{isHi ? 'परिचय' : 'About'}</a>
            <a href="#academics" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>{isHi ? 'अकादमिक' : 'Academics'}</a>
            <a href="#departments" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>{isHi ? 'विभाग' : 'Departments'}</a>
            <a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>{isHi ? 'सूचनाएं' : 'Notices'}</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>{isHi ? 'संपर्क' : 'Contact'}</a>

            {user ? (
              <button className="gov-btn-primary" onClick={() => navigate(getDashboardRoute())}>
                Dashboard ({user.role.toUpperCase()}) →
              </button>
            ) : (
              <button className="gov-btn-primary" onClick={() => setShowLoginModal(true)}>
                {isHi ? 'छात्र / संकाय लॉगिन' : 'Student / Faculty Login'}
              </button>
            )}
          </nav>

          <button className="gov-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="gov-nav-mobile">
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
            <a href="#academics" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>Academics</a>
            <a href="#departments" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>Departments</a>
            <a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>Notices</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
            {user ? (
              <button className="gov-btn-primary w-full" onClick={() => navigate(getDashboardRoute())}>
                Go to Dashboard →
              </button>
            ) : (
              <button className="gov-btn-primary w-full" onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}>
                Student / Faculty Login
              </button>
            )}
          </div>
        )}
      </header>

      {/* 4. NOTICE / ANNOUNCEMENT BAR */}
      <div className="gov-notice-ticker-bar">
        <div className="gov-container gov-notice-ticker-content">
          <div className="gov-notice-label">
            <span className="gov-notice-badge">NOTICE / सूचना</span>
          </div>
          <div className="gov-notice-text">
            📢 Admissions, examination schedules, academic notices and important campus updates.
          </div>
          <a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }} className="gov-notice-link">
            View All Notices →
          </a>
        </div>
      </div>

      {/* 5. HERO SECTION */}
      <section id="hero" className="gov-hero-section">
        <div className="gov-container gov-hero-content">
          <div className="gov-hero-badge">
            🏛️ Government Engineering College, Madhubani
          </div>
          <h1 className="gov-hero-title">GECM ACADEMICS</h1>
          <h2 className="gov-hero-subtitle">Academic Management & Student Services</h2>
          <p className="gov-hero-desc">
            One integrated platform for students, faculty and administrators to access academic information, notices, examination services and campus resources.
          </p>
          <div className="gov-hero-actions">
            {user ? (
              <button className="gov-btn-hero-primary" onClick={() => navigate(getDashboardRoute())}>
                Go to Student Portal →
              </button>
            ) : (
              <button className="gov-btn-hero-primary" onClick={() => setShowLoginModal(true)}>
                Student Login →
              </button>
            )}
            <button className="gov-btn-hero-secondary" onClick={() => scrollToSection('services')}>
              Explore Academics
            </button>
          </div>
        </div>
      </section>

      {/* 6. QUICK SERVICE CARDS */}
      <section className="gov-quick-cards-section">
        <div className="gov-container">
          <div className="gov-quick-cards-grid">
            {QUICK_SERVICES.map((card, idx) => (
              <div key={idx} className="gov-quick-card" onClick={() => handleCardClick(card.link)}>
                <div className="gov-quick-card-icon">{card.icon}</div>
                <div className="gov-quick-card-body">
                  <h3 className="gov-quick-card-title">{card.title}</h3>
                  <p className="gov-quick-card-desc">{card.desc}</p>
                </div>
                <span className="gov-quick-card-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. IMPORTANT SERVICES SECTION WITH LIVE INTERACTIVE SEARCH */}
      <section id="services" className="gov-section gov-bg-light">
        <div className="gov-container">
          <div className="gov-section-header">
            <span className="gov-section-tag">DIGITAL CAMPUS</span>
            <h2 className="gov-section-title">Academic Services</h2>
            <div className="gov-title-line" />
            <p className="gov-section-desc">Unified academic management portal for student services, exams, and department workflows</p>
          </div>

          {/* Interactive Live Search Box */}
          <div className="gov-service-search-box">
            <span className="gov-service-search-icon">🔍</span>
            <input 
              type="text" 
              className="gov-service-search-input" 
              placeholder="Search academic services... (e.g. Attendance, Gate Pass, Admit Card)" 
              value={serviceSearchQuery}
              onChange={(e) => setServiceSearchQuery(e.target.value)}
            />
          </div>

          <div className="gov-services-grid">
            {filteredServices.length > 0 ? (
              filteredServices.map((svc, idx) => (
                <div 
                  key={idx} 
                  className="gov-service-item"
                  onClick={() => {
                    if (!user) setShowLoginModal(true);
                    else navigate(getDashboardRoute());
                  }}
                >
                  <div className="gov-service-icon-wrapper">{svc.icon}</div>
                  <div className="gov-service-info">
                    <h4 className="gov-service-title">{svc.title}</h4>
                    <p className="gov-service-desc">{svc.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No academic services match "{serviceSearchQuery}"
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. NOTICE BOARD SECTION WITH CATEGORY FILTERS & INTERACTIVE PREVIEW */}
      <section id="notices" className="gov-section">
        <div className="gov-container">
          <div className="gov-section-header-flex">
            <div>
              <span className="gov-section-tag">OFFICIAL CIRCULARS</span>
              <h2 className="gov-section-title">Latest Notices</h2>
            </div>
            <button className="gov-btn-outline" onClick={() => toast.info('Showing all published campus notices')}>
              View All Notices →
            </button>
          </div>

          {/* Interactive Notice Category Filters */}
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
            {filteredNotices.map((n) => (
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
                  <h4 className="gov-notice-item-title">{n.title}</h4>
                </div>
                <div className="gov-notice-action">
                  <button className="gov-btn-sm" onClick={(e) => { e.stopPropagation(); setActiveNoticeModal(n); }}>
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. ACADEMIC INFORMATION SECTION WITH INTERACTIVE MODAL DETAILS */}
      <section id="academics" className="gov-section gov-bg-light">
        <div className="gov-container">
          <div className="gov-section-header">
            <span className="gov-section-tag">INSTITUTIONAL RESOURCES</span>
            <h2 className="gov-section-title">Academic Information</h2>
            <div className="gov-title-line" />
            <p className="gov-section-desc">Key details regarding departments, course curricula, academic schedules and examination rules.</p>
          </div>

          <div className="gov-academic-grid">
            {ACADEMIC_INFO_CARDS.map((card, idx) => (
              <div key={idx} className="gov-academic-card" onClick={() => setActiveInfoModal(card)}>
                <div className="gov-card-badge">{card.category}</div>
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

      {/* 10. CAMPUS / COLLEGE SECTION */}
      <section id="about" className="gov-section">
        <div className="gov-container">
          <div className="gov-about-grid">
            <div className="gov-about-content">
              <span className="gov-section-tag">INSTITUTION OVERVIEW</span>
              <h2 className="gov-section-title">Government Engineering College, Madhubani</h2>
              <p className="gov-about-text">
                Government Engineering College, Madhubani (GECM) is a government technical institution under the Department of Science, Technology & Technical Education, Government of Bihar.
              </p>
              <p className="gov-about-text">
                The institution is dedicated to offering undergraduate engineering education, technical skills, and research capabilities to nurture engineering professionals for state and national development.
              </p>

              <div className="gov-about-features">
                <div className="gov-feat-item">
                  <span className="gov-feat-icon">🏛️</span>
                  <div>
                    <strong>Government Institution</strong>
                    <div>Dept. of Science & Tech, Bihar</div>
                  </div>
                </div>
                <div className="gov-feat-item">
                  <span className="gov-feat-icon">⚡</span>
                  <div>
                    <strong>Digital Workflows</strong>
                    <div>Paperless Gate Pass & No-Dues</div>
                  </div>
                </div>
              </div>

              <div className="gov-about-actions">
                <button className="gov-btn-primary" onClick={() => scrollToSection('about')}>
                  About GECM ACADEMICS
                </button>
                <button className="gov-btn-outline" onClick={() => scrollToSection('academics')}>
                  Explore Departments
                </button>
              </div>
            </div>

            <div className="gov-about-image-card" style={{ background: 'linear-gradient(135deg, #0b1d3a 0%, #1e3a8a 100%)', color: '#ffffff', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxShadow: '0 10px 25px rgba(11, 29, 58, 0.15)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '2px solid rgba(251, 191, 36, 0.4)' }}>
                <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 4L8 14V30C8 44.8 18.24 58.08 32 62C45.76 58.08 56 44.8 56 30V14L32 4Z" fill="url(#about_grad)" stroke="#fbbf24" strokeWidth="2"/>
                  <path d="M32 16L48 24L32 32L16 24L32 16Z" fill="#fbbf24"/>
                  <path d="M22 28.5V36.5C22 39.5 26.5 42 32 42C37.5 42 42 39.5 42 36.5V28.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="about_grad" x1="8" y1="4" x2="56" y2="62" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1e3a8a"/>
                      <stop offset="1" stopColor="#0b1d3a"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', color: '#ffffff' }}>Government Engineering College</h3>
              <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '20px', maxWidth: '320px' }}>Madhubani, Bihar — Department of Science, Technology & Technical Education</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '1.3rem', color: '#fbbf24', display: 'block' }}>100%</strong>
                  <span style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>Digital Workflow</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '1.3rem', color: '#38bdf8', display: 'block' }}>Real-Time</strong>
                  <span style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>Gate Pass & Clearances</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 17. FOOTER */}
      <footer id="contact" className="gov-footer">
        <div className="gov-container">
          <div className="gov-footer-grid">
            {/* Column 1 */}
            <div className="gov-footer-col">
              <div className="gov-footer-brand">
                <GECMLogo size="medium" showText={false} theme="dark" onClick={() => scrollToSection('hero')} />
                <div style={{ marginTop: '8px' }}>
                  <div className="gov-footer-title">GECM ACADEMICS</div>
                  <div className="gov-footer-subtitle">Government Engineering College, Madhubani</div>
                </div>
              </div>
              <p className="gov-footer-desc">
                Academic Management & Student Services Portal of Government Engineering College, Madhubani (Department of Science, Technology & Technical Education, Govt. of Bihar).
              </p>
            </div>

            {/* Column 2 */}
            <div className="gov-footer-col">
              <h4 className="gov-footer-heading">Quick Links</h4>
              <ul className="gov-footer-links">
                <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a></li>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a></li>
                <li><a href="#academics" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>Academics</a></li>
                <li><a href="#academics" onClick={(e) => { e.preventDefault(); scrollToSection('academics'); }}>Departments</a></li>
                <li><a href="#notices" onClick={(e) => { e.preventDefault(); scrollToSection('notices'); }}>Latest Notices</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="gov-footer-col">
              <h4 className="gov-footer-heading">Student Services</h4>
              <ul className="gov-footer-links">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}>Student Login</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}>Examination</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}>Results</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}>Notices</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}>Digital Gate Pass</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div className="gov-footer-col">
              <h4 className="gov-footer-heading">Contact</h4>
              <div className="gov-footer-contact">
                <p>📍 GEC Madhubani Campus, Araria Sangram, Jhanjharpur, Madhubani, Bihar - 847211</p>
                <p>📧 Email: principal@gecmadhubani.ac.in</p>
                <p>📞 Phone: +91 612 2221234</p>
                <p>🌐 Website: gecmadhubani.ac.in</p>
              </div>
            </div>
          </div>

          <div className="gov-footer-bottom">
            <p>© 2026 Government Engineering College, Madhubani. All Rights Reserved.</p>
            <div className="gov-footer-bottom-links">
              <span>Department of Science, Technology & Technical Education, Govt. of Bihar</span>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button 
          className="gov-back-to-top" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to Top"
        >
          ↑
        </button>
      )}

      {/* INTERACTIVE NOTICE MODAL */}
      {activeNoticeModal && (
        <div className="gov-modal-overlay" onClick={() => setActiveNoticeModal(null)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="gov-modal-close" onClick={() => setActiveNoticeModal(null)}>✕</button>
            <div className="gov-modal-header">
              <span className="gov-notice-tag">{activeNoticeModal.category}</span>
              <h3 className="gov-modal-title" style={{ marginTop: '6px' }}>{activeNoticeModal.title}</h3>
              <p className="gov-modal-sub">Issued by: {activeNoticeModal.dept} | Date: {activeNoticeModal.date}</p>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, padding: '16px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              {activeNoticeModal.details}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
              <button className="gov-btn-outline" onClick={() => { toast.success('Circular PDF downloaded'); setActiveNoticeModal(null); }}>
                📥 Download PDF
              </button>
              <button className="gov-btn-primary" onClick={() => setActiveNoticeModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE ACADEMIC INFO MODAL */}
      {activeInfoModal && (
        <div className="gov-modal-overlay" onClick={() => setActiveInfoModal(null)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="gov-modal-close" onClick={() => setActiveInfoModal(null)}>✕</button>
            <div className="gov-modal-header">
              <span className="gov-card-badge">{activeInfoModal.category}</span>
              <h3 className="gov-modal-title" style={{ marginTop: '4px' }}>{activeInfoModal.title}</h3>
              <p className="gov-modal-sub">{activeInfoModal.meta}</p>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.65, padding: '16px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', whiteSpace: 'pre-line' }}>
              {activeInfoModal.content}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
              <button className="gov-btn-primary" onClick={() => setActiveInfoModal(null)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. CLEAN INSTITUTIONAL LOGIN MODAL */}
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

            {/* Discrete Demo Quick Fill Helper */}
            <div className="gov-quick-fill-box">
              <div className="gov-quick-fill-label">⚡ Quick Fill Demo Account:</div>
              <div className="gov-quick-fill-pills">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.role}
                    type="button"
                    className="gov-quick-pill"
                    onClick={() => fillDemoAccount(acc)}
                  >
                    {acc.label}
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
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: '1rem',
                      color: '#94a3b8', padding: '4px'
                    }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="gov-form-footer">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                  <input type="checkbox" defaultChecked /> Remember me
                </label>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); toast.info('Password reset link sent to your registered email.'); }} 
                  style={{ fontSize: '0.85rem', color: '#0b1d3a', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="gov-btn-primary w-full" disabled={loading} style={{ marginTop: '16px', padding: '12px', justifyContent: 'center' }}>
                {loading ? 'Authenticating...' : 'Login →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
