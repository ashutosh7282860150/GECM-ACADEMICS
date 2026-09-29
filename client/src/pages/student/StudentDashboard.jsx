import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, getStatusBadgeClass, getStatusLabel, formatDate, timeAgo } from '../../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.student()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><h4>Failed to load dashboard</h4></div>;

  const { student, attendance, fees, hostel, noDues, gatePasses, notifications, results } = data;

  const attendanceColor = attendance.percentage >= 75 ? 'success' : attendance.percentage >= 60 ? 'warning' : 'danger';

  return (
    <div className="dashboard-grid">
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #6366f122, #8b5cf622)', borderColor: 'rgba(99,102,241,0.3)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.4rem' }}>
              👋 Welcome back, {student?.name || 'Student'}!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '13px' }}>
              {student?.enrollment_no} • {student?.department_name} • Semester {student?.semester}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Academic Year</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-light)' }}>{student?.academic_year}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <div className={`stat-icon ${attendanceColor === 'success' ? 'green' : attendanceColor === 'warning' ? 'yellow' : 'red'}`}>📋</div>
          <div className="stat-info">
            <div className="stat-value">{attendance.percentage}%</div>
            <div className="stat-label">Attendance</div>
            <div className="progress-bar" style={{ marginTop: '8px' }}>
              <div className={`progress-fill ${attendanceColor}`} style={{ width: `${attendance.percentage}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">💰</div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(fees.pending + fees.overdue)}</div>
            <div className="stat-label">Pending Fees</div>
            {fees.overdue > 0 && <div className="stat-change down">⚠️ Overdue: {formatCurrency(fees.overdue)}</div>}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">💳</div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(fees.paid)}</div>
            <div className="stat-label">Fees Paid</div>
            <div className="stat-change up">✅ This year</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">🏠</div>
          <div className="stat-info">
            <div className="stat-value">{hostel ? 'Allotted' : 'Day Scholar'}</div>
            <div className="stat-label">Hostel Status</div>
            {hostel && <div className="stat-change up">Room {hostel.room_no}</div>}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* No-Dues Status */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">✅ No-Dues Status</div>
              <div className="card-subtitle">Current verification progress</div>
            </div>
          </div>
          {noDues ? (
            <div>
              <div className="workflow-steps">
                {[
                  { label: 'Hostel', status: noDues.hostel_status, icon: '🏠' },
                  { label: 'Library', status: noDues.library_status, icon: '📚' },
                  { label: 'Accounts', status: noDues.accounts_status, icon: '💰' },
                  { label: 'Admin Approval', status: noDues.admin_status, icon: '👤' },
                ].map((step, i) => (
                  <div key={i} className="workflow-step">
                    <div className={`step-indicator ${step.status}`}>
                      {step.status === 'approved' ? '✓' : step.status === 'rejected' ? '✗' : i + 1}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.icon} {step.label}</div>
                      <div className="step-meta">
                        <span className={`badge ${getStatusBadgeClass(step.status)}`}>{getStatusLabel(step.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <span className={`badge ${getStatusBadgeClass(noDues.overall_status)}`}>
                  Overall: {getStatusLabel(noDues.overall_status)}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">📋</div>
              <h4>No Active Request</h4>
              <p>You haven't submitted a no-dues request yet.</p>
              <a href="/student/nodues" className="btn btn-primary btn-sm mt-4">Apply Now</a>
            </div>
          )}
        </div>

        {/* Gate Passes */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🚪 Gate Passes</div>
              <div className="card-subtitle">Recent gate pass requests</div>
            </div>
            <a href="/student/gatepass" className="btn btn-outline btn-sm">View All</a>
          </div>
          {gatePasses && gatePasses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gatePasses.map(gp => (
                <div key={gp.id} style={{ padding: '12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                  <div className="flex items-center justify-between">
                    <strong style={{ fontSize: '13px' }}>{gp.destination}</strong>
                    <span className={`badge ${getStatusBadgeClass(gp.status)}`}>{getStatusLabel(gp.status)}</span>
                  </div>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>{gp.reason}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{formatDate(gp.from_datetime, 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">🚪</div>
              <h4>No Gate Passes</h4>
              <a href="/student/gatepass" className="btn btn-primary btn-sm mt-4">Request Gate Pass</a>
            </div>
          )}
        </div>
      </div>

      {/* Results & Notifications */}
      <div className="content-grid">
        {/* Recent Results */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏆 Recent Results</div>
            <a href="/student/results" className="btn btn-outline btn-sm">View All</a>
          </div>
          {results && results.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Course</th><th>Exam</th><th>Marks</th><th>Grade</th></tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.course_name}</strong></td>
                      <td style={{ fontSize: '12px' }}>{r.exam_name}</td>
                      <td>{r.marks_obtained}/{r.max_marks}</td>
                      <td><span className={`badge ${r.grade?.startsWith('A') ? 'badge-success' : r.grade?.startsWith('B') ? 'badge-info' : 'badge-warning'}`}>{r.grade}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">📊</div>
              <h4>No Results Published</h4>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🔔 Notifications</div>
            <a href="/student/notifications" className="btn btn-outline btn-sm">View All</a>
          </div>
          {notifications && notifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  {!n.is_read && <div className="notif-dot" />}
                  <div className="notif-content">
                    <div className="notif-title-text">{n.title}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">🔔</div>
              <h4>No Notifications</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
