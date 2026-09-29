import { useState } from 'react';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ApplicationDossierModal({ app, onClose, onReview, onClearanceUpdate, userRole }) {
  const [actionType, setActionType] = useState(null); // 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION'
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

          {/* Department Clearance Matrix for No Dues */}
          {app.clearances && app.clearances.length > 0 && (
            <div style={{ background: 'var(--bg-3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--primary-light)' }}>✅ Multi-Department Clearance Matrix</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {app.clearances.map(c => (
                  <div key={c.department} style={{ padding: '12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>{c.department}</div>
                    <span className={`badge ${getStatusBadgeClass(c.status)}`} style={{ fontSize: '11px' }}>{getStatusLabel(c.status)}</span>
                    {c.remarks && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>{c.remarks}</div>}
                    {isReviewer && onClearanceUpdate && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'center' }}>
                        <button className="btn btn-success btn-sm" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => onClearanceUpdate(app.id, c.department, 'APPROVED')}>✓ Clear</button>
                        <button className="btn btn-danger btn-sm" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => onClearanceUpdate(app.id, c.department, 'REJECTED')}>✗ Reject</button>
                      </div>
                    )}
                  </div>
                ))}
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
    </div>
  );
}
