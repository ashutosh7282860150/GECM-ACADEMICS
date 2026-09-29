import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';
import { timeAgo, getStatusBadgeClass } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TYPE_ICON = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', action_required: '🔔' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    notificationsAPI.getAll()
      .then(res => {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🔔 Notifications</h1>
          <p className="page-desc">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <div className="page-actions">
            <button className="btn btn-outline" onClick={handleMarkAllRead}>Mark All Read</button>
          </div>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h4>No Notifications</h4>
            <p>You're all caught up! Notifications about fees, gate passes, and no-dues will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {notifications.map((n, i) => (
              <div key={n.id}
                style={{ padding: '16px', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', gap: '14px', background: !n.is_read ? 'rgba(99,102,241,0.05)' : 'transparent', cursor: !n.is_read ? 'pointer' : 'default', transition: 'var(--transition)', borderRadius: i === 0 ? 'var(--radius-md) var(--radius-md) 0 0' : i === notifications.length - 1 ? '0 0 var(--radius-md) var(--radius-md)' : '0' }}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                onMouseEnter={e => { if (!n.is_read) e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = !n.is_read ? 'rgba(99,102,241,0.05)' : 'transparent'; }}>
                <div style={{ fontSize: '22px', flexShrink: 0, lineHeight: 1 }}>{TYPE_ICON[n.type] || 'ℹ️'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{n.title}</strong>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>{n.message}</p>
                  {!n.is_read && <p style={{ fontSize: '11px', color: 'var(--primary-light)', marginTop: '6px' }}>Click to mark as read</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
