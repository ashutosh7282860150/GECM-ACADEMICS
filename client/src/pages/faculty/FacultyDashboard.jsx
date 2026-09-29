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
        <div className="stat-card"><div className="stat-icon blue">📚</div><div className="stat-info"><div className="stat-value">{stats.totalCourses}</div><div className="stat-label">Courses Assigned</div></div></div>
        <div className="stat-card"><div className="stat-icon green">👥</div><div className="stat-info"><div className="stat-value">{stats.totalStudents}</div><div className="stat-label">Students</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">📝</div><div className="stat-info"><div className="stat-value">{stats.pendingResults}</div><div className="stat-label">Pending Results</div></div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📚 My Courses</div>
          <a href="/faculty/attendance" className="btn btn-primary btn-sm">Mark Attendance</a>
        </div>
        {courses && courses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {courses.map(course => (
              <div key={course.id} style={{ padding: '16px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <strong style={{ fontSize: '13px' }}>{course.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{course.code}</div>
                  </div>
                  <span style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>Sem {course.semester}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{course.credits} Credits • {course.department_name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-state-icon">📚</div><h4>No courses assigned</h4>
          </div>
        )}
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">⚡ Quick Actions</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Mark Today\'s Attendance', icon: '📋', path: '/faculty/attendance', color: '#6366f1' },
              { label: 'Enter Exam Marks', icon: '🏆', path: '/faculty/results', color: '#10b981' },
              { label: 'View Students', icon: '👥', path: '/faculty/students', color: '#f59e0b' },
            ].map(action => (
              <a key={action.path} href={action.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'var(--transition)', color: 'var(--text-primary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = action.color + '15'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
                <span style={{ fontSize: '20px' }}>{action.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">📊 Today's Schedule</div></div>
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-state-icon">📅</div>
            <h4>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
            <p>Check your courses and mark attendance for today.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
