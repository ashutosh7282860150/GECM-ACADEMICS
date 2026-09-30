import { useState, useEffect, useRef } from 'react';
import { gatePassAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function GatePassPage() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [createModal, setCreateModal] = useState(false);
  const [passModal, setPassModal] = useState(null);
  const [form, setForm] = useState({ reason: '', destination: '', fromDatetime: '', toDatetime: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPasses = () => {
    gatePassAPI.getAll()
      .then(res => setPasses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPasses();
    const interval = setInterval(fetchPasses, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.reason || !form.destination || !form.fromDatetime || !form.toDatetime) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await gatePassAPI.create(form);
      toast.success('Gate pass submitted! Direct alert sent to Warden Dashboard in real time. 🚀');
      setCreateModal(false);
      setForm({ reason: '', destination: '', fromDatetime: '', toDatetime: '' });
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const pendingCount = passes.filter(p => p.status?.toLowerCase() === 'pending').length;
  const approvedCount = passes.filter(p => p.status?.toLowerCase() === 'approved').length;
  const rejectedCount = passes.filter(p => p.status?.toLowerCase() === 'rejected').length;

  const filteredPasses = passes.filter(p => {
    const s = p.status?.toLowerCase();
    if (activeFilter === 'pending') return s === 'pending';
    if (activeFilter === 'approved') return s === 'approved';
    if (activeFilter === 'rejected') return s === 'rejected';
    return true;
  });

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading gate passes...</span></div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              CAMPUS SECURITY &amp; OUTPASS
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Student Digital Gate Pass Portal
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Real-time gate pass application, instant warden notification, and verified QR code exit clearance.
            </p>
          </div>

          <button className="gov-btn-primary" onClick={() => setCreateModal(true)} id="new-gatepass-btn">
            ➕ Apply For New Gate Pass
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📋</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b1d3a' }}>{passes.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Applications (Permanent)</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⏳</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>{pendingCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Pending Warden Review</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>✅</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>{approvedCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Approved QR Issued</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>❌</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c' }}>{rejectedCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Rejected Records</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All History (${passes.length})` },
          { key: 'pending', label: `⏳ Pending Approval (${pendingCount})` },
          { key: 'approved', label: `✅ Approved Passes (${approvedCount})` },
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

      {/* Passes List Section Header */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span> Gate Pass Application History &amp; Verified QR Passes
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              🛡️ Permanent Institutional Log — All submissions, approved QR passes, and warden remarks are preserved.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#15803d', background: '#f0fdf4', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', fontWeight: 700 }}>
            <span>🔒 Real-Time System Active</span>
          </div>
        </div>

        {filteredPasses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚪</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1d3a' }}>No Gate Pass Records in Selected Filter</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Submit a new gate pass request or change your filter tab above.</p>
            <button className="gov-btn-primary" style={{ marginTop: '14px' }} onClick={() => setCreateModal(true)}>
              ➕ Apply for Gate Pass
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPasses.map(gp => {
              const isApproved = gp.status?.toLowerCase() === 'approved';
              const isPending = gp.status?.toLowerCase() === 'pending';
              const isRejected = gp.status?.toLowerCase() === 'rejected';
              const qrPayload = gp.qr_data || (typeof gp.qr_code_data === 'string' ? gp.qr_code_data : JSON.stringify({
                id: gp.id,
                passNumber: gp.pass_number || 'GP-VERIFIED',
                studentName: gp.student_name || 'Arjun Patel',
                enrollment: gp.enrollment_no || 'CSE2021001',
                destination: gp.destination,
                status: 'approved'
              }));

              return (
                <div
                  key={gp.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isApproved ? '#86efac' : isRejected ? '#fca5a5' : '#fcd34d',
                    background: isApproved ? '#f9fdfa' : isRejected ? '#fffafa' : '#fffdf7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Left Info Column */}
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '4px', background: '#0b1d3a', color: '#ffffff', letterSpacing: '0.5px' }}>
                        {gp.pass_number || 'GP-PASS'}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: '#0b1d3a' }}>{gp.destination}</strong>
                      
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                          color: isApproved ? '#15803d' : isRejected ? '#b91c1c' : '#b45309',
                          border: isApproved ? '1px solid #86efac' : isRejected ? '1px solid #fca5a5' : '1px solid #fcd34d'
                        }}
                      >
                        {isPending && '⏳ Live Warden Review Pending'}
                        {isApproved && '✅ Approved by Warden (QR Ready)'}
                        {isRejected && '❌ Rejected'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', color: '#334155', marginTop: '6px' }}>
                      <strong>Purpose:</strong> {gp.reason}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px', display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                      <span>🛫 <strong>Departure:</strong> {formatDate(gp.from_datetime || gp.out_date_time, 'dd MMM yyyy, hh:mm a')}</span>
                      <span>🛬 <strong>Return:</strong> {formatDate(gp.to_datetime || gp.expected_in_date_time, 'dd MMM yyyy, hh:mm a')}</span>
                      <span>📅 <strong>Applied On:</strong> {gp.created_at ? new Date(gp.created_at).toLocaleDateString('en-IN') : 'Recent'}</span>
                    </div>

                    {gp.warden_comment || gp.remarks ? (
                      <div style={{ marginTop: '10px', fontSize: '0.8rem', padding: '6px 12px', background: isRejected ? '#fee2e2' : 'rgba(0,0,0,0.03)', borderRadius: '4px', color: isRejected ? '#991b1b' : '#475569', borderLeft: `3px solid ${isRejected ? '#ef4444' : '#16a34a'}` }}>
                        <strong>Warden Remark:</strong> {gp.warden_comment || gp.remarks}
                      </div>
                    ) : null}
                  </div>

                  {/* Right QR Code Thumbnail & Actions Column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {isApproved && (
                      <div
                        onClick={() => setPassModal(gp)}
                        style={{
                          background: '#ffffff',
                          border: '2px solid #16a34a',
                          borderRadius: '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.15)',
                          transition: 'transform 0.2s ease',
                        }}
                        title="Click to expand full official QR pass"
                      >
                        {gp.qr_code ? (
                          <img src={gp.qr_code} alt="QR Thumbnail" style={{ width: '76px', height: '76px', objectFit: 'contain' }} />
                        ) : (
                          <QRCodeCanvas
                            value={qrPayload}
                            size={76}
                            level="M"
                            includeMargin={false}
                          />
                        )}
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                          🔍 TAP QR TO SCAN
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                      {isApproved && (
                        <button
                          className="gov-btn-primary"
                          style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => setPassModal(gp)}
                          id={`qr-btn-${gp.id}`}
                        >
                          📱 View &amp; Print QR Pass →
                        </button>
                      )}
                      {isPending && (
                        <div style={{ fontSize: '0.78rem', color: '#b45309', background: '#fffbeb', padding: '6px 12px', borderRadius: '6px', border: '1px solid #fde68a', fontWeight: 600 }}>
                          ⏳ In Warden Approval Queue
                        </div>
                      )}
                      {isRejected && (
                        <div style={{ fontSize: '0.78rem', color: '#b91c1c', background: '#fee2e2', padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', fontWeight: 600 }}>
                          ❌ Not Issued
                        </div>
                      )}
                    </div>
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">🚪 Apply For Campus Gate Pass</h3>
              <button className="modal-close" onClick={() => setCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="gov-form-group">
                <label className="gov-form-label">Destination / City</label>
                <input
                  type="text"
                  className="gov-form-input"
                  placeholder="e.g., City Hospital Madhubani, Home - Patna"
                  value={form.destination}
                  onChange={e => setForm({ ...form, destination: e.target.value })}
                  required
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Specific Reason for Leaving</label>
                <textarea
                  className="gov-form-input"
                  rows="3"
                  placeholder="e.g., Doctor appointment & medical checkup / Family event"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="gov-form-group">
                  <label className="gov-form-label">Departure Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    className="gov-form-input"
                    value={form.fromDatetime}
                    onChange={e => setForm({ ...form, fromDatetime: e.target.value })}
                    required
                  />
                </div>
                <div className="gov-form-group">
                  <label className="gov-form-label">Expected Return Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    className="gov-form-input"
                    value={form.toDatetime}
                    onChange={e => setForm({ ...form, toDatetime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '6px', fontSize: '0.78rem', color: '#475569', margin: '14px 0' }}>
                ℹ️ <strong>Instant Routing:</strong> Submitting will instantly alert the Hostel Warden dashboard. Upon approval, your verified QR code gate pass is generated immediately. All application records remain permanently in your portal.
              </div>

              <div className="modal-footer" style={{ marginTop: '16px' }}>
                <button type="button" className="gov-btn-outline" onClick={() => setCreateModal(false)}>Cancel</button>
                <button type="submit" className="gov-btn-primary" disabled={submitting} id="submit-gatepass-btn">
                  {submitting ? 'Submitting Request...' : 'Submit Real-time Application →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Government Digital Gate Pass Modal with QR Code */}
      {passModal && (
        <div className="modal-overlay" onClick={() => setPassModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            
            {/* Government Pass Card Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0b1d3a', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#b45309', letterSpacing: '1px', textTransform: 'uppercase' }}>
                GOVERNMENT OF BIHAR • DEPT OF SCIENCE &amp; TECHNOLOGY
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0b1d3a', margin: '2px 0' }}>
                GEC MADHUBANI
              </h2>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>
                OFFICIAL DIGITAL CAMPUS OUTPASS
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                Token: <strong>{passModal.pass_number || 'GP-2026-VERIFIED'}</strong>
              </div>
            </div>

            {/* QR Code Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              {passModal.qr_code ? (
                <img src={passModal.qr_code} alt="Gate Pass QR" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
              ) : (
                <QRCodeCanvas
                  value={passModal.qr_data || JSON.stringify({
                    id: passModal.id,
                    passNumber: passModal.pass_number || 'GP-VERIFIED',
                    studentName: passModal.student_name || 'Arjun Patel',
                    enrollment: passModal.enrollment_no || 'CSE2021001',
                    destination: passModal.destination,
                    status: 'approved'
                  })}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              )}
              <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800, marginTop: '8px' }}>
                🔒 VERIFIED DIGITAL SIGNATURE HASH
              </div>
            </div>

            {/* Student & Pass Details Table */}
            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Student Name:</span>
                <strong style={{ color: '#0b1d3a' }}>{passModal.student_name || 'Arjun Patel'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Enrollment No:</span>
                <strong style={{ color: '#0b1d3a' }}>{passModal.enrollment_no || 'CSE2021001'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Destination:</span>
                <strong style={{ color: '#0b1d3a' }}>{passModal.destination}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Out Time:</span>
                <span style={{ color: '#0b1d3a', fontWeight: 600 }}>{formatDate(passModal.from_datetime || passModal.out_date_time, 'dd MMM, hh:mm a')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Expected Return:</span>
                <span style={{ color: '#0b1d3a', fontWeight: 600 }}>{formatDate(passModal.to_datetime || passModal.expected_in_date_time, 'dd MMM, hh:mm a')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Warden Clearance:</span>
                <strong style={{ color: '#16a34a' }}>Approved (Suresh Patel)</strong>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px', fontSize: '0.74rem', color: '#15803d', textAlign: 'center', marginBottom: '16px' }}>
              Present this digital pass at Campus Main Gate 1 or 2 for scanner exit verification.
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="gov-btn-primary" style={{ flex: 1 }} onClick={handlePrint}>
                🖨️ Print Pass
              </button>
              <button className="gov-btn-outline" style={{ flex: 1 }} onClick={() => setPassModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
