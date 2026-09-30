import { useState } from 'react';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import ApplicationApprovalPdfModal from './ApplicationApprovalPdfModal';
import toast from 'react-hot-toast';

export default function ApplicationDossierModal({ app, onClose, onReview, onClearanceUpdate, userRole }) {
  const [actionType, setActionType] = useState(null); // 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION'
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  if (!app) return null;

  const isReviewer = ['admin', 'faculty', 'hod', 'warden', 'accounts'].includes(userRole);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (actionType === 'REJECTED' && !rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    if (actionType === 'NEEDS_CORRECTION' && !correctionNote.trim()) {
      toast.error('Please enter details of the required correction.');
      return;
    }

    setSubmitting(true);
    try {
      await onReview(app.id, {
        action: actionType,
        comment,
        rejectionReason,
        correctionNote
      });
      setActionType(null);
    } catch (err) {
      toast.error('Review action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 className="modal-title">{app.type_name} Dossier</h3>
              <span className={`badge ${getStatusBadgeClass(app.current_status)}`}>
                {getStatusLabel(app.current_status)}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Application ID: <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{app.application_id}</strong> · Submitted: {formatDate(app.submitted_at, 'dd MMM yyyy, hh:mm a')}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Approved Official Certificate Banner */}
          {app.current_status === 'APPROVED' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #86efac',
                padding: '16px 20px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>📜</span>
                  <strong style={{ fontSize: '0.95rem', color: '#15803d' }}>
                    Application Officially Approved &amp; Sanctioned
                  </strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '2px' }}>
                  Your official GECM institutional certificate with digital QR verification code is generated and ready for print or download.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="btn btn-success"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  padding: '10px 18px',
                  boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
                }}
              >
                📄 Generate &amp; Download PDF Certificate
              </button>
            </div>
          )}

          {/* Student Profile Info */}
          <div style={{ background: 'var(--bg-3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--primary-light)' }}>👤 Student Profile</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong>{app.student_name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Roll / Reg No:</span> <span style={{ fontFamily: 'monospace' }}>{app.enrollment_no}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Department:</span> {app.department_name}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Semester:</span> Semester {app.semester}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {app.phone}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {app.email}</div>
            </div>
          </div>

          {/* Application Details */}
          <div style={{ background: 'var(--bg-3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--primary-light)' }}>📋 Application Form Details</h4>
            {app.form_data && typeof app.form_data === 'object' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
                {Object.entries(app.form_data).map(([key, val]) => {
                  if (key === 'uploadedFiles' || key === 'isDraft') return null;
                  return (
                    <div key={key} style={{ background: 'var(--surface)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div style={{ fontWeight: '600', marginTop: '2px', color: 'var(--text-primary)' }}>
                        {String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No form details recorded.</p>
            )}
          </div>

          {/* Correction Note / Rejection Reason Alert if applicable */}
          {app.correction_note && (
            <div className="alert alert-warning">
              <span className="alert-icon">⚠️</span>
              <div>
                <strong>Correction Requested:</strong>
                <div>{app.correction_note}</div>
              </div>
            </div>
          )}

          {app.rejection_reason && (
            <div className="alert alert-danger">
              <span className="alert-icon">❌</span>
              <div>
                <strong>Rejection Reason:</strong>
                <div>{app.rejection_reason}</div>
              </div>
            </div>
          )}

          {/* Multi-Department Clearance Matrix for No Dues */}
          {(app.type_code === 'GECM-ND' || (app.clearances && app.clearances.length > 0 && !['GECM-GP', 'GECM-LV', 'GECM-BF', 'GECM-CC'].includes(app.type_code))) && (
            <div style={{ background: 'var(--bg-3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', margin: 0, color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✅</span> Real-Time Multi-Department Clearance Matrix
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {app.clearances ? app.clearances.filter(c => c.status === 'APPROVED').length : 0} / {app.clearances ? app.clearances.length : 6} Cleared
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {(app.clearances || []).map(c => {
                  let deptIcon = '🏢';
                  const dName = c.department.toLowerCase();
                  if (dName.includes('hostel') || dName.includes('warden')) deptIcon = '🏠';
                  else if (dName.includes('account') || dName.includes('fee')) deptIcon = '💰';
                  else if (dName.includes('hod')) deptIcon = '👨‍🏫';
                  else if (dName.includes('faculty') || dName.includes('lab')) deptIcon = '🔬';
                  else if (dName.includes('library')) deptIcon = '📚';
                  else if (dName.includes('admin')) deptIcon = '🏛️';

                  // Determine if the currently logged-in reviewer is authorized to clear this specific card
                  let canClearCard = false;
                  if (userRole === 'admin') {
                    canClearCard = true; // Admin has institutional master clearance override
                  } else if (userRole === 'warden' && (dName.includes('hostel') || dName.includes('warden'))) {
                    canClearCard = true;
                  } else if (userRole === 'accounts' && (dName.includes('account') || dName.includes('fee'))) {
                    canClearCard = true;
                  } else if (userRole === 'hod' && (dName.includes('hod') || dName.includes('department'))) {
                    canClearCard = true;
                  } else if (userRole === 'faculty' && (dName.includes('faculty') || dName.includes('lab'))) {
                    canClearCard = true;
                  }

                  return (
                    <div
                      key={c.department}
                      style={{
                        padding: '14px',
                        background: canClearCard ? 'var(--surface)' : 'var(--bg-2)',
                        borderRadius: 'var(--radius-sm)',
                        border: canClearCard ? '1.5px solid var(--primary-light)' : '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                        boxShadow: canClearCard ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{deptIcon}</span>
                            <span>{c.department}</span>
                          </span>
                          <span className={`badge ${getStatusBadgeClass(c.status)}`} style={{ fontSize: '10px' }}>
                            {getStatusLabel(c.status)}
                          </span>
                        </div>
                        {c.verified_by && (
                          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                            ✓ Verified by: {c.verified_by}
                          </div>
                        )}
                        {c.remarks && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                            "{c.remarks}"
                          </div>
                        )}
                      </div>

                      {/* Only render active action buttons for the authorized department reviewer */}
                      {isReviewer && onClearanceUpdate && app.current_status !== 'APPROVED' && app.current_status !== 'REJECTED' && (
                        canClearCard ? (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              style={{ flex: 1, padding: '5px 8px', fontSize: '11px', fontWeight: 700 }}
                              onClick={() => onClearanceUpdate(app.id, c.department, 'APPROVED')}
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ flex: 1, padding: '5px 8px', fontSize: '11px', fontWeight: 700 }}
                              onClick={() => onClearanceUpdate(app.id, c.department, 'REJECTED')}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border)', fontStyle: 'italic' }}>
                            🔒 Assigned to {c.department}
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents Attachment List */}
          {app.documents && app.documents.length > 0 && (
            <div style={{ background: 'var(--bg-3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--primary-light)' }}>📎 Supporting Documents</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {app.documents.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px' }}>
                      📄 <strong>{doc.file_name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({doc.file_size})</span>
                    </div>
                    {doc.file_path && (
                      <a href={doc.file_path} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        Preview / Download 📥
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Workflow Timeline Tracker */}
          <div style={{ background: 'var(--bg-3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--primary-light)' }}>📍 Workflow Progress & Audit Timeline</h4>
            {app.workflow_timeline && app.workflow_timeline.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--primary)' }}>
                {app.workflow_timeline.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-23px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{step.step}</strong>
                      <span className={`badge ${getStatusBadgeClass(step.status)}`} style={{ fontSize: '10px' }}>{step.status}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      By: {step.performed_by || 'System'} · {formatDate(step.timestamp, 'dd MMM yyyy, hh:mm a')}
                    </div>
                    {step.comments && <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '4px' }}>"{step.comments}"</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Initial workflow pending.</p>
            )}
          </div>

          {/* Reviewer Action Bar */}
          {isReviewer && onReview && app.current_status !== 'APPROVED' && app.current_status !== 'REJECTED' && (
            <div style={{ background: 'var(--surface-2)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#ffffff' }}>⚡ Reviewer Action Panel</h4>

              {!actionType ? (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn btn-success" onClick={() => setActionType('APPROVED')}>
                    ✓ Approve Application
                  </button>
                  <button className="btn btn-warning" onClick={() => setActionType('NEEDS_CORRECTION')}>
                    ⚠️ Request Correction
                  </button>
                  <button className="btn btn-danger" onClick={() => setActionType('REJECTED')}>
                    ❌ Reject Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: actionType === 'APPROVED' ? '#10b981' : actionType === 'REJECTED' ? '#ef4444' : '#f59e0b' }}>
                    Action: {actionType.replace('_', ' ')}
                  </div>

                  {actionType === 'REJECTED' && (
                    <div className="form-group">
                      <label className="form-label form-required">Rejection Reason *</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="State clear official reason for rejection..."
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {actionType === 'NEEDS_CORRECTION' && (
                    <div className="form-group">
                      <label className="form-label form-required">Correction Note for Student *</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Specify which document or field needs correction..."
                        value={correctionNote}
                        onChange={e => setCorrectionNote(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Review Comment (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add official review notes..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setActionType(null)}>Cancel</button>
                    <button type="submit" className={`btn ${actionType === 'APPROVED' ? 'btn-success' : actionType === 'REJECTED' ? 'btn-danger' : 'btn-warning'} ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
                      {submitting ? '' : `Confirm ${actionType.replace('_', ' ')}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button className="btn btn-outline w-full" onClick={onClose}>Close Dossier</button>
        </div>
      </div>

      {showPdfModal && (
        <ApplicationApprovalPdfModal
          app={app}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
