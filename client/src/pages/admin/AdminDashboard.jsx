import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, formatDate, timeAgo } from '../../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: '13px', fontWeight: '600', color: p.color }}>
            {p.name}: {p.name === 'total' ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading admin dashboard...</span></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><h4>Failed to load dashboard</h4></div>;

  const { stats, charts, recentActivity } = data;

  const STAT_CARDS = [
    { label: 'Total Students', value: stats.totalStudents, icon: '🎓', color: 'blue', change: '+12% this year' },
    { label: 'Total Faculty', value: stats.totalFaculty, icon: '👨‍🏫', color: 'purple', change: '' },
    { label: 'Fee Collected', value: formatCurrency(stats.totalFeeCollected), icon: '💰', color: 'green', change: 'This year' },
    { label: 'Hostel Students', value: stats.hostelOccupancy, icon: '🏠', color: 'cyan', change: 'Currently residing' },
    { label: 'Pending No-Dues', value: stats.pendingNoDues, icon: '✅', color: 'yellow', change: 'Awaiting action', link: '/admin/nodues' },
    { label: 'Pending Gate Passes', value: stats.pendingGatePasses, icon: '🚪', color: 'red', change: 'Awaiting warden', link: '/admin/gatepass' },
  ];

  return (
    <div className="dashboard-grid">
      {/* Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', borderColor: 'rgba(99,102,241,0.3)' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans' }}>🏛️ Administration Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>SmartCampus ERP – Complete System Overview</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>System Status</div>
            <div className="flex items-center gap-2 mt-2">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '600' }}>All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="stat-card" style={{ cursor: s.link ? 'pointer' : 'default' }} onClick={() => s.link && (window.location.href = s.link)}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              {s.change && <div className="stat-change up" style={{ color: 'var(--text-muted)' }}>{s.change}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="content-grid">
        {/* Fee Collection Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Fee Collection (Last 6 Months)</div>
          </div>
          {charts.feeByMonth && charts.feeByMonth.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.feeByMonth}>
                  <defs>
                    <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" name="total" stroke="#6366f1" fill="url(#feeGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">📊</div>
              <h4>No fee data for chart</h4>
              <p>Fee payment data will appear here once students pay.</p>
            </div>
          )}
        </div>

        {/* Department Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏛️ Students by Department</div>
          </div>
          {charts.departmentStudents && charts.departmentStudents.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.departmentStudents} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={90} label={({ department, count }) => `${department?.split(' ')[0]}: ${count}`} labelLine={{ stroke: '#64748b' }}>
                    {charts.departmentStudents.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, 'Students']} />
                  <Legend formatter={(v) => <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">🏛️</div>
              <h4>No department data</h4>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">⚡ Quick Actions</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Manage Users', icon: '👥', path: '/admin/users', color: '#6366f1' },
            { label: 'View No-Dues', icon: '✅', path: '/admin/nodues', color: '#10b981' },
            { label: 'Gate Passes', icon: '🚪', path: '/admin/gatepass', color: '#f59e0b' },
            { label: 'Fee Reports', icon: '💰', path: '/admin/fees', color: '#0ea5e9' },
            { label: 'Departments', icon: '🏛️', path: '/admin/departments', color: '#8b5cf6' },
            { label: 'Audit Logs', icon: '🔍', path: '/admin/audit', color: '#ef4444' },
          ].map(action => (
            <a key={action.path} href={action.path} style={{ padding: '16px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', textDecoration: 'none', transition: 'var(--transition)', display: 'block' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = action.color + '15'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{action.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>{action.label}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🔍 Recent Activity</div>
          <a href="/admin/audit" className="btn btn-outline btn-sm">View All Logs</a>
        </div>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>User</th><th>Action</th><th>Resource</th><th>Time</th></tr>
              </thead>
              <tbody>
                {recentActivity.slice(0, 8).map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.user_name || 'System'}</strong></td>
                    <td>{log.action}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.resource_type}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timeAgo(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-state-icon">🔍</div>
            <h4>No activity yet</h4>
          </div>
        )}
      </div>
    </div>
  );
}
