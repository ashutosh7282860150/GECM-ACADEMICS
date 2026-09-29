import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { timeAgo, getInitials, getRoleColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import GECMLogo from '../components/GECMLogo';

const NAV_CONFIGS = {
  student: [
    { label: 'Dashboard', icon: '🏠', path: '/student/dashboard' },
    { label: 'Apply Services', icon: '📄', path: '/student/applications' },
    { label: 'My Applications', icon: '📋', path: '/student/my-applications' },
    { label: 'My Profile', icon: '👤', path: '/student/profile' },
    { label: 'Fee Payment', icon: '💳', path: '/student/fees' },
    { label: 'Attendance', icon: '📋', path: '/student/attendance' },
    { label: 'Examinations', icon: '📝', path: '/student/exams' },
    { label: 'Results', icon: '🏆', path: '/student/results' },
    { label: 'Hostel', icon: '🏠', path: '/student/hostel' },
    { label: 'No-Dues', icon: '✅', path: '/student/nodues' },
    { label: 'Gate Pass', icon: '🚪', path: '/student/gatepass' },
    { label: 'Notifications', icon: '🔔', path: '/student/notifications' },
  ],
  faculty: [
    { label: 'Dashboard', icon: '🏠', path: '/faculty/dashboard' },
    { label: 'Applications Inbox', icon: '📥', path: '/faculty/applications-inbox' },
    { label: 'My Courses', icon: '📚', path: '/faculty/courses' },
    { label: 'Attendance', icon: '📋', path: '/faculty/attendance' },
    { label: 'My Students', icon: '👥', path: '/faculty/students' },
    { label: 'Marks & Results', icon: '🏆', path: '/faculty/results' },
  ],
  hod: [
    { label: 'Dashboard', icon: '🏠', path: '/faculty/dashboard' },
    { label: 'Applications Inbox', icon: '📥', path: '/hod/applications-inbox' },
    { label: 'Department', icon: '🏛️', path: '/hod/department' },
    { label: 'Faculty', icon: '👨‍🏫', path: '/faculty/students' },
    { label: 'Students', icon: '👥', path: '/hod/students' },
    { label: 'Approvals', icon: '✅', path: '/hod/approvals' },
  ],
  warden: [
    { label: 'Dashboard', icon: '🏠', path: '/warden/dashboard' },
    { label: 'Applications Inbox', icon: '📥', path: '/warden/applications-inbox' },
    { label: 'Hostel Management', icon: '🏨', path: '/warden/hostel' },
    { label: 'Gate Passes', icon: '🚪', path: '/warden/gatepass' },
    { label: 'No-Dues Verify', icon: '✅', path: '/warden/nodues' },
  ],
  accounts: [
    { label: 'Dashboard', icon: '🏠', path: '/accounts/dashboard' },
    { label: 'Applications Inbox', icon: '📥', path: '/accounts/applications-inbox' },
    { label: 'Fee Management', icon: '💰', path: '/accounts/fees' },
    { label: 'Payments', icon: '💳', path: '/accounts/payments' },
    { label: 'No-Dues Verify', icon: '✅', path: '/accounts/nodues' },
  ],
  admin: [
    { label: 'Dashboard', icon: '🏠', path: '/admin/dashboard' },
    { label: 'Applications Inbox', icon: '📥', path: '/admin/applications-inbox' },
    { label: 'Workflow Config', icon: '⚙️', path: '/admin/workflow-config' },
    { label: 'Users', icon: '👥', path: '/admin/users' },
    { label: 'Students', icon: '🎓', path: '/admin/students' },
    { label: 'Faculty', icon: '👨‍🏫', path: '/admin/faculty' },
    { label: 'Departments', icon: '🏛️', path: '/admin/departments' },
    { label: 'No-Dues', icon: '✅', path: '/admin/nodues' },
    { label: 'Gate Passes', icon: '🚪', path: '/admin/gatepass' },
    { label: 'Fee Reports', icon: '📊', path: '/admin/fees' },
    { label: 'Audit Logs', icon: '🔍', path: '/admin/audit' },
    { label: 'Pending Workflows', icon: '⚙️', path: '/admin/workflows' },
  ],
};


export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const navItems = NAV_CONFIGS[user?.role] || [];

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationsAPI.getAll();
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
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
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  const location = useLocation();
  const pageTitle = navItems.find(n => n.path === location.pathname)?.label || 'SmartCampus ERP';

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/" className="sidebar-logo" style={{ textDecoration: 'none', padding: '12px 16px' }}>
          <GECMLogo size="medium" />
        </NavLink>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar" style={{ background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}aa)` }}>
                {getInitials(user.name)}
              </div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <GECMLogo size="small" showText={false} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(6, 182, 212, 0.25))', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    GECM ACADEMICS
                  </span>
                  <span className="topbar-title" style={{ fontSize: '1.25rem' }}>{pageTitle}</span>
                </div>
                <div className="topbar-subtitle">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="topbar-btn" onClick={() => setNotifOpen(!notifOpen)} id="notif-btn">
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="notif-panel">
                  <div className="notif-header">
                    <span className="notif-title">Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                    {unreadCount > 0 && (
                      <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="empty-state" style={{ padding: '30px' }}>
                        <div className="empty-state-icon">🔔</div>
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                          {!n.is_read && <div className="notif-dot" />}
                          <div className="notif-content">
                            <div className="notif-title-text">{n.title}</div>
                            <div className="notif-msg">{n.message}</div>
                            <div className="notif-time">{timeAgo(n.created_at)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="topbar-btn" style={{ cursor: 'default', background: `rgba(99,102,241,0.15)`, borderColor: 'var(--primary)' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-light)' }}>
                {getInitials(user?.name)}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
