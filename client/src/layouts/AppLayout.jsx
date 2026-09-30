import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';
import GECMLogo from '../components/GECMLogo';

const ROLE_NAV_CONFIGS = {
  student: [
    { label: 'Dashboard', icon: '🏠', path: '/student/dashboard' },
    { label: 'Student Profile', icon: '👤', path: '/student/profile' },
    { label: 'Course Registration', icon: '📑', path: '/student/course-registration' },
    { label: 'Attendance', icon: '📊', path: '/student/attendance' },
    { label: 'Examination', icon: '📝', path: '/student/examination' },
    { label: 'Results & Grades', icon: '🏆', path: '/student/results' },
    { label: 'Fees & Receipts', icon: '💳', path: '/student/fees' },
    { label: 'Digital Gate Pass', icon: '🚪', path: '/student/gate-pass' },
    { label: 'No-Dues Clearance', icon: '✅', path: '/student/no-dues' },
    { label: 'Assignments', icon: '📚', path: '/student/assignments' },
    { label: 'Time Table', icon: '📅', path: '/student/timetable' },
    { label: 'Hostel Services', icon: '🏨', path: '/student/hostel' },
    { label: 'Apply Services', icon: '📄', path: '/student/applications' },
    { label: 'My Applications', icon: '📋', path: '/student/my-applications' },
    { label: 'Notifications', icon: '🔔', path: '/student/notifications' },
  ],
  faculty: [
    { label: 'Dashboard', icon: '🏠', path: '/faculty/dashboard' },
    { label: 'Faculty Profile', icon: '👤', path: '/faculty/profile' },
    { label: 'Attendance Marking', icon: '📋', path: '/faculty/attendance' },
    { label: 'My Courses & Syllabus', icon: '📚', path: '/faculty/courses' },
    { label: 'Teaching Timetable', icon: '📅', path: '/faculty/timetable' },
    { label: 'Examinations & Marks', icon: '🏆', path: '/faculty/examinations' },
    { label: 'Course Assignments', icon: '📝', path: '/faculty/assignments' },
    { label: 'Faculty Notices', icon: '📢', path: '/faculty/notices' },
    { label: 'Student Directory', icon: '👥', path: '/faculty/students' },
    { label: 'Applications Inbox', icon: '📥', path: '/faculty/applications-inbox' },
  ],
  hod: [
    { label: 'Dashboard', icon: '🏠', path: '/faculty/dashboard' },
    { label: 'Department Overview', icon: '🏛️', path: '/departments' },
    { label: 'Applications Inbox', icon: '📥', path: '/hod/applications-inbox' },
    { label: 'Faculty Roster', icon: '👨‍🏫', path: '/faculty/students' },
    { label: 'Student Directory', icon: '👥', path: '/hod/students' },
    { label: 'Approvals & Workflows', icon: '✅', path: '/hod/approvals' },
  ],
  warden: [
    { label: 'Dashboard', icon: '🏠', path: '/warden/dashboard' },
    { label: 'Hostel Administration', icon: '🏨', path: '/admin/hostel' },
    { label: 'Gate Pass Approvals', icon: '🚪', path: '/warden/gatepass' },
    { label: 'Mess & Hostel No-Dues', icon: '✅', path: '/warden/nodues' },
    { label: 'Applications Inbox', icon: '📥', path: '/warden/applications-inbox' },
  ],
  accounts: [
    { label: 'Dashboard', icon: '🏠', path: '/accounts/dashboard' },
    { label: 'Fee Collections & Dues', icon: '💰', path: '/admin/accounts' },
    { label: 'Transactions & Receipts', icon: '💳', path: '/accounts/payments' },
    { label: 'No-Dues Clearance', icon: '✅', path: '/accounts/nodues' },
    { label: 'Applications Inbox', icon: '📥', path: '/accounts/applications-inbox' },
  ],
  admin: [
    { label: 'Dashboard', icon: '🏠', path: '/admin/dashboard' },
    { label: 'Student Management', icon: '🎓', path: '/admin/students' },
    { label: 'Faculty Management', icon: '👨‍🏫', path: '/admin/faculty' },
    { label: 'Accounts & Fee Cell', icon: '💰', path: '/admin/accounts' },
    { label: 'Examination Cell', icon: '📝', path: '/admin/examination' },
    { label: 'Central Library', icon: '📚', path: '/admin/library' },
    { label: 'Laboratory Inventory', icon: '🔬', path: '/admin/laboratory' },
    { label: 'Hostel Administration', icon: '🏨', path: '/admin/hostel' },
    { label: 'Department Programs', icon: '🏛️', path: '/admin/department' },
    { label: 'Official Notices', icon: '📢', path: '/admin/notices' },
    { label: 'Institutional Reports', icon: '📊', path: '/admin/reports' },
    { label: 'Workflow Config', icon: '⚙️', path: '/admin/workflow-config' },
    { label: 'System Audit Logs', icon: '🔍', path: '/admin/audit' },
    { label: 'Pending Approvals', icon: '✅', path: '/admin/workflows' },
    { label: 'Applications Inbox', icon: '📥', path: '/admin/applications-inbox' },
  ],
};

