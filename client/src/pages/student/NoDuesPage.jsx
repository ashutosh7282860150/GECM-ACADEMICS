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
  const [activeFilter, setActiveFilter] = useState('all');
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

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.reason) { toast.error('Please provide a reason'); return; }
    setSubmitting(true);
    try {
      await noDuesAPI.create(form);
      toast.success('No-dues request submitted! Real-time alerts sent to all 6 departments. 🚀');
      setCreateModal(false);
      setForm({ reason: '', requestType: 'graduation' });
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
      setDetailModal(res.data.data || nd);
    } catch {
      setDetailModal(nd);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading no-dues records...</span></div>;

  const inProgressCount = requests.filter(r => ['pending', 'in_progress', 'under_verification'].includes(r.overall_status?.toLowerCase())).length;
  const completedCount = requests.filter(r => ['completed', 'approved'].includes(r.overall_status?.toLowerCase())).length;
  const rejectedCount = requests.filter(r => r.overall_status?.toLowerCase() === 'rejected').length;

  const filteredRequests = requests.filter(r => {
    const s = r.overall_status?.toLowerCase();
    if (activeFilter === 'in_progress') return ['pending', 'in_progress', 'under_verification'].includes(s);
    if (activeFilter === 'completed') return ['completed', 'approved'].includes(s);
    if (activeFilter === 'rejected') return s === 'rejected';
    return true;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0', textTransform: 'uppercase' }}>
              ACADEMIC CLEARANCES &amp; CERTIFICATION
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              No-Dues Multi-Department Clearance Portal
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Real-time parallel clearance across Administrator, HOD CSE, Hostel Warden, Fee Cell, All Faculty &amp; Central Library.
            </p>
          </div>

          <button className="gov-btn-primary" onClick={() => setCreateModal(true)} id="apply-nodues-btn">
            ➕ Apply For No-Dues Clearance
          </button>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📋</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b1d3a' }}>{requests.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Applications (History)</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⏳</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>{inProgressCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Under Department Review</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏆</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>{completedCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Certified &amp; Cleared</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>❌</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c' }}>{rejectedCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Rejected Requests</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All History (${requests.length})` },
          { key: 'in_progress', label: `⏳ Active / In Progress (${inProgressCount})` },
          { key: 'completed', label: `🏆 Certified & Completed (${completedCount})` },
          { key: 'rejected', label: `❌ Rejected (${rejectedCount})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: activeFilter === tab.key ? '1px solid #0b1d3a' : '1px solid #e2e8f0',
              background: activeFilter === tab.key ? '#0b1d3a' : '#ffffff',
              color: activeFilter === tab.key ? '#ffffff' : '#334155',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main History Table / Cards */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span> No-Dues Applications History &amp; Multi-Department Records
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              🏛️ Institutional clearance history across all semesters, degrees, internships, and session renewals.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#15803d', background: '#f0fdf4', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', fontWeight: 700 }}>
            <span>⚡ Live Multi-Department Synchronization</span>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1d3a' }}>No Records in Selected Filter</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>No applications match this filter tab. Select "All History" or apply for a new clearance.</p>
            <button className="gov-btn-primary" style={{ marginTop: '14px' }} onClick={() => setCreateModal(true)}>
              ➕ Apply for No-Dues
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRequests.map(nd => {
              const isCompleted = ['completed', 'approved'].includes(nd.overall_status?.toLowerCase());
              const isInProgress = ['pending', 'in_progress', 'under_verification'].includes(nd.overall_status?.toLowerCase());
              const isRejected = nd.overall_status?.toLowerCase() === 'rejected';

              const clearedCount = STEPS.filter(s => (nd[s.field] || '').toLowerCase() === 'approved').length;

              return (
                <div
                  key={nd.id}
                  style={{
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isCompleted ? '#86efac' : isRejected ? '#fca5a5' : '#cbd5e1',
                    background: isCompleted ? '#f9fdfa' : isRejected ? '#fffafa' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* Top Header of Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '4px', background: '#0b1d3a', color: '#ffffff', letterSpacing: '0.5px' }}>
                          {nd.request_number || ('ND-' + nd.id)}
                        </span>
                        <strong style={{ fontSize: '1.1rem', color: '#0b1d3a' }}>
                          {nd.request_type ? nd.request_type.toUpperCase() + ' CLEARANCE' : 'NO DUES CLEARANCE'}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: isCompleted ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                            color: isCompleted ? '#15803d' : isRejected ? '#b91c1c' : '#b45309',
                            border: isCompleted ? '1px solid #86efac' : isRejected ? '1px solid #fca5a5' : '1px solid #fcd34d'
                          }}
                        >
                          {isInProgress && `⏳ In Progress (${clearedCount}/6 Cleared)`}
                          {isCompleted && '🏆 Officially Approved & Issued'}
                          {isRejected && '❌ Rejected'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '6px' }}>
                        <strong>Reason / Purpose:</strong> {nd.reason}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'right' }}>
                      <div>Submitted: <strong>{formatDate(nd.created_at, 'dd MMM yyyy')}</strong></div>
                      <div>Semester: <strong>Semester {nd.semester || 7}</strong></div>
                    </div>
                  </div>

                  {/* 6-Department Clearance Matrix Badges */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0b1d3a', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>🏛️ Clearance Department Matrix</span>
                      <span style={{ color: isCompleted ? '#16a34a' : '#475569' }}>{clearedCount} / 6 Cleared</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                      {STEPS.map(st => {
                        const sVal = (nd[st.field] || 'pending').toLowerCase();
                        const sApproved = sVal === 'approved';
                        const sRejected = sVal === 'rejected';

                        return (
                          <div
                            key={st.key}
                            style={{
                              background: '#ffffff',
                              border: `1px solid ${sApproved ? '#86efac' : sRejected ? '#fca5a5' : '#cbd5e1'}`,
                              borderRadius: '4px',
                              padding: '6px 10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.74rem'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#1e293b' }}>
                              <span>{st.icon}</span>
                              <span>{st.label.split(' ')[0]}</span>
                            </span>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: '0.68rem',
                                color: sApproved ? '#15803d' : sRejected ? '#b91c1c' : '#b45309',
                                background: sApproved ? '#dcfce7' : sRejected ? '#fee2e2' : '#fef3c7',
                                padding: '1px 6px',
                                borderRadius: '3px'
                              }}
                            >
                              {sApproved ? 'CLEARED' : sRejected ? 'REJECTED' : 'PENDING'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remarks alert if rejected */}
                  {isRejected && (nd.hostel_remarks || nd.admin_remarks) && (
                    <div style={{ fontSize: '0.8rem', padding: '8px 12px', background: '#fee2e2', borderRadius: '4px', color: '#991b1b', borderLeft: '3px solid #ef4444' }}>
                      <strong>Rejection Reason:</strong> {nd.hostel_remarks || nd.admin_remarks}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button
                      className="gov-btn-outline"
                      style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                      onClick={() => openDetail(nd)}
                    >
                      🔍 View Clearance Dossier
                    </button>
                    {isCompleted && (
                      <button
                        className="gov-btn-primary"
                        style={{ fontSize: '0.82rem', padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => {
                          setDetailModal(nd);
                          setShowPdfModal(true);
                        }}
                      >
                        📄 Download Verified PDF Certificate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModal && (
        <div className="modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✅ Apply for No-Dues Clearance</h3>
              <button className="modal-close" onClick={() => setCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label form-required">Request Purpose / Category</label>
                <select className="form-control" value={form.requestType} onChange={e => setForm({ ...form, requestType: e.target.value })}>
                  <option value="graduation">🎓 Graduation &amp; Degree Release</option>
                  <option value="internship">💼 Internship &amp; External NOC</option>
                  <option value="scholarship">📜 Scholarship &amp; Fee Concession</option>
                  <option value="transfer">📄 Transfer Certificate (TC)</option>
                  <option value="other">📌 Other Academic Clearance</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-required">Detailed Reason &amp; Remarks</label>
                <textarea className="form-control" rows={3} placeholder="Briefly describe why you need the no-dues certificate..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
              </div>
              <div className="alert alert-info">
                <span className="alert-icon">ℹ️</span>
                <div className="alert-content">
                  <div className="alert-msg">Your request is dispatched in real-time to Administrator, HOD CSE, Hostel Warden, Fee Cell, All Faculty &amp; Central Library for parallel digital approval. All historical applications remain permanently in your portal.</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setCreateModal(false)}>Cancel</button>
                <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
                  {submitting ? '' : 'Submit Application →'}
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
              <h3 className="modal-title">📋 No-Dues Clearance Dossier ({detailModal.request_number || detailModal.id})</h3>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Student Name', value: detailModal.student_name || 'Arjun Patel' },
                { label: 'Enrollment No', value: detailModal.enrollment_no || 'CSE2021001' },
                { label: 'Request Type', value: (detailModal.request_type || 'Graduation').toUpperCase() },
                { label: 'Department', value: detailModal.department_name || 'Computer Science & Engineering' },
                { label: 'Overall Status', value: <span className={`badge ${getStatusBadgeClass(detailModal.overall_status)}`}>{getStatusLabel(detailModal.overall_status)}</span> },
                { label: 'Submitted On', value: formatDate(detailModal.created_at) },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {['completed', 'approved'].includes(detailModal.overall_status?.toLowerCase()) && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
                <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>Official No-Dues Clearance Certificate</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  This certifies that {detailModal.student_name || 'Arjun Patel'} has successfully cleared all clearance gates across Administrator, HOD CSE, Hostel Warden, Fee Cell, All Faculty, and Central Library.
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
                const status = (detailModal[step.field] || 'pending').toLowerCase();
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
                      {detailModal[`${step.key}_verified_by`] && (
                        <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                          ✓ Verified by: {detailModal[`${step.key}_verified_by`]}
                        </div>
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
            application_id: detailModal.request_number || detailModal.id || 'ND-2026-CLEARANCE',
            type_name: 'Institutional No-Dues Clearance Certificate',
            type_code: 'GECM-ND',
            student_name: detailModal.student_name || 'Arjun Patel',
            enrollment_no: detailModal.enrollment_no || 'CSE2021001',
            department_name: detailModal.department_name || 'Computer Science & Engineering',
            semester: detailModal.semester || 8,
            submitted_at: detailModal.created_at,
            reviewed_at: detailModal.admin_verified_at || detailModal.updated_at,
            assigned_department: 'Administrator, HOD CSE, Hostel Warden, Fee Cell, Faculty & Library',
            clearances: [
              { department: 'Administrator', status: 'APPROVED', verified_by: detailModal.admin_verified_by || 'Dr. Ramesh Kumar (ADMIN)' },
              { department: 'HOD CSE (Department)', status: 'APPROVED', verified_by: detailModal.hod_verified_by || 'Prof. Anita Sharma (HOD CSE)' },
              { department: 'Hostel Warden', status: 'APPROVED', verified_by: detailModal.hostel_verified_by || 'Mr. Suresh Patel (WARDEN)' },
              { department: 'Fee Cell (Accounts)', status: 'APPROVED', verified_by: detailModal.accounts_verified_by || 'Mrs. Priya Mehta (ACCOUNTS)' },
              { department: 'Faculty & Labs', status: 'APPROVED', verified_by: detailModal.faculty_verified_by || 'Dr. Vikram Singh (FACULTY)' },
              { department: 'Central Library', status: 'APPROVED', verified_by: detailModal.library_verified_by || 'Dr. Ramesh Kumar (LIBRARY)' }
            ],
            form_data: {
              reason: detailModal.reason || 'Final Semester & Graduation No-Dues Institutional Clearance',
              clearanceGates: 'All 6 Departmental Clearance Gates Cleared & Approved'
            }
          }}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
