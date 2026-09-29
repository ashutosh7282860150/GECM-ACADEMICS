import { useState, useEffect } from 'react';
import { feesAPI } from '../../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function FeesPage() {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [payMethod, setPayMethod] = useState('online');
  const [paying, setPaying] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [activeTab, setActiveTab] = useState('fees');

  useEffect(() => {
    Promise.all([feesAPI.getAll(), feesAPI.getPaymentHistory()])
      .then(([feesRes, paymentsRes]) => {
        setFees(feesRes.data.data || []);
        setPayments(paymentsRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      const res = await feesAPI.pay({ feeId: payModal.id, paymentMethod: payMethod });
      setSuccessModal(res.data.data);
      setPayModal(null);
      toast.success('Payment successful! 🎉');
      // Refresh fees
      const updated = await feesAPI.getAll();
      setFees(updated.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const totalPending = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + parseFloat(f.amount), 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.amount), 0);

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading fees...</span></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">💳 Fee Management</h1>
          <p className="page-desc">View and pay your semester fees securely</p>
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
                ) : fees.map(fee => (
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
                          Pay Now
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--success)' }}>✅ Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
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
                <tr><th>Receipt No</th><th>Fee Type</th><th>Amount</th><th>Method</th><th>Transaction ID</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">💳</div><h4>No payment history</h4></div></td></tr>
                ) : payments.map(p => (
                  <tr key={p.id}>
                    <td><strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.receipt_no}</strong></td>
                    <td>{p.fee_type}</td>
                    <td><strong>{formatCurrency(p.amount)}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{p.payment_method}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{p.transaction_id}</td>
                    <td style={{ fontSize: '12px' }}>{formatDate(p.created_at, 'dd MMM yyyy')}</td>
                    <td><span className={`badge ${getStatusBadgeClass(p.status)}`}>{getStatusLabel(p.status)}</span></td>
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
                  { value: 'upi', label: '📱 UPI', icon: '📱' },
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
                <div className="alert-title">Demo Mode</div>
                <div className="alert-msg">This is a mock payment. No real transaction will occur.</div>
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

      {/* Success Modal */}
      {successModal && (
        <div className="modal-overlay" onClick={() => setSuccessModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>Payment Successful!</h3>
            <div style={{ background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', padding: '16px', margin: '16px 0', textAlign: 'left' }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Receipt No</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{successModal.receiptNo}</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Amount Paid</span>
                <strong style={{ color: 'var(--success)' }}>{formatCurrency(successModal.amount)}</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Transaction ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{successModal.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Payment Method</span>
                <span style={{ textTransform: 'capitalize' }}>{successModal.paymentMethod}</span>
              </div>
            </div>
            <button className="btn btn-success w-full" onClick={() => setSuccessModal(null)}>Done ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}
