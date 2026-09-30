import { useState, useEffect } from 'react';
import { noDuesAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass, getStatusLabel, timeAgo } from '../../utils/helpers';
import { QRCodeCanvas } from 'qrcode.react';
import ApplicationApprovalPdfModal from '../common/ApplicationApprovalPdfModal';
import toast from 'react-hot-toast';

const STEPS = [
  { key: 'hostel', label: 'Hostel Warden Verification', icon: '🏠', field: 'hostel_status' },
  { key: 'accounts', label: 'Fee Cell & Accounts Verification', icon: '💰', field: 'accounts_status' },
  { key: 'hod', label: 'HOD CSE Clearance', icon: '👨‍🏫', field: 'hod_status' },
  { key: 'faculty', label: 'Faculty & Lab Clearance', icon: '🔬', field: 'faculty_status' },
  { key: 'library', label: 'Central Library Verification', icon: '📚', field: 'library_status' },
  { key: 'admin', label: 'Administrator Final Signoff', icon: '🏛️', field: 'admin_status' },
];

export default function NoDuesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [form, setForm] = useState({ reason: '', requestType: 'graduation' });
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = () => {
    noDuesAPI.getAll()
      .then(res => setRequests(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.reason) { toast.error('Please provide a reason'); return; }
    setSubmitting(true);
    try {
      await noDuesAPI.create(form);
      toast.success('No-dues request submitted! 🎉');
      setCreateModal(false);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (nd) => {
    try {
      const res = await noDuesAPI.getById(nd.id);
      setDetailModal(res.data.data);
    } catch {
      setDetailModal(nd);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  const activeRequest = requests.find(r => ['pending', 'in_progress'].includes(r.overall_status));
  const completedRequests = requests.filter(r => r.overall_status === 'completed');

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">✅ No-Dues</h1>
          <p className="page-desc">Track your no-dues clearance through all departments</p>
        </div>
        {!activeRequest && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setCreateModal(true)} id="apply-nodues-btn">
              + Apply for No-Dues
            </button>
          </div>
        )}
      </div>

      {/* Active Request */}
      {activeRequest && (
        <div className="card" style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.05)' }}>
          <div className="card-header">
            <div>
              <div className="card-title">📋 Active No-Dues Request</div>
              <div className="card-subtitle">Submitted {timeAgo(activeRequest.created_at)}</div>
            </div>
            <div className="flex gap-2 items-center">
              <span className={`badge ${getStatusBadgeClass(activeRequest.overall_status)}`}>{getStatusLabel(activeRequest.overall_status)}</span>
              <button className="btn btn-outline btn-sm" onClick={() => openDetail(activeRequest)}>View Details</button>
            </div>
          </div>

          {/* Workflow Progress */}
          <div className="workflow-steps">
            {STEPS.map((step, i) => {
              const status = activeRequest[step.field] || 'pending';
              return (
                <div key={step.key} className="workflow-step">
                  <div className={`step-indicator ${status}`}>
                    {status === 'approved' ? '✓' : status === 'rejected' ? '✗' : i + 1}
                  </div>
                  <div className="step-content">
                    <div className="step-title">{step.icon} {step.label}</div>
                    <div className="step-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span className={`badge ${getStatusBadgeClass(status)}`}>{getStatusLabel(status)}</span>
                    </div>
                    {activeRequest[`${step.key}_remarks`] && (
                      <div className="step-remarks">"{activeRequest[`${step.key}_remarks`]}"</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Requests */}
      {completedRequests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏆 Completed Requests</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completedRequests.map(r => (
              <div key={r.id} style={{ padding: '14px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <strong>{r.request_type?.charAt(0).toUpperCase() + r.request_type?.slice(1)} No-Dues</strong>
                    <span className="badge badge-success">Completed ✓</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Submitted: {formatDate(r.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-success btn-sm" onClick={() => openDetail(r)}>📄 View Certificate</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No requests */}
      {requests.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h4>No Requests Found</h4>
            <p>Apply for a no-dues certificate when you need clearance from the college.</p>
            <button className="btn btn-primary mt-4" onClick={() => setCreateModal(true)}>Apply Now</button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <div className="modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✅ Apply for No-Dues</h3>
              <button className="modal-close" onClick={() => setCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label form-required">Request Type</label>
                <select className="form-control" value={form.requestType} onChange={e => setForm({ ...form, requestType: e.target.value })}>
                  <option value="graduation">Graduation Clearance</option>
                  <option value="internship">Internship Certificate</option>
                  <option value="transfer">Transfer Certificate</option>
                  <option value="scholarship">Scholarship Purpose</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-required">Reason</label>
                <textarea className="form-control" rows={3} placeholder="Briefly describe why you need the no-dues certificate..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
              </div>
              <div className="alert alert-info">
                <span className="alert-icon">ℹ️</span>
                <div className="alert-content">
                  <div className="alert-msg">Your request is dispatched in real-time to Administrator, HOD CSE, Hostel Warden, Fee Cell, All Faculty & Central Library for parallel digital approval.</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setCreateModal(false)}>Cancel</button>
                <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
                  {submitting ? '' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📋 No-Dues Details</h3>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Student Name', value: detailModal.student_name || detailModal.name },
                { label: 'Enrollment No', value: detailModal.enrollment_no },
                { label: 'Request Type', value: detailModal.request_type },
                { label: 'Department', value: detailModal.department_name },
                { label: 'Overall Status', value: <span className={`badge ${getStatusBadgeClass(detailModal.overall_status)}`}>{getStatusLabel(detailModal.overall_status)}</span> },
                { label: 'Submitted On', value: formatDate(detailModal.created_at) },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {detailModal.overall_status === 'completed' && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
                <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>Official No-Dues Clearance Certificate</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  This certifies that {detailModal.student_name || 'Arjun Patel'} has successfully cleared all clearance gates across Hostel, Library, Accounts, and Academic Administration.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <QRCodeCanvas value={JSON.stringify({ type: 'no_dues_cert', id: detailModal.id, student: detailModal.enrollment_no || 'CSE2021001', status: 'VERIFIED_CLEAR' })} size={120} level="H" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>Issued on {formatDate(detailModal.admin_verified_at || detailModal.updated_at)}</p>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => setShowPdfModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                >
                  📄 Print / Download Official Certificate (PDF)
                </button>
              </div>
            )}

            <div className="workflow-steps">
              {STEPS.map((step, i) => {
                const status = detailModal[step.field] || 'pending';
                return (
                  <div key={step.key} className="workflow-step">
                    <div className={`step-indicator ${status}`}>
                      {status === 'approved' ? '✓' : status === 'rejected' ? '✗' : i + 1}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.icon} {step.label}</div>
                      <span className={`badge ${getStatusBadgeClass(status)}`}>{getStatusLabel(status)}</span>
                      {detailModal[`${step.key}_remarks`] && (
                        <div className="step-remarks">"{detailModal[`${step.key}_remarks`]}"</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDetailModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Official No-Dues PDF Certificate Modal */}
      {showPdfModal && detailModal && (
        <ApplicationApprovalPdfModal
          app={{
            application_id: detailModal.id || 'ND-2026-CLEARANCE',
            type_name: 'Institutional No-Dues Clearance Certificate',
            student_name: detailModal.student_name || 'Arjun Patel',
            enrollment_no: detailModal.enrollment_no || 'CSE2021001',
            department_name: detailModal.department_name || 'Computer Science & Engineering',
            semester: 8,
            submitted_at: detailModal.created_at,
            reviewed_at: detailModal.admin_verified_at || detailModal.updated_at,
            assigned_department: 'Hostel, Library, Accounts & Admin Cell',
            form_data: {
              reason: 'Final Semester & Graduation No-Dues Institutional Clearance',
              clearanceGates: 'All 4 Departmental Gates Cleared & Approved'
            }
          }}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
