import { useState, useEffect } from 'react';
import { gatePassAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function GatePassPage() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [form, setForm] = useState({ reason: '', destination: '', fromDatetime: '', toDatetime: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPasses = () => {
    gatePassAPI.getAll()
      .then(res => setPasses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPasses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.reason || !form.destination || !form.fromDatetime || !form.toDatetime) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await gatePassAPI.create(form);
      toast.success('Gate pass submitted! Direct request sent to Warden Dashboard for approval. 🚀');
      setCreateModal(false);
      setForm({ reason: '', destination: '', fromDatetime: '', toDatetime: '' });
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading gate passes...</span></div>;

  const pendingCount = passes.filter(p => p.status === 'pending').length;
  const approvedCount = passes.filter(p => p.status === 'approved').length;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🚪 Student Gate Pass</h1>
          <p className="page-desc">Submit outpass requests directly to the Warden & receive your digital QR code upon approval</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCreateModal(true)} id="new-gatepass-btn">
            + New Gate Pass Request
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">📋</div><div className="stat-info"><div className="stat-value">{passes.length}</div><div className="stat-label">Total Requests</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div className="stat-info"><div className="stat-value">{pendingCount}</div><div className="stat-label">Pending Approval</div></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><div className="stat-value">{approvedCount}</div><div className="stat-label">Approved QR Passes</div></div></div>
      </div>

      <div className="card">
        {passes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚪</div>
            <h4>No Gate Pass Requests</h4>
            <p>Submit your application to automatically forward it to the Warden Dashboard for approval.</p>
            <button className="btn btn-primary mt-4" onClick={() => setCreateModal(true)}>Request Gate Pass</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {passes.map(gp => (
              <div key={gp.id} style={{ padding: '16px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <strong style={{ fontSize: '15px' }}>{gp.destination}</strong>
                    <span className={`badge ${getStatusBadgeClass(gp.status)}`}>
                      {gp.status === 'pending' ? '⏳ Sent to Warden Dashboard' : getStatusLabel(gp.status)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{gp.reason}</p>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>📅 From: {formatDate(gp.from_datetime, 'dd MMM yyyy, hh:mm a')}</span>
                    <span>📅 To: {formatDate(gp.to_datetime, 'dd MMM yyyy, hh:mm a')}</span>
                  </div>
                  {gp.remarks && <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '6px', color: 'var(--text-secondary)' }}>Warden Remarks: {gp.remarks}</p>}
                </div>

                {/* Show QR Code button for all approved passes */}
                {gp.status === 'approved' && (
                  <button className="btn btn-primary btn-sm" onClick={() => setQrModal(gp)} id={`qr-btn-${gp.id}`}>
                    📱 Receive & Show QR Pass
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModal && (
        <div className="modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🚪 Request Gate Pass</h3>
              <button className="modal-close" onClick={() => setCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label form-required">Reason for Leaving</label>
                <input type="text" className="form-control" placeholder="e.g., Medical appointment, Family function" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label form-required">Destination</label>
                <input type="text" className="form-control" placeholder="e.g., City Hospital, Home - Madhubani" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Leaving Date & Time</label>
                  <input type="datetime-local" className="form-control" value={form.fromDatetime} onChange={e => setForm({ ...form, fromDatetime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label form-required">Return Date & Time</label>
                  <input type="datetime-local" className="form-control" value={form.toDatetime} onChange={e => setForm({ ...form, toDatetime: e.target.value })} required />
                </div>
              </div>
              <div className="alert alert-info">
                <span className="alert-icon">ℹ️</span>
                <div className="alert-content">
                  <div className="alert-msg">After submission, your form is sent directly to the Warden Gate Pass Dashboard for approval. Upon approval, you will receive a unique QR code pass.</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setCreateModal(false)}>Cancel</button>
                <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} disabled={submitting} id="submit-gatepass-btn">
                  {submitting ? '' : 'Submit Direct to Warden →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📱 Official Gate Pass QR Code</h3>
              <button className="modal-close" onClick={() => setQrModal(null)}>✕</button>
            </div>

            <div className="qr-container">
              <div className="qr-wrapper">
                {qrModal.qr_code ? (
                  <img src={qrModal.qr_code} alt="Gate Pass QR Code" style={{ width: '220px', height: '220px', objectFit: 'contain' }} />
                ) : (
                  <QRCodeCanvas
                    value={qrModal.qr_data || JSON.stringify({ id: qrModal.id, destination: qrModal.destination })}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <strong style={{ fontSize: '15px' }}>{qrModal.destination}</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Valid: {formatDate(qrModal.from_datetime, 'dd MMM hh:mm a')} – {formatDate(qrModal.to_datetime, 'dd MMM hh:mm a')}
                </p>
                <span className={`badge ${getStatusBadgeClass(qrModal.status)} mt-2`}>Approved by Warden ✅</span>
              </div>
            </div>

            <div className="alert alert-success mt-4">
              <span className="alert-icon">✅</span>
              <div className="alert-content">
                <div className="alert-msg">Present this QR code to the Security Guard at the gate for exit verification.</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline w-full" onClick={() => setQrModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
