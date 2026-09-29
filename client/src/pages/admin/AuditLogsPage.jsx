import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { timeAgo } from '../../utils/helpers';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAuditLogs()
      .then(res => setLogs(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🔍 Audit Logs</h1>
          <p className="page-desc">Complete system activity history</p>
        </div>
      </div>
      <div className="card">
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h4>No audit logs yet</h4>
            <p>System activities will be logged here as users interact with the platform.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>User</th><th>Action</th><th>Resource Type</th><th>IP Address</th><th>Time</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.user_name || 'System'}</strong></td>
                    <td style={{ fontSize: '13px' }}>{log.action}</td>
                    <td><span className="badge badge-muted" style={{ fontSize: '11px' }}>{log.resource_type || '—'}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.ip_address || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timeAgo(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
