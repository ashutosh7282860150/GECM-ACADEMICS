import { useState, useEffect } from 'react';
import { dashboardAPI, feesAPI } from '../../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel, timeAgo } from '../../utils/helpers';

export default function AccountsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.accounts().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><h4>Failed to load</h4></div>;

  const { stats, recentPayments } = data;

  return (
    <div className="dashboard-grid">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(6,182,212,0.05))', borderColor: 'rgba(14,165,233,0.3)' }}>
        <h2>💰 Accounts Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Fee Management & Financial Reports</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon green">💰</div><div className="stat-info"><div className="stat-value">{formatCurrency(stats.totalCollected)}</div><div className="stat-label">Total Collected</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div className="stat-info"><div className="stat-value">{stats.pendingCount}</div><div className="stat-label">Pending Payments</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">💸</div><div className="stat-info"><div className="stat-value">{formatCurrency(stats.pendingAmount)}</div><div className="stat-label">Pending Amount</div></div></div>
        <div className="stat-card"><div className="stat-icon red">⚠️</div><div className="stat-info"><div className="stat-value">{formatCurrency(stats.overdueAmount)}</div><div className="stat-label">Overdue Amount</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">✅</div><div className="stat-info"><div className="stat-value">{stats.pendingNoDues}</div><div className="stat-label">Pending No-Dues</div><div className="mt-2"><a href="/accounts/nodues" className="btn btn-primary btn-sm">Verify Now</a></div></div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">💳 Recent Payments</div>
          <a href="/accounts/payments" className="btn btn-outline btn-sm">View All</a>
        </div>
        {recentPayments && recentPayments.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Student</th><th>Enrollment</th><th>Fee Type</th><th>Amount</th><th>Method</th><th>Receipt</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.student_name}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.enrollment_no}</td>
                    <td>{p.fee_type}</td>
                    <td><strong style={{ color: 'var(--success)' }}>{formatCurrency(p.amount)}</strong></td>
                    <td style={{ textTransform: 'capitalize', fontSize: '12px' }}>{p.payment_method}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{p.receipt_no}</td>
                    <td style={{ fontSize: '12px' }}>{timeAgo(p.created_at)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-state-icon">💳</div><h4>No recent payments</h4>
          </div>
        )}
      </div>
    </div>
  );
}
