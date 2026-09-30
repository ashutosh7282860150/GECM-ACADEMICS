import { useState, useEffect } from 'react';
import { hostelAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';
import FeeReceiptPdfModal from '../common/FeeReceiptPdfModal';

export default function HostelPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mess'); // Default to mess services as requested
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [payMethod, setPayMethod] = useState('upi');
  const [paying, setPaying] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

  // Local state for mess bills to allow real-time payment updates
  const [messBills, setMessBills] = useState([
    {
      id: 'mb-2026-10',
      month: 'October 2026',
      amount: 3200,
      status: 'pending',
      due_date: '2026-10-10',
      fee_type: 'Hostel Mess & Dining Fee',
      description: 'October 2026 Mess & Dining Subscription (Annapurna Hall)',
      diet_plan: 'Regular 4 Meals / Day'
    },
    {
      id: 'mb-2026-09',
      month: 'September 2026',
      amount: 3200,
      status: 'paid',
      paid_at: '2026-09-24T12:30:00Z',
      created_at: '2026-09-24T12:30:00Z',
      receipt_no: 'RCPT-MESS-2026-0924',
      transaction_id: 'TXNMESS984210',
      payment_method: 'UPI / Net Banking',
      fee_type: 'Hostel Mess & Dining Fee',
      description: 'September 2026 Mess & Dining Subscription (Annapurna Hall)',
      diet_plan: 'Regular 4 Meals / Day'
    },
    {
      id: 'mb-2026-08',
      month: 'August 2026',
      amount: 3200,
      status: 'paid',
      paid_at: '2026-08-20T10:15:00Z',
      created_at: '2026-08-20T10:15:00Z',
      receipt_no: 'RCPT-MESS-2026-0820',
      transaction_id: 'TXNMESS983190',
      payment_method: 'Credit Card',
      fee_type: 'Hostel Mess & Dining Fee',
      description: 'August 2026 Mess & Dining Subscription (Annapurna Hall)',
      diet_plan: 'Regular 4 Meals / Day'
    },
    {
      id: 'mb-2026-07',
      month: 'July 2026',
      amount: 3200,
      status: 'paid',
      paid_at: '2026-07-18T14:45:00Z',
      created_at: '2026-07-18T14:45:00Z',
      receipt_no: 'RCPT-MESS-2026-0718',
      transaction_id: 'TXNMESS981240',
      payment_method: 'SBI Collect / UPI',
      fee_type: 'Hostel Mess & Dining Fee',
      description: 'July 2026 Mess & Dining Subscription (Annapurna Hall)',
      diet_plan: 'Regular 4 Meals / Day'
    }
  ]);

  useEffect(() => {
    hostelAPI.getInfo()
      .then(res => {
        setData(res.data.data);
        if (res.data.data?.messBills && res.data.data.messBills.length > 0) {
          setMessBills(res.data.data.messBills);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePayMess = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 600));

      const generatedReceiptNo = 'RCPT-MESS-2026-' + Math.floor(1000 + Math.random() * 9000);
      const generatedTxnId = 'TXNMESS' + Date.now().toString().slice(-6);

      const updatedBills = messBills.map(b => {
        if (b.id === payModal.id) {
          return {
            ...b,
            status: 'paid',
            paid_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            receipt_no: generatedReceiptNo,
            transaction_id: generatedTxnId,
            payment_method: payMethod === 'upi' ? 'UPI / QR Scan' : payMethod === 'online' ? 'Net Banking' : 'Credit/Debit Card'
          };
        }
        return b;
      });

      setMessBills(updatedBills);

      const receiptPayload = {
        receipt_no: generatedReceiptNo,
        transaction_id: generatedTxnId,
        amount: payModal.amount,
        fee_type: 'Hostel Mess & Dining Services Fee',
        description: `${payModal.month} Mess Subscription Fee (Annapurna Central Dining Hall)`,
        payment_method: payMethod.toUpperCase(),
        created_at: new Date().toISOString(),
        student_name: user?.name || 'Arjun Patel',
        enrollment_no: user?.enrollment_no || 'CSE2021001',
        department_name: user?.department_name || 'Computer Science & Engineering',
        semester: 7,
        academic_year: '2024-25',
        status: 'completed'
      };

      setSuccessModal(receiptPayload);
      setPayModal(null);
      toast.success('Mess fee payment successful! Official receipt generated. 🎉');
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleOpenReceipt = (bill) => {
    setSelectedReceipt({
      receipt_no: bill.receipt_no || ('RCPT-MESS-2026-' + Math.floor(1000 + Math.random() * 9000)),
      transaction_id: bill.transaction_id || ('TXNMESS' + Date.now().toString().slice(-6)),
      amount: bill.amount,
      fee_type: 'Hostel Mess & Dining Services Fee',
      description: bill.description || `${bill.month} Mess Subscription Fee (Annapurna Dining Hall)`,
      payment_method: bill.payment_method || 'Online Banking / UPI',
      created_at: bill.created_at || bill.paid_at || new Date().toISOString(),
      student_name: user?.name || 'Arjun Patel',
      enrollment_no: user?.enrollment_no || 'CSE2021001',
      department_name: user?.department_name || 'Computer Science & Engineering',
      semester: 7,
      academic_year: '2024-25',
      status: 'completed'
    });
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading hostel &amp; mess services...</span></div>;

  const { hostelResident = true, allocation = {
    hostel_name: 'Bhabha Hall (Boys Hostel A)',
    hostel_type: 'boys',
    room_no: 'B-304',
    room_type: 'double sharing',
    floor_no: 3,
    check_in_date: '2021-08-15',
    status: 'active'
  } } = data || {};

  const totalPaidMess = messBills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const pendingMessCount = messBills.filter(b => b.status !== 'paid').length;
  const pendingMessAmount = messBills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="dashboard-grid">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🏠 Hostel &amp; Mess Services</h1>
          <p className="page-desc">Room accommodation, monthly mess fees, payment receipts and dining plans</p>
        </div>
      </div>

      {/* Top Banner Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(11,29,58,0.06), rgba(99,102,241,0.08))', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="flex items-center gap-4">
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: '#0b1d3a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
              🏠
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                HOSTEL &amp; MESS SERVICES • GEC MADHUBANI
              </div>
              <h3 style={{ margin: '2px 0', fontSize: '1.2rem', color: '#0b1d3a' }}>{allocation?.hostel_name || 'Bhabha Hall (Boys Hostel A)'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                Room No: <strong style={{ color: '#0b1d3a' }}>{allocation?.room_no || 'B-304'}</strong> · Floor {allocation?.floor_no || 3} · Dining: <strong>Annapurna Central Mess Hall</strong>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-success" style={{ fontSize: '12px', padding: '6px 12px' }}>
              ✓ Resident Allocated
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {[
          { key: 'mess', label: '🍽️ Mess Services & Monthly Dues', count: pendingMessCount > 0 ? `${pendingMessCount} Due` : null },
          { key: 'room', label: '🏠 Room Accommodation' },
          { key: 'menu', label: '🥗 Weekly Mess Menu' },
          { key: 'rules', label: '📜 Hostel & Mess Rules' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="btn btn-ghost"
            style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--primary-light)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.key ? 700 : 500,
              paddingBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span style={{ fontSize: '10px', background: '#dc2626', color: '#ffffff', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MESS SERVICES & DUES ── */}
      {activeTab === 'mess' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Summary Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon yellow">🍽️</div>
              <div className="stat-info">
                <div className="stat-value">{formatCurrency(pendingMessAmount)}</div>
                <div className="stat-label">Pending Mess Dues</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-info">
                <div className="stat-value">{formatCurrency(totalPaidMess)}</div>
                <div className="stat-label">Total Mess Fees Paid</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">🍛</div>
              <div className="stat-info">
                <div className="stat-value">₹3,200 / mo</div>
                <div className="stat-label">Monthly Meal Rate</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">📜</div>
              <div className="stat-info">
                <div className="stat-value">{messBills.filter(b => b.status === 'paid').length} Receipts</div>
                <div className="stat-label">Verified E-Receipts</div>
              </div>
            </div>
          </div>

          {/* Pending Bill Alert Banner if applicable */}
          {pendingMessCount > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1.5px solid #fde68a',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                  <strong style={{ fontSize: '1rem', color: '#b45309' }}>
                    October 2026 Mess Subscription Due: {formatCurrency(pendingMessAmount)}
                  </strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '2px' }}>
                  Please settle your monthly mess dues by 10th October to avoid dining deactivation or late clearance fines.
                </div>
              </div>

              <button
                className="gov-btn-primary"
                onClick={() => setPayModal(messBills.find(b => b.status !== 'paid'))}
                style={{ padding: '10px 20px', fontWeight: 800, fontSize: '0.88rem' }}
              >
                💳 Pay Mess Fee ({formatCurrency(pendingMessAmount)}) →
              </button>
            </div>
          )}

          {/* Mess Bills & Receipt Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 className="card-title">📋 Monthly Mess Dues &amp; Payment Receipts</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Download authentic institutional PDF receipts with digital QR verification for all settled months.
                </p>
              </div>
              <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                🔒 Official GECM Accounts Log
              </span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Billing Month</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Payment Method</th>
                    <th>Receipt No / Txn</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Official Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {messBills.map(bill => {
                    const isPaid = bill.status === 'paid';
                    return (
                      <tr key={bill.id} style={{ background: isPaid ? 'transparent' : 'rgba(254, 243, 199, 0.2)' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🍽️</span>
                            <strong>{bill.month}</strong>
                          </div>
                        </td>
                        <td style={{ fontSize: '12px' }}>{bill.description}</td>
                        <td><strong style={{ color: isPaid ? 'var(--primary-light)' : '#dc2626' }}>{formatCurrency(bill.amount)}</strong></td>
                        <td style={{ fontSize: '12px' }}>{bill.due_date ? formatDate(bill.due_date) : 'N/A'}</td>
                        <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>{bill.payment_method || '—'}</td>
                        <td>
                          {isPaid ? (
                            <div>
                              <div style={{ fontFamily: 'monospace', fontSize: '11.5px', fontWeight: 700, color: 'var(--primary-light)' }}>
                                {bill.receipt_no}
                              </div>
                              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                                {bill.transaction_id}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending Settlement</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(bill.status)}`}>
                            {getStatusLabel(bill.status)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isPaid ? (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleOpenReceipt(bill)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
                            >
                              📄 Download Receipt PDF
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setPayModal(bill)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
                            >
                              💳 Pay Now
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

          {/* Dining Plan Card */}
          <div className="card">
            <h3 className="card-title mb-3">🍛 Mess Allocation &amp; Dining Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div style={{ background: 'var(--bg-3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mess Hall</div>
                <div style={{ fontWeight: 700, color: '#0b1d3a' }}>Annapurna Central Dining Hall</div>
              </div>
              <div style={{ background: 'var(--bg-3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Meal Timings</div>
                <div style={{ fontWeight: 700, color: '#0b1d3a' }}>Breakfast (7:30-9:00), Lunch (12:30-2:00), Snacks (5:00-6:00), Dinner (8:00-9:30)</div>
              </div>
              <div style={{ background: 'var(--bg-3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mess Supervisor</div>
                <div style={{ fontWeight: 700, color: '#0b1d3a' }}>Mr. Rajesh Sharma (Ext: 204)</div>
              </div>
              <div style={{ background: 'var(--bg-3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Dietary Feedback</div>
                <div style={{ fontWeight: 700, color: '#16a34a' }}>Registered (Clean Water &amp; FSSAI Certified)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ROOM ACCOMMODATION ── */}
      {activeTab === 'room' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">🚪</div>
              <div className="stat-info">
                <div className="stat-value">Room {allocation?.room_no || 'B-304'}</div>
                <div className="stat-label">Room Number</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">🏢</div>
              <div className="stat-info">
                <div className="stat-value">Floor {allocation?.floor_no || 3}</div>
                <div className="stat-label">Floor</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">👥</div>
              <div className="stat-info">
                <div className="stat-value" style={{ textTransform: 'capitalize' }}>{allocation?.room_type || 'Double Sharing'}</div>
                <div className="stat-label">Room Type</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon cyan">📅</div>
              <div className="stat-info">
                <div className="stat-value">{formatDate(allocation?.check_in_date || '2021-08-15')}</div>
                <div className="stat-label">Check-in Date</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title mb-4">📋 Accommodation Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Hostel Name', value: allocation?.hostel_name || 'Bhabha Hall (Boys Hostel A)' },
                { label: 'Room Number', value: allocation?.room_no || 'B-304' },
                { label: 'Floor', value: `Floor ${allocation?.floor_no || 3}` },
                { label: 'Room Type', value: allocation?.room_type || 'Double Sharing' },
                { label: 'Check-in Date', value: formatDate(allocation?.check_in_date || '2021-08-15') },
                { label: 'Status', value: <span className="badge badge-success">Active Allocated</span> },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                  <div style={{ fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: WEEKLY MESS MENU ── */}
      {activeTab === 'menu' && (
        <div className="card">
          <div className="card-title mb-4">🥗 Annapurna Central Mess Weekly Menu (FSSAI Certified)</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Breakfast (7:30 - 9:00 AM)</th>
                  <th>Lunch (12:30 - 2:00 PM)</th>
                  <th>Snacks (5:00 - 6:00 PM)</th>
                  <th>Dinner (8:00 - 9:30 PM)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { day: 'Monday', bf: 'Aloo Paratha, Curd, Pickle, Tea', lunch: 'Rice, Dal Tadka, Seasonal Veg, Salad, Papad', snacks: 'Samosa, Green Chutney, Tea', dinner: 'Roti, Paneer Butter Masala, Jeera Rice, Gulab Jamun' },
                  { day: 'Tuesday', bf: 'Idli Sambar, Coconut Chutney, Coffee', lunch: 'Rajma, Steamed Rice, Roti, Aloo Gobi, Raita', snacks: 'Veg Cutlet, Tea/Milk', dinner: 'Roti, Mix Veg Curry, Dal Makhani, Rice, Kheer' },
                  { day: 'Wednesday', bf: 'Poha, Boiled Egg / Banana, Tea', lunch: 'Rice, Chana Dal, Bhindi Masala, Roti, Curd', snacks: 'Bread Pakoda, Sauce, Tea', dinner: 'Roti, Egg Curry / Shahi Paneer, Rice, Salad' },
                  { day: 'Thursday', bf: 'Puri Sabji, Halwa, Tea', lunch: 'Kadhi Pakoda, Rice, Aloo Jeera, Roti, Salad', snacks: 'Sweet Corn / Sprouts, Coffee', dinner: 'Roti, Mushroom Masala, Dal Fry, Rice, Ice Cream' },
                  { day: 'Friday', bf: 'Uttapam, Sambar, Chutney, Tea', lunch: 'Veg Biryani, Raita, Dal Tadka, Papad', snacks: 'Pasta / Chowmein, Tea', dinner: 'Roti, Chole, Pulao, Paneer Curry, Rasgulla' },
                  { day: 'Saturday', bf: 'Stuffed Onion Paratha, Butter, Tea', lunch: 'Rice, Arhar Dal, Aloo Baingan, Roti, Salad', snacks: 'Biscuits & Tea, Fruits', dinner: 'Poori, Dum Aloo, Dal Makhani, Pulao, Halwa' },
                  { day: 'Sunday', bf: 'Masala Dosa, Sambar, Chutney, Tea', lunch: 'Special Fried Rice, Dal, Kofta Curry, Roti, Ice Cream', snacks: 'Pakora, Tea', dinner: 'Roti, Paneer Lababdar / Chicken Masala (Opt), Jeera Rice' },
                ].map(m => (
                  <tr key={m.day}>
                    <td><strong>{m.day}</strong></td>
                    <td style={{ fontSize: '12px' }}>{m.bf}</td>
                    <td style={{ fontSize: '12px' }}>{m.lunch}</td>
                    <td style={{ fontSize: '12px' }}>{m.snacks}</td>
                    <td style={{ fontSize: '12px' }}>{m.dinner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: RULES ── */}
      {activeTab === 'rules' && (
        <div className="card">
          <div className="card-title mb-4">📜 Hostel &amp; Mess Regulations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '🍽️', rule: 'Mess dues must be cleared between 1st and 10th of every month without fail.' },
              { icon: '🕙', rule: 'Curfew time: 10:00 PM on weekdays, 11:00 PM on weekends for hostel residents.' },
              { icon: '🚪', rule: 'Gate pass required from Warden portal for overnight outings and leaves.' },
              { icon: '🔕', rule: 'Silence hours: 11:00 PM – 6:00 AM across all residential corridors.' },
              { icon: '🍱', rule: 'Food must not be taken outside the Annapurna Dining Hall except during medical quarantine.' },
              { icon: '🚫', rule: 'No electrical heaters or heavy cooking appliances inside individual rooms.' },
              { icon: '🧹', rule: 'Keep hostel premises, dining tables, and rooms clean and hygienic.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pay Mess Fee Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💳 Pay Monthly Mess Dues</h3>
              <button className="modal-close" onClick={() => setPayModal(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Billing Month</span>
                <strong>{payModal.month}</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Mess Facility</span>
                <span>Annapurna Central Dining Hall</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Amount Due</span>
                <strong style={{ color: '#16a34a', fontSize: '1.2rem' }}>{formatCurrency(payModal.amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Due Date</span>
                <span style={{ fontSize: '13px' }}>{formatDate(payModal.due_date)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { value: 'upi', label: '📱 UPI / QR Code', icon: '📱' },
                  { value: 'online', label: '💻 Net Banking', icon: '🏦' },
                  { value: 'card', label: '💳 Debit / Credit Card', icon: '💳' },
                  { value: 'sbi', label: '🏛️ SBI Collect', icon: '🏛️' },
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
                <div className="alert-title">Instant Official PDF Receipt</div>
                <div className="alert-msg">Payment is instantly recorded in GECM hostel accounts and a verified institutional PDF receipt is generated.</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setPayModal(null)}>Cancel</button>
              <button className={`btn btn-primary ${paying ? 'btn-loading' : ''}`} onClick={handlePayMess} disabled={paying}>
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
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ color: 'var(--success)', marginBottom: '4px' }}>Mess Fee Paid Successfully!</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Your official GECM Mess Payment E-Receipt has been generated.
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
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Payment Mode</span>
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
                📄 View &amp; Download Mess Receipt PDF
              </button>
              <button className="btn btn-outline w-full" onClick={() => setSuccessModal(null)}>
                Done ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official PDF Receipt Modal */}
      {selectedReceipt && (
        <FeeReceiptPdfModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