const ROLE_TITLES = {
  student: '🎓 Student Services',
  faculty: '👨‍🏫 Faculty Services',
  hod: '👨‍🏫 Faculty & HOD Services',
  warden: '🏨 Hostel & Warden Services',
  accounts: '💰 Accounts Cell Services',
  admin: '🏛️ Admin / Staff Services'
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const roleKey = user?.role || 'student';
  const navItems = ROLE_NAV_CONFIGS[roleKey] || ROLE_NAV_CONFIGS.student;

  const prevNotifIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  const handleNotifClick = async (n) => {
    try {
      await notificationsAPI.markAsRead(n.id);
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}

    setNotifOpen(false);
    if (n.reference_type === 'gate_pass') {
      if (user?.role === 'warden' || user?.role === 'admin') {
        navigate('/warden/gatepass');
      } else {
        navigate('/student/gate-pass');
      }
    } else if (n.reference_type === 'application') {
      if (user?.role === 'student') {
        navigate('/student/my-applications');
      } else {
        navigate(`/${user?.role}/applications-inbox`);
      }
    } else if (n.reference_type === 'assignment') {
      navigate('/student/assignments');
    } else if (n.reference_type === 'attendance') {
      navigate('/student/attendance');
    } else if (n.reference_type === 'no_dues') {
      navigate(user?.role === 'student' ? '/student/no-dues' : '/warden/nodues');
    } else {
      navigate(user?.role === 'student' ? '/student/notifications' : '/admin/notices');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  const fetchNotifs = async () => {
    try {
      const res = await notificationsAPI.getAll();
      const list = res.data.data || [];
      const unread = res.data.unreadCount || 0;
      setNotifications(list);
      setUnreadCount(unread);

      // Check for incoming new unread notifications and pop up real-time toast
      if (!isFirstLoadRef.current) {
        list.forEach(n => {
          if (!n.is_read && !prevNotifIdsRef.current.has(n.id)) {
            toast((t) => (
              <div onClick={() => { handleNotifClick(n); toast.dismiss(t.id); }} style={{ cursor: 'pointer' }}>
                <strong style={{ display: 'block', color: '#0b1d3a', fontSize: '0.88rem' }}>{n.title}</strong>
                <span style={{ fontSize: '0.78rem', color: '#475569' }}>{n.message}</span>
              </div>
            ), {
              icon: n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : '🔔',
              duration: 5000,
              style: {
                borderRadius: '8px',
                background: '#ffffff',
                color: '#0b1d3a',
                border: '1px solid #cbd5e1',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }
            });
          }
        });
      }
      isFirstLoadRef.current = false;
      prevNotifIdsRef.current = new Set(list.map(n => n.id));
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getProfileRoute = () => {
    if (user?.role === 'student') return '/student/profile';
    if (user?.role === 'faculty' || user?.role === 'hod') return '/faculty/profile';
    return '/admin/users';
  };

  const getDashboardRoute = () => {
    if (user?.role === 'student') return '/student/dashboard';
    if (user?.role === 'faculty' || user?.role === 'hod') return '/faculty/dashboard';
    if (user?.role === 'warden') return '/warden/dashboard';
    if (user?.role === 'accounts') return '/accounts/dashboard';
    return '/admin/dashboard';
  };

  return (
    <div className="app-layout" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── TOP INSTITUTIONAL DASHBOARD NAVIGATION ── */}
      <header className="gov-header" style={{ position: 'sticky', top: 0, zIndex: 1100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="gov-container gov-header-content" style={{ minHeight: '68px', padding: '6px 0' }}>
          
          {/* Brand Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="gov-hamburger"
              style={{ display: 'inline-flex', padding: '6px 10px', fontSize: '1.1rem' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            <NavLink to={getDashboardRoute()} className="gov-brand-left" style={{ textDecoration: 'none' }}>
              <GECMLogo size="small" showText={false} theme="light" />
              <div className="gov-brand-titles">
                <div className="gov-brand-main" style={{ fontSize: '1.1rem' }}>GECM ACADEMICS</div>
                <div className="gov-brand-fullname" style={{ fontSize: '0.78rem' }}>
                  Government Engineering College, Madhubani
                </div>
              </div>
            </NavLink>
          </div>

          {/* Top User Controls & Actions (Role Specific Portal Only) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* User Profile Chip */}
            <NavLink
              to={getProfileRoute()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
                color: '#0b1d3a',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
              title="View Profile"
            >
              <span style={{ fontSize: '0.95rem' }}>
                {user?.role === 'student' ? '🎓' : user?.role === 'faculty' || user?.role === 'hod' ? '👨‍🏫' : '🏛️'}
              </span>
              <span>{user?.name || 'My Profile'}</span>
            </NavLink>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                type="button"
                className="gov-btn-outline"
                style={{ padding: '6px 10px', fontSize: '0.85rem', position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setNotifOpen(!notifOpen)}
                title="Real-time Alerts & Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="gov-nav-dropdown-menu" style={{ width: '330px', right: 0, padding: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0b1d3a' }}>
                      Notifications &amp; Alerts ({unreadCount} new)
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {notifications.slice(0, 8).map((n, i) => (
                        <div
                          key={n.id || i}
                          onClick={() => handleNotifClick(n)}
                          style={{
                            fontSize: '0.78rem',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: n.is_read ? 'transparent' : '#f0fdf4',
                            border: n.is_read ? '1px solid transparent' : '1px solid #bbf7d0',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                            <div style={{ fontWeight: n.is_read ? 600 : 800, color: '#0b1d3a' }}>{n.title}</div>
                            {!n.is_read && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', flexShrink: 0, marginTop: '4px' }} />}
                          </div>
                          <div style={{ color: '#475569', fontSize: '0.74rem', marginTop: '2px', lineHeight: 1.3 }}>{n.message}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '4px' }}>
                            {n.created_at ? new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', padding: '14px 0' }}>
                      No new notifications
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="gov-btn-outline"
              style={{ color: '#dc2626', borderColor: '#ef4444', padding: '6px 12px', fontSize: '0.82rem' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Role Bar Header */}
        <div style={{ background: '#0b1d3a', color: '#ffffff', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '6px 0' }}>
          <div className="gov-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#fde68a', letterSpacing: '0.5px' }}>
                {ROLE_TITLES[roleKey] || 'Academic Services'}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>|</span>
              <span style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>
                Logged in as: <strong>{user?.name}</strong> ({user?.role?.toUpperCase()})
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* Sidebar Overlay on Mobile */}
        {sidebarOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Role Navigation Sidebar */}
        <aside
          style={{
            width: '260px',
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0,
            zIndex: 1300,
            ...(sidebarOpen
              ? { position: 'fixed', top: 0, bottom: 0, left: 0, boxShadow: '4px 0 20px rgba(0,0,0,0.2)' }
              : {})
          }}
          className={sidebarOpen ? '' : 'hide-on-mobile-sidebar'}
        >
          {sidebarOpen && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '0 6px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0b1d3a' }}>Menu Navigation</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
          )}

          <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {ROLE_TITLES[roleKey]}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#0b1d3a' : '#475569',
                    background: isActive ? '#f0f4f9' : 'transparent',
                    borderLeft: isActive ? '3px solid #0b1d3a' : '3px solid transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ fontSize: '1.05rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>🚪</span>
              <span>Sign Out ({user?.role?.toUpperCase()})</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '16px', overflowY: 'auto', minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* Institutional Footer */}
      <footer className="gov-footer" style={{ borderTop: '1px solid #e2e8f0', background: '#0b1d3a', color: '#94a3b8', padding: '14px 0', fontSize: '0.78rem' }}>
        <div className="gov-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>© 2026 Government Engineering College, Madhubani. All Rights Reserved.</div>
          <div>Department of Science, Technology &amp; Technical Education, Govt. of Bihar</div>
        </div>
      </footer>
    </div>
  );
}
