import { useState, useEffect } from 'react';
import { noDuesAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass, getStatusLabel, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function NoDuesVerifyPage({ role }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('in_progress');
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = () => {
    noDuesAPI.getAll({ status: filter })
      .then(res => setRequests(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchRequests(); }, [filter]);

  // Determine which field this role verifies
  const getRoleField = () => {
    if (role === 'warden') return 'hostel_status';
    if (role === 'accounts') return 'accounts_status';
    if (role === 'hod') return 'hod_status';
    if (role === 'faculty') return 'faculty_status';
    if (role === 'admin') return 'admin_status';
    return 'library_status';
  };

  const roleField = getRoleField();

  const handleVerify = async (action) => {
    setProcessing(true);
    try {
      await noDuesAPI.verify(actionModal.id, { action, remarks });
      toast.success(`No-dues request ${action}!`);
      setActionModal(null);
      setRemarks('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const pendingForMe = requests.filter(r => (r[roleField] || 'pending') === 'pending').length;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">✅ No-Dues Verification</h1>
          <p className="page-desc">Review and verify student no-dues requests for your department ({role?.toUpperCase()})</p>
        </div>
        {pendingForMe > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: 0 }}>
            <span className="alert-icon">⚠️</span>
            <div className="alert-content"><div className="alert-msg">{pendingForMe} request(s) pending your verification</div></div>
          </div>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'in_progress', label: 'Active' },
          { key: 'pending', label: 'Pending' },
          { key: 'completed', label: 'Completed' },
          { key: 'rejected', label: 'Rejected' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h4>No requests found</h4>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Enrollment</th><th>Department</th>
                  <th>Request Type</th>
                  <th>Hostel</th><th>HOD</th><th>Faculty</th><th>Library</th><th>Accounts</th><th>Admin</th>
                  <th>Overall</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.student_name}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.enrollment_no}</td>
                    <td style={{ fontSize: '12px' }}>{r.department_name}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: '12px' }}>{r.request_type}</td>
                    <td><span className={`badge ${getStatusBadgeClass(r.hostel_status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.hostel_status)}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(r.hod_status || 'pending')}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.hod_status || 'pending')}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(r.faculty_status || 'pending')}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.faculty_status || 'pending')}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(r.library_status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.library_status)}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(r.accounts_status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.accounts_status)}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(r.admin_status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(r.admin_status)}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(r.overall_status)}`}>{getStatusLabel(r.overall_status)}</span></td>
                    <td style={{ fontSize: '12px' }}>{timeAgo(r.created_at)}</td>
                    <td>
                      {(r[roleField] === 'pending' || !r[roleField]) && (
                        <button className="btn btn-primary btn-sm" onClick={() => { setActionModal(r); setRemarks(''); }}>
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✅ Verify No-Dues Request</h3>
              <button className="modal-close" onClick={() => setActionModal(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Student', value: actionModal.student_name },
                { label: 'Enrollment No', value: actionModal.enrollment_no },
                { label: 'Department', value: actionModal.department_name },
                { label: 'Request Type', value: actionModal.request_type },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontWeight: '600', fontSize: '13px', textTransform: 'capitalize' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Status of all depts */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Multi-Department Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Hostel Warden', status: actionModal.hostel_status },
                  { label: 'HOD CSE', status: actionModal.hod_status || 'pending' },
                  { label: 'Faculty & Labs', status: actionModal.faculty_status || 'pending' },
                  { label: 'Central Library', status: actionModal.library_status },
                  { label: 'Fee Cell (Accounts)', status: actionModal.accounts_status },
                  { label: 'Administrator', status: actionModal.admin_status },
                ].map(d => (
                  <div key={d.label} style={{ textAlign: 'center', padding: '8px 12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{d.label}</div>
                    <span className={`badge ${getStatusBadgeClass(d.status)}`} style={{ fontSize: '10px' }}>{getStatusLabel(d.status)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks (Optional)</label>
              <textarea className="form-control" rows={3} placeholder="Any remarks or conditions for approval..." value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setActionModal(null)}>Cancel</button>
              <button className={`btn btn-danger ${processing ? 'btn-loading' : ''}`} onClick={() => handleVerify('rejected')} disabled={processing}>
                {processing ? '' : '✗ Reject'}
              </button>
              <button className={`btn btn-success ${processing ? 'btn-loading' : ''}`} onClick={() => handleVerify('approved')} disabled={processing} id="verify-approve-btn">
                {processing ? '' : '✓ Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
