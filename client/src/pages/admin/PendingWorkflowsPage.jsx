import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass, getStatusLabel, timeAgo } from '../../utils/helpers';

export default function PendingWorkflowsPage() {
  const [data, setData] = useState({ noDues: [], gatePasses: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('nodues');

  const fetchWorkflows = () => {
    adminAPI.getPendingWorkflows()
      .then(res => setData(res.data.data || { noDues: [], gatePasses: [] }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 3500);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">⚙️ Pending Workflows</h1>
          <p className="page-desc">Monitor all pending approvals across the system</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon yellow">✅</div><div className="stat-info"><div className="stat-value">{data.noDues.length}</div><div className="stat-label">Pending No-Dues</div></div></div>
        <div className="stat-card"><div className="stat-icon red">🚪</div><div className="stat-info"><div className="stat-value">{data.gatePasses.length}</div><div className="stat-label">Pending Gate Passes</div></div></div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setTab('nodues')} className={`btn ${tab === 'nodues' ? 'btn-primary' : 'btn-outline'}`}>✅ No-Dues ({data.noDues.length})</button>
        <button onClick={() => setTab('gatepass')} className={`btn ${tab === 'gatepass' ? 'btn-primary' : 'btn-outline'}`}>🚪 Gate Passes ({data.gatePasses.length})</button>
      </div>

      {tab === 'nodues' && (
        <div className="card">
          {data.noDues.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div><h4>No pending no-dues requests</h4></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Student</th><th>Enrollment</th><th>Type</th><th>Hostel</th><th>Library</th><th>Accounts</th><th>Admin</th><th>Submitted</th></tr></thead>
                <tbody>
                  {data.noDues.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.student_name}</strong></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.enrollment_no}</td>
                      <td style={{ textTransform: 'capitalize', fontSize: '12px' }}>{r.request_type}</td>
                      <td><span className={`badge ${getStatusBadgeClass(r.hostel_status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.hostel_status)}</span></td>
                      <td><span className={`badge ${getStatusBadgeClass(r.library_status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.library_status)}</span></td>
                      <td><span className={`badge ${getStatusBadgeClass(r.accounts_status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.accounts_status)}</span></td>
                      <td><span className={`badge ${getStatusBadgeClass(r.admin_status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.admin_status)}</span></td>
                      <td style={{ fontSize: '12px' }}>{timeAgo(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'gatepass' && (
        <div className="card">
          {data.gatePasses.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🚪</div><h4>No pending gate passes</h4></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Student</th><th>Enrollment</th><th>Destination</th><th>From</th><th>To</th><th>Submitted</th></tr></thead>
                <tbody>
                  {data.gatePasses.map(gp => (
                    <tr key={gp.id}>
                      <td><strong>{gp.student_name}</strong></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{gp.enrollment_no}</td>
                      <td>{gp.destination}</td>
                      <td style={{ fontSize: '12px' }}>{formatDate(gp.from_datetime, 'dd MMM, hh:mm a')}</td>
                      <td style={{ fontSize: '12px' }}>{formatDate(gp.to_datetime, 'dd MMM, hh:mm a')}</td>
                      <td style={{ fontSize: '12px' }}>{timeAgo(gp.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
