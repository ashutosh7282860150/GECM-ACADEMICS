import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, formatDate, timeAgo } from '../../utils/helpers';

export default function WardenDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.warden().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><h4>Failed to load</h4></div>;

  const { stats, recentGatePasses } = data;

  return (
    <div className="dashboard-grid">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.05))', borderColor: 'rgba(245,158,11,0.3)' }}>
        <h2>🏨 Warden Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Hostel & Gate Pass Management</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">🏠</div><div className="stat-info"><div className="stat-value">{stats.hostelStudents}</div><div className="stat-label">Hostel Students</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div className="stat-info"><div className="stat-value">{stats.pendingGatePasses}</div><div className="stat-label">Pending Gate Passes</div></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><div className="stat-value">{stats.approvedToday}</div><div className="stat-label">Approved Today</div></div></div>
        <div className="stat-card"><div className="stat-icon purple">📋</div><div className="stat-info"><div className="stat-value">{stats.pendingNoDues}</div><div className="stat-label">Pending No-Dues</div></div></div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚪 Recent Gate Passes</div>
            <a href="/warden/gatepass" className="btn btn-primary btn-sm">Manage All</a>
          </div>
          {recentGatePasses && recentGatePasses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentGatePasses.slice(0, 5).map(gp => (
                <div key={gp.id} style={{ padding: '12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <strong style={{ fontSize: '13px' }}>{gp.student_name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>{gp.enrollment_no}</span>
                    </div>
                    <span className={`badge badge-${gp.status === 'pending' ? 'warning' : gp.status === 'approved' ? 'success' : 'danger'}`} style={{ fontSize: '10px' }}>{gp.status}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{gp.destination} · {timeAgo(gp.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">🚪</div><h4>No gate passes</h4>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">✅ No-Dues Actions</div>
            <a href="/warden/nodues" className="btn btn-primary btn-sm">Verify Now</a>
          </div>
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="empty-state-icon">📋</div>
            <h4>{stats.pendingNoDues} pending verification{stats.pendingNoDues !== 1 ? 's' : ''}</h4>
            <p>Click "Verify Now" to review hostel dues for students.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
