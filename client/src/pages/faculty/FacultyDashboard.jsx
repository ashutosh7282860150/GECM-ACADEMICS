import { useState, useEffect } from 'react';
import { dashboardAPI, facultyAPI } from '../../services/api';
import { formatDate, timeAgo } from '../../utils/helpers';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.faculty().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><h4>Failed to load</h4></div>;

  const { faculty, stats, courses } = data;

  return (
    <div className="dashboard-grid">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))', borderColor: 'rgba(16,185,129,0.3)' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2>👨‍🏫 Welcome, {faculty?.name || 'Faculty'}!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {faculty?.designation} • {faculty?.department_name} • {faculty?.employee_id}
            </p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon green">👥</div><div className="stat-info"><div className="stat-value">{stats?.totalStudents || 120}</div><div className="stat-label">Department Students</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">📢</div><div className="stat-info"><div className="stat-value">Active</div><div className="stat-label">Faculty Notices</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">📥</div><div className="stat-info"><div className="stat-value">Workflows</div><div className="stat-label">Applications Inbox</div></div></div>
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-header"><div className="card-title">⚡ Faculty Services</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Student Directory', desc: 'Search & view department students', icon: '👥', path: '/faculty/students', color: '#f59e0b' },
              { label: 'Official Notices', desc: 'Institutional circulars & announcements', icon: '📢', path: '/faculty/notices', color: '#6366f1' },
              { label: 'Applications Inbox', desc: 'Review & approve student requests', icon: '📥', path: '/faculty/applications-inbox', color: '#10b981' },
              { label: 'Faculty Profile', desc: 'View employee & academic credentials', icon: '👤', path: '/faculty/profile', color: '#0ea5e9' },
            ].map(action => (
              <a key={action.path} href={action.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'var(--transition)', color: 'var(--text-primary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = action.color + '15'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
                <span style={{ fontSize: '22px' }}>{action.icon}</span>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700' }}>{action.label}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{action.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">🏛️ Academic Department</div></div>
          <div style={{ padding: '16px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0b1d3a' }}>
              {faculty?.department_name || 'Department of Computer Science & Engineering'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Government Engineering College, Madhubani (GECM)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              • Designation: <strong>{faculty?.designation || 'Associate Professor'}</strong><br />
              • Employee ID: <strong>{faculty?.employee_id || 'EMP001'}</strong><br />
              • Portal Status: <strong style={{ color: '#16a34a' }}>Active Faculty</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
