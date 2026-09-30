import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import GECMLogo from '../../components/GECMLogo';

// Helper to convert numbers to Indian Currency Words
function numberToWordsINR(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowThousand(val) {
    let str = '';
    if (val >= 100) {
      str += units[Math.floor(val / 100)] + ' Hundred ';
      val %= 100;
    }
    if (val >= 20) {
      str += tens[Math.floor(val / 10)] + ' ';
      val %= 10;
    }
    if (val > 0) {
      str += units[val] + ' ';
    }
    return str.trim();
  }

  let crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  let belowThousand = remainder % 1000;

  let res = '';
  if (crore > 0) res += convertBelowThousand(crore) + ' Crore ';
  if (lakh > 0) res += convertBelowThousand(lakh) + ' Lakh ';
  if (thousand > 0) res += convertBelowThousand(thousand) + ' Thousand ';
  if (belowThousand > 0) res += convertBelowThousand(belowThousand) + ' ';

  return 'Rupees ' + res.trim() + ' Only';
}

export default function FeeReceiptPdfModal({ payment, onClose }) {
  const printAreaRef = useRef(null);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = payment.receipt_no || payment.receiptNo || ('RCPT-2026-' + Math.floor(1000 + Math.random() * 9000));
  const txnId = payment.transaction_id || payment.transactionId || ('TXN' + Date.now());
  const amount = parseFloat(payment.amount) || 0;
  const studentName = payment.student_name || payment.studentName || 'Arjun Patel';
  const enrollmentNo = payment.enrollment_no || payment.enrollmentNo || 'CSE2021001';
  const departmentName = payment.department_name || payment.departmentName || 'Computer Science & Engineering';
  const semester = payment.semester || 7;
  const academicYear = payment.academic_year || payment.academicYear || '2024-25';
  const feeType = payment.fee_type || payment.feeType || 'Tuition Fee';
  const description = payment.description || `${feeType} (Academic Session ${academicYear})`;
  const paymentMethod = (payment.payment_method || payment.paymentMethod || 'Online Banking / UPI').toUpperCase();
  const paymentDate = payment.created_at || payment.payment_date || payment.paidAt || new Date().toISOString();
  const amountInWords = numberToWordsINR(amount);

  // Live Scannable QR code verification link
  const verifyBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gecm.ac.in';
  const qrVerificationPayload = `${verifyBaseUrl}/verify/${receiptNo}?type=receipt&student=${encodeURIComponent(studentName)}&roll=${encodeURIComponent(enrollmentNo)}&dept=${encodeURIComponent(departmentName)}&amount=${encodeURIComponent(amount)}&date=${encodeURIComponent(formatDate(paymentDate, 'dd MMM yyyy'))}&txn=${encodeURIComponent(txnId)}&status=PAID_VERIFIED`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999, background: 'rgba(11, 29, 58, 0.75)', backdropFilter: 'blur(4px)' }}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          maxHeight: '92vh',
          padding: '0',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
        }}
      >
        {/* Top Modal Controls (Hidden in Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            background: '#0b1d3a',
            color: '#ffffff',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>💳</span>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#fde68a' }}>Official Student Fee Payment E-Receipt</strong>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Receipt No: {receiptNo} · Status: COMPLETED &amp; SETTLED</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* ── PRINTABLE RECEIPT BODY ── */}
        <div
          ref={printAreaRef}
          className="printable-receipt-page"
          style={{
            padding: '36px 40px',
            color: '#0f172a',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            background: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Outer Double Frame */}
          <div
            style={{
              border: '3px double #0b1d3a',
              padding: '26px',
              borderRadius: '6px',
              position: 'relative',
              background: '#ffffff'
            }}
          >
            {/* Watermark Logo */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.04,
                pointerEvents: 'none',
                zIndex: 0
              }}
            >
              <GECMLogo size="large" showText={false} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0b1d3a', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
                  <GECMLogo size="small" showText={false} />
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#b45309', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      GOVERNMENT OF BIHAR • DEPARTMENT OF SCIENCE &amp; TECHNOLOGY
                    </div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1d3a', margin: '2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Government Engineering College, Madhubani
                    </h1>
                    <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                      Affiliated to Bihar Engineering University (BEU), Patna | Approved by AICTE, New Delhi
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      Campus: Arer, Madhubani, Bihar — 847222 | Email: accounts@gecm.ac.in | Website: www.gecm.ac.in
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                  <div>
                    <strong>ACCOUNTS DIVISION:</strong> <span>Institutional Fee Collection Counter</span>
                  </div>
                  <div>
                    <strong>Session / AY:</strong> <span>{academicYear}</span>
                  </div>
                </div>
              </div>

              {/* Title Ribbon */}
              <div style={{ textAlign: 'center', margin: '14px 0' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '5px 22px',
                    background: '#0b1d3a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    borderRadius: '4px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}
                >
                  OFFICIAL STUDENT FEE PAYMENT RECEIPT
                </span>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>
                  Electronic Bank / Gateway Settlement Slip (Original Student Copy)
                </div>
              </div>

              {/* Top Reference & Transaction Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Receipt Number:</span>{' '}
                  <strong style={{ fontFamily: 'monospace', color: '#0b1d3a', fontSize: '0.9rem' }}>{receiptNo}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Payment Date &amp; Time:</span>{' '}
                  <strong>{formatDate(paymentDate, 'dd MMM yyyy, hh:mm a')}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Transaction ID (Bank Ref):</span>{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{txnId}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Payment Mode:</span>{' '}
                  <strong style={{ color: '#0b1d3a' }}>{paymentMethod}</strong>
                </div>
              </div>

              {/* Student Particulars Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ background: '#0b1d3a', color: '#ffffff', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  👤 STUDENT PARTICULAR DETAILS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', padding: '12px 16px', fontSize: '0.82rem', background: '#ffffff' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Student Name:</span> <strong>{studentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Enrollment / Reg. No:</span>{' '}
                    <strong style={{ fontFamily: 'monospace' }}>{enrollmentNo}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Branch / Department:</span> <strong>{departmentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Current Semester:</span> <strong>Semester {semester}</strong>
                  </div>
                </div>
              </div>

              {/* Fee Heads Breakdown Table */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#0b1d3a', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', width: '45px' }}>#</th>
                      <th style={{ padding: '8px 12px' }}>Fee Head &amp; Description</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: '110px' }}>Session / Sem</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', width: '130px' }}>Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>1</td>
                      <td style={{ padding: '10px 12px' }}>
                        <strong>{feeType}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>{description}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>Sem {semester}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency(amount)}
                      </td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                      <td colSpan={3} style={{ padding: '10px 12px', textAlign: 'right', borderTop: '2px solid #0b1d3a' }}>
                        TOTAL AMOUNT PAID:
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '1.05rem', color: '#15803d', borderTop: '2px solid #0b1d3a' }}>
                        {formatCurrency(amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount In Words */}
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#166534', fontWeight: 700 }}>Amount in Words:</span>{' '}
                  <strong style={{ color: '#15803d' }}>{amountInWords}</strong>
                </div>
                <div style={{ background: '#16a34a', color: '#ffffff', padding: '3px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '0.74rem' }}>
                  ✓ PAID &amp; SETTLED
                </div>
              </div>

              {/* Footer Stamp & QR Verification Section */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  borderTop: '2px solid #e2e8f0',
                  paddingTop: '16px',
                  marginTop: '12px'
                }}
              >
                {/* Left: Scannable QR Code */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    <QRCodeCanvas
                      value={qrVerificationPayload}
                      size={90}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a' }}>
                      🔒 DIGITAL RECEIPT QR CODE
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', maxWidth: '180px', marginTop: '2px', lineHeight: 1.3 }}>
                      Scan QR code to verify this official fee payment on GECM accounts portal.
                    </div>
                    <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: '#94a3b8', marginTop: '4px' }}>
                      REF: {receiptNo}
                    </div>
                  </div>
                </div>

                {/* Right: Accounts Stamp & Signatory */}
                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <div
                    style={{
                      border: '2px dashed #16a34a',
                      borderRadius: '50%',
                      width: '70px',
                      height: '70px',
                      margin: '0 auto 6px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: '#15803d',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      transform: 'rotate(-10deg)',
                      background: 'rgba(22, 163, 74, 0.05)'
                    }}
                  >
                    <span>★ GECM ★</span>
                    <span>ACCOUNTS</span>
                    <span>RECEIVED</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0b1d3a' }}>
                    Accounts &amp; Finance Officer
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                    Fee Collection Division
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Govt. Engineering College, Madhubani
                  </div>
                </div>
              </div>

              {/* Bottom Institutional Disclaimer */}
              <div style={{ fontSize: '0.66rem', color: '#94a3b8', textAlign: 'center', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                This is a digitally generated institutional fee receipt. Physical signature is not required. Please retain this receipt for Semester Registration, Examination Form Fillup, and No Dues Clearance.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
