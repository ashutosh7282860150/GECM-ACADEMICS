import { useState, useEffect, useRef } from 'react';
import { gatePassAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass, getStatusLabel, timeAgo } from '../../utils/helpers';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';

export default function WardenGatePassPage() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  // Security Scanner States
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [manualQrInput, setManualQrInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const scannerRef = useRef(null);

  const fetchPasses = () => {
    gatePassAPI.getAll({ status: filter })
      .then(res => setPasses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchPasses(); }, [filter]);

  const handleAction = async (action) => {
    setProcessing(true);
    try {
      if (action === 'approve') {
        await gatePassAPI.approve(actionModal.id, { remarks });
        toast.success('Gate pass approved and unique QR code generated! ✅');
      } else {
        if (!remarks) { toast.error('Please provide a reason for rejection'); setProcessing(false); return; }
        await gatePassAPI.reject(actionModal.id, { remarks });
        toast.success('Gate pass rejected.');
      }
      setActionModal(null);
      setRemarks('');
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  // Verify QR Payload
  const handleVerifyQR = async (qrDataString) => {
    if (!qrDataString) {
      toast.error('Please enter QR data or scan QR code');
      return;
    }
    setVerifying(true);
    try {
      const res = await gatePassAPI.verifyQR(qrDataString);
      setVerificationResult(res.data.data);
      if (res.data.data?.isValid) {
        toast.success('✅ Valid Gate Pass - Student Cleared for Exit!');
      } else {
        toast.error('❌ Invalid or Expired Gate Pass!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'QR Verification failed');
      setVerificationResult(null);
    } finally {
      setVerifying(false);
    }
  };

  // Initialize camera scanner when modal opens
  useEffect(() => {
    if (showScannerModal) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scanner.render(
        (decodedText) => {
          handleVerifyQR(decodedText);
          scanner.clear();
        },
        (error) => {
          // Ignore scanning errors
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [showScannerModal]);

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🚪 Gate Pass Management</h1>
          <p className="page-desc">Approve student applications, generate unique QR passes, and verify security exit clearance</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setShowScannerModal(true); setVerificationResult(null); }}>
            🔍 Security Guard QR Scanner
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'pending', label: 'Pending Approval', color: 'var(--warning)' },
          { key: 'approved', label: 'Approved & QR Issued', color: 'var(--success)' },
          { key: 'rejected', label: 'Rejected', color: 'var(--danger)' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderColor: filter === tab.key ? '' : tab.color, color: filter === tab.key ? '' : tab.color }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : passes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚪</div>
            <h4>No {filter} gate passes</h4>
            <p>Student gate pass applications will appear here for review.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Enrollment No</th>
                  <th>Destination</th>
                  <th>Reason</th>
                  <th>Leaving Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {passes.map(gp => (
                  <tr key={gp.id}>
                    <td><strong>{gp.student_name}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{gp.enrollment_no}</td>
                    <td>{gp.destination}</td>
                    <td style={{ fontSize: '12px', maxWidth: '150px' }}>{gp.reason}</td>
                    <td style={{ fontSize: '12px' }}>{formatDate(gp.from_datetime, 'dd MMM, hh:mm a')}</td>
                    <td style={{ fontSize: '12px' }}>{formatDate(gp.to_datetime, 'dd MMM, hh:mm a')}</td>
                    <td><span className={`badge ${getStatusBadgeClass(gp.status)}`}>{getStatusLabel(gp.status)}</span></td>
                    <td>
                      {gp.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="btn btn-success btn-sm" onClick={() => { setActionModal({ ...gp, type: 'approve' }); setRemarks(''); }}>
                            ✓ Approve & Issue QR
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setActionModal({ ...gp, type: 'reject' }); setRemarks(''); }}>
                            ✗ Reject
                          </button>
                        </div>
                      )}
                      {gp.status === 'approved' && (
                        <button className="btn btn-outline btn-sm" onClick={() => { handleVerifyQR(gp.qr_data || JSON.stringify({ id: gp.id })); setShowScannerModal(true); }}>
                          📱 View QR Pass
                        </button>
                      )}
                      {gp.status === 'rejected' && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timeAgo(gp.updated_at)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Approval/Rejection Modal */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{actionModal.type === 'approve' ? '✅ Approve & Issue Unique QR Pass' : '❌ Reject Gate Pass'}</h3>
              <button className="modal-close" onClick={() => setActionModal(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
              <div className="flex justify-between mb-2"><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Student</span><strong>{actionModal.student_name}</strong></div>
              <div className="flex justify-between mb-2"><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Enrollment No</span><span style={{ fontFamily: 'monospace' }}>{actionModal.enrollment_no}</span></div>
              <div className="flex justify-between mb-2"><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Destination</span><span>{actionModal.destination}</span></div>
              <div className="flex justify-between mb-2"><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>From</span><span style={{ fontSize: '12px' }}>{formatDate(actionModal.from_datetime, 'dd MMM, hh:mm a')}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>To</span><span style={{ fontSize: '12px' }}>{formatDate(actionModal.to_datetime, 'dd MMM, hh:mm a')}</span></div>
            </div>

            <div className="form-group">
              <label className="form-label">{actionModal.type === 'reject' ? 'Reason for Rejection *' : 'Approval Remarks (Optional)'}</label>
              <textarea className="form-control" rows={3} placeholder={actionModal.type === 'reject' ? 'Provide reason for rejection...' : 'Any additional remarks...'} value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>

            {actionModal.type === 'approve' && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <div className="alert-content">
                  <div className="alert-msg">Upon approval, a unique QR code will be generated and instantly sent to the student dashboard for guard verification.</div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setActionModal(null)}>Cancel</button>
              <button
                className={`btn ${actionModal.type === 'approve' ? 'btn-success' : 'btn-danger'} ${processing ? 'btn-loading' : ''}`}
                onClick={() => handleAction(actionModal.type)}
                disabled={processing}
                id={`${actionModal.type}-gatepass-btn`}
              >
                {processing ? '' : actionModal.type === 'approve' ? 'Approve & Issue Unique QR' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Guard QR Scanner & Verification Modal */}
      {showScannerModal && (
        <div className="modal-overlay" onClick={() => setShowScannerModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">🔍 Security Guard QR Verification</h3>
              <button className="modal-close" onClick={() => setShowScannerModal(false)}>✕</button>
            </div>

            {/* Webcam Scanner */}
            <div style={{ marginBottom: '20px', textAlignment: 'center' }}>
              <div id="qr-reader" style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }} />
            </div>

            {/* Manual QR Data Verification */}
            <div className="form-group">
              <label className="form-label">Or Paste / Enter QR Code Data String</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder='e.g. {"id":"...", "studentId":"..."}'
                  value={manualQrInput}
                  onChange={(e) => setManualQrInput(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleVerifyQR(manualQrInput)}
                  disabled={verifying}
                >
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>

            {/* Verification Result Display */}
            {verificationResult && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: verificationResult.isValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `2px solid ${verificationResult.isValid ? '#10b981' : '#ef4444'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, color: verificationResult.isValid ? '#10b981' : '#ef4444' }}>
                  {verificationResult.isValid ? '✅ VALID GATE PASS — ALLOW EXIT' : '❌ INVALID / EXPIRED PASS — REJECT EXIT'}
                </div>

                {verificationResult.gatePass && (
                  <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div><strong>Student:</strong> {verificationResult.gatePass.student_name}</div>
                    <div><strong>Enrollment:</strong> {verificationResult.gatePass.enrollment_no}</div>
                    <div><strong>Destination:</strong> {verificationResult.gatePass.destination}</div>
                    <div><strong>Reason:</strong> {verificationResult.gatePass.reason}</div>
                    <div><strong>From:</strong> {formatDate(verificationResult.gatePass.from_datetime, 'dd MMM, hh:mm a')}</div>
                    <div><strong>To:</strong> {formatDate(verificationResult.gatePass.to_datetime, 'dd MMM, hh:mm a')}</div>
                  </div>
                )}
              </div>
            )}

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button className="btn btn-outline w-full" onClick={() => setShowScannerModal(false)}>Close Scanner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
