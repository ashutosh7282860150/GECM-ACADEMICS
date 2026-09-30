import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminAccountsPage() {
  const [transactions] = useState([
    { id: 'TXN-98421', student: 'Arjun Patel', roll: 'CSE2021001', feeType: 'Semester 7 Tuition Fee', amount: '₹14,500', status: 'PAID', date: '25 SEP 2026' },
    { id: 'TXN-98420', student: 'Priya Sharma', roll: 'CSE2021002', feeType: 'Hostel & Mess Fee', amount: '₹18,000', status: 'PAID', date: '24 SEP 2026' },
    { id: 'TXN-98419', student: 'Rahul Verma', roll: 'CSE2021003', feeType: 'Examination Fee', amount: '₹1,500', status: 'PENDING', date: '22 SEP 2026' },
    { id: 'TXN-98418', student: 'Ananya Gupta', roll: 'CSE2021004', feeType: 'Semester 7 Tuition Fee', amount: '₹14,500', status: 'PAID', date: '21 SEP 2026' },
    { id: 'TXN-98417', student: 'Amit Kumar', roll: 'ECE2021005', feeType: 'Library Overdue Fine', amount: '₹120', status: 'PAID', date: '20 SEP 2026' }
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              ACCOUNTS &amp; FINANCIAL MANAGEMENT CELL
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Institutional Fee Collection &amp; Transactions
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Tuition fee receipts, hostel dues, online payment reconciliations and student clearance audits.
            </p>
          </div>

          <button className="gov-btn-primary" onClick={() => toast.success('Reconciliation report generated (PDF)')}>
            📊 Export Financial Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Total Collected (Odd Sem)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>₹28,45,000</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>92% Fee Clearance Rate</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Pending Dues</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>₹2,14,500</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>24 Students with active dues</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Online Gateway Success</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0b1d3a', marginTop: '4px' }}>99.4%</div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a' }}>SBI Collect / Razorpay</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px' }}>
          Recent Transactions &amp; Receipts
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Txn ID</th>
                <th style={{ padding: '10px 12px' }}>Student / Roll</th>
                <th style={{ padding: '10px 12px' }}>Fee Category</th>
                <th style={{ padding: '10px 12px' }}>Amount</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Date</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0b1d3a', fontFamily: 'monospace' }}>{t.id}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700 }}>{t.student}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.roll}</div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{t.feeType}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0b1d3a' }}>{t.amount}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{t.date}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      background: t.status === 'PAID' ? '#f0fdf4' : '#fef2f2',
                      color: t.status === 'PAID' ? '#16a34a' : '#dc2626'
                    }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
