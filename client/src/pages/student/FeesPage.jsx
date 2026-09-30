import { useState, useEffect } from 'react';
import { feesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';
import FeeReceiptPdfModal from '../common/FeeReceiptPdfModal';

export default function FeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [payMethod, setPayMethod] = useState('online');
  const [paying, setPaying] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [activeTab, setActiveTab] = useState('fees');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchFeeData = () => {
    Promise.all([feesAPI.getAll(), feesAPI.getPaymentHistory()])
      .then(([feesRes, paymentsRes]) => {
        setFees(feesRes.data.data || []);
        setPayments(paymentsRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      const res = await feesAPI.pay({ feeId: payModal.id, paymentMethod: payMethod });
      const payData = res.data.data;
      const receiptPayload = {
        receipt_no: payData.receiptNo || payData.receipt_no,
        transaction_id: payData.transactionId || payData.transaction_id,
        amount: payData.amount || payModal.amount,
        fee_type: payData.feeType || payModal.fee_type,
        description: payModal.description || `${payModal.fee_type} (Semester ${payModal.semester})`,
        payment_method: payMethod,
        created_at: new Date().toISOString(),
        student_name: user?.name || 'Arjun Patel',
        enrollment_no: user?.enrollment_no || 'CSE2021001',
        department_name: user?.department_name || 'Computer Science & Engineering',
        semester: payModal.semester || 7,
        academic_year: payModal.academic_year || '2024-25',
        status: 'completed'
      };

      setSuccessModal(receiptPayload);
      setPayModal(null);
      toast.success('Payment successful! Receipt generated. 🎉');
      fetchFeeData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleOpenReceiptForPayment = (paymentRecord) => {
    setSelectedReceipt({
      receipt_no: paymentRecord.receipt_no || ('RCPT-2026-' + Math.floor(1000 + Math.random() * 9000)),
      transaction_id: paymentRecord.transaction_id || paymentRecord.id,
      amount: paymentRecord.amount,
      fee_type: paymentRecord.fee_type || 'Tuition Fee',
      description: paymentRecord.description || `${paymentRecord.fee_type || 'Fee'} Payment`,
      payment_method: paymentRecord.payment_method || 'Online Banking',
      created_at: paymentRecord.created_at || paymentRecord.payment_date,
      student_name: paymentRecord.student_name || user?.name || 'Arjun Patel',
      enrollment_no: paymentRecord.enrollment_no || user?.enrollment_no || 'CSE2021001',
      department_name: user?.department_name || 'Computer Science & Engineering',
      semester: paymentRecord.semester || 7,
      academic_year: paymentRecord.academic_year || '2024-25',
      status: 'completed'
    });
  };

  const totalPending = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + parseFloat(f.amount), 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.amount), 0);

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading fees...</span></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">💳 Fee Management &amp; Receipts</h1>
          <p className="page-desc">View and pay your semester fees securely and download official receipts</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(totalPending)}</div>
            <div className="stat-label">Total Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(totalPaid)}</div>
            <div className="stat-label">Total Paid</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info">
            <div className="stat-value">{fees.length}</div>
            <div className="stat-label">Total Fee Records</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {['fees', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="btn btn-ghost"
            style={{ borderRadius: '8px 8px 0 0', borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)', paddingBottom: '12px' }}>
            {tab === 'fees' ? '📋 Fee Details' : '💳 Payment History'}
          </button>
        ))}
      </div>

      {activeTab === 'fees' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fee Type</th><th>Description</th><th>Amount</th><th>Due Date</th><th>Semester</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">💰</div><h4>No fee records found</h4></div></td></tr>
                ) : fees.map(fee => {
                  const matchedPayment = payments.find(p => p.fee_id === fee.id);
                  return (
                    <tr key={fee.id}>
                      <td><strong>{fee.fee_type}</strong></td>
                      <td style={{ fontSize: '12px' }}>{fee.description}</td>
                      <td><strong style={{ color: 'var(--primary-light)' }}>{formatCurrency(fee.amount)}</strong></td>
                      <td style={{ fontSize: '12px' }}>{formatDate(fee.due_date)}</td>
                      <td>Sem {fee.semester}</td>
                      <td><span className={`badge ${getStatusBadgeClass(fee.status)}`}>{getStatusLabel(fee.status)}</span></td>
                      <td>
                        {fee.status !== 'paid' ? (
                          <button className="btn btn-primary btn-sm" onClick={() => setPayModal(fee)} id={`pay-btn-${fee.id}`}>
                            💳 Pay Now
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenReceiptForPayment({
                              receipt_no: matchedPayment?.receipt_no || ('RCPT-2026-' + Math.floor(1000 + Math.random() * 9000)),
                              transaction_id: matchedPayment?.transaction_id || ('TXN' + Date.now()),
                              amount: fee.amount,
                              fee_type: fee.fee_type,
                              description: fee.description,
                              payment_method: matchedPayment?.payment_method || 'Online Banking',
                              created_at: matchedPayment?.created_at || fee.due_date,
                              semester: fee.semester,
                              academic_year: fee.academic_year
                            })}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                          >
                            📄 Receipt PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Receipt No</th><th>Fee Type</th><th>Amount</th><th>Method</th><th>Transaction ID</th><th>Date</th><th>Status</th><th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">💳</div><h4>No payment history</h4></div></td></tr>
                ) : payments.map(p => (
                  <tr key={p.id}>
                    <td><strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.receipt_no || ('RCPT-2026-' + p.id)}</strong></td>
                    <td>{p.fee_type || 'Tuition Fee'}</td>
                    <td><strong>{formatCurrency(p.amount)}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{p.payment_method}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{p.transaction_id}</td>
                    <td style={{ fontSize: '12px' }}>{formatDate(p.created_at || p.payment_date, 'dd MMM yyyy')}</td>
                    <td><span className={`badge ${getStatusBadgeClass(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleOpenReceiptForPayment(p)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
                      >
                        📄 Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💳 Make Payment</h3>
              <button className="modal-close" onClick={() => setPayModal(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Fee Type</span>
                <strong>{payModal.fee_type}</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Amount</span>
                <strong style={{ color: 'var(--primary-light)', fontSize: '1.2rem' }}>{formatCurrency(payModal.amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Due Date</span>
                <span style={{ fontSize: '13px' }}>{formatDate(payModal.due_date)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { value: 'online', label: '💻 Net Banking', icon: '🏦' },
                  { value: 'upi', label: '📱 UPI / QR', icon: '📱' },
                  { value: 'card', label: '💳 Credit/Debit Card', icon: '💳' },
                  { value: 'dd', label: '📄 Demand Draft', icon: '📄' },
                ].map(m => (
                  <label key={m.value} style={{ cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-md)', border: `2px solid ${payMethod === m.value ? 'var(--primary)' : 'var(--border)'}`, background: payMethod === m.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-3)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '500' }}>
                    <input type="radio" value={m.value} checked={payMethod === m.value} onChange={() => setPayMethod(m.value)} style={{ display: 'none' }} />
                    {m.icon} {m.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="alert alert-info">
              <span className="alert-icon">ℹ️</span>
              <div className="alert-content">
                <div className="alert-title">Secure Institutional Gateway</div>
                <div className="alert-msg">Simulated sandbox gateway. Instant digitally signed official receipt will be generated upon completion.</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setPayModal(null)}>Cancel</button>
              <button className={`btn btn-primary ${paying ? 'btn-loading' : ''}`} onClick={handlePay} disabled={paying} id="confirm-pay-btn">
                {paying ? '' : `Pay ${formatCurrency(payModal.amount)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with Immediate PDF Receipt Generation */}
      {successModal && (
        <div className="modal-overlay" onClick={() => setSuccessModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ color: 'var(--success)', marginBottom: '4px' }}>Payment Successful!</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Your official GECM Fee Receipt is generated and recorded.
            </p>

            <div style={{ background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', padding: '16px', margin: '0 0 20px 0', textAlign: 'left' }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Receipt No</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--primary-light)' }}>{successModal.receipt_no}</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Amount Paid</span>
                <strong style={{ color: 'var(--success)', fontSize: '14px' }}>{formatCurrency(successModal.amount)}</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Transaction ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{successModal.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Payment Method</span>
                <span style={{ textTransform: 'capitalize' }}>{successModal.payment_method}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-success w-full"
                onClick={() => {
                  setSelectedReceipt(successModal);
                  setSuccessModal(null);
                }}
                style={{ fontWeight: 800, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                📄 View &amp; Download Receipt PDF
              </button>
              <button className="btn btn-outline w-full" onClick={() => setSuccessModal(null)}>
                Done ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Fee Receipt PDF Modal */}
      {selectedReceipt && (
        <FeeReceiptPdfModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

