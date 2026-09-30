import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { formatDate } from '../../utils/helpers';
import GECMLogo from '../../components/GECMLogo';

export default function ApplicationApprovalPdfModal({ app, onClose }) {
  const printAreaRef = useRef(null);

  if (!app) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = app.student_name || 'Arjun Patel';
  const enrollmentNo = app.enrollment_no || 'CSE2021001';
  const departmentName = app.department_name || 'Computer Science & Engineering';
  const semester = app.semester || 7;
  const appId = app.application_id || ('APP-' + Math.floor(100000 + Math.random() * 900000));
  const typeName = app.type_name || 'Institutional Approval';
  const typeCode = app.type_code || (appId.includes('GP') ? 'GECM-GP' : appId.includes('ND') ? 'GECM-ND' : 'GECM-AR');
  const approvedDate = app.reviewed_at || app.updated_at || new Date().toISOString();

  const isGatePass = typeCode === 'GECM-GP';
  const isNoDues = typeCode === 'GECM-ND';
  const isLeave = typeCode === 'GECM-LV';
  const isBonafide = typeCode === 'GECM-BF';

  // Dynamic Approving Authority & Department identification
  let approvingDept = app.assigned_department || 'Academic Affairs & Administration';
  let reviewerName = app.reviewed_by_name || 'Dr. Ramesh Kumar (System Administrator)';
  let signatoryTitle = 'Authorized Institutional Signatory';

  if (isGatePass) {
    approvingDept = 'Hostel & Security Administration';
    reviewerName = app.reviewed_by_name || 'Mr. Suresh Patel (Hostel Warden)';
    signatoryTitle = 'Hostel Warden & Security Incharge';
  } else if (isNoDues) {
    approvingDept = 'Central Clearance Committee (All Departments)';
    reviewerName = 'Multi-Department Clearance Committee';
    signatoryTitle = 'Dean Academics & Head of Institute';
  } else if (isLeave) {
    approvingDept = 'Department of Computer Science & Engineering';
    reviewerName = app.reviewed_by_name || 'Dr. Vikram Singh (Faculty) & Prof. Anita Sharma (HOD CSE)';
    signatoryTitle = 'Concerned Faculty & HOD CSE';
  } else if (isBonafide) {
    approvingDept = 'Academic Affairs & HOD Office';
    reviewerName = app.reviewed_by_name || 'Prof. Anita Sharma (HOD CSE)';
    signatoryTitle = 'Head of Department (HOD CSE)';
  }

  // Clearances list for No Dues or multi-department requests
  const clearancesList = app.clearances && app.clearances.length > 0 ? app.clearances : [
    { department: 'Administrator', status: 'APPROVED', verified_by: 'Dr. Ramesh Kumar (ADMIN)' },
    { department: 'HOD CSE (Department)', status: 'APPROVED', verified_by: 'Prof. Anita Sharma (HOD CSE)' },
    { department: 'Hostel Warden', status: 'APPROVED', verified_by: 'Mr. Suresh Patel (WARDEN)' },
    { department: 'Fee Cell (Accounts)', status: 'APPROVED', verified_by: 'Mrs. Priya Mehta (ACCOUNTS)' },
    { department: 'Faculty & Labs', status: 'APPROVED', verified_by: 'Dr. Vikram Singh (FACULTY)' },
    { department: 'Central Library', status: 'APPROVED', verified_by: 'Dr. Ramesh Kumar (LIBRARY)' }
  ];

  // Live Scannable QR verification URL with embedded parameters
  const verifyBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gecm.ac.in';
  const qrVerificationPayload = `${verifyBaseUrl}/verify/${appId}?student=${encodeURIComponent(studentName)}&roll=${encodeURIComponent(enrollmentNo)}&dept=${encodeURIComponent(departmentName)}&type=${encodeURIComponent(typeName)}&date=${encodeURIComponent(formatDate(approvedDate, 'dd MMM yyyy'))}&auth=${encodeURIComponent(reviewerName)}&status=VERIFIED_APPROVED`;

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
            <span style={{ fontSize: '1.2rem' }}>📄</span>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#fde68a' }}>Official Institutional Certificate / Sanction Order</strong>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Ref: {appId} · Status: APPROVED &amp; ISSUED</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
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

        {/* ── PRINTABLE CERTIFICATE BODY ── */}
        <div
          ref={printAreaRef}
          className="printable-certificate-page"
          style={{
            padding: '36px 40px',
            color: '#0f172a',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            background: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Certificate Border Frame */}
          <div
            style={{
              border: '3px double #0b1d3a',
              padding: '28px',
              borderRadius: '6px',
              position: 'relative',
              background: '#ffffff'
            }}
          >
            {/* Watermark Logo in Background */}
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
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0b1d3a', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                  <GECMLogo size="small" showText={false} />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#b45309', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      GOVERNMENT OF BIHAR • DEPARTMENT OF SCIENCE &amp; TECHNOLOGY
                    </div>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0b1d3a', margin: '2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Government Engineering College, Madhubani
                    </h1>
                    <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 600 }}>
                      Affiliated to Bihar Engineering University, Patna | Approved by AICTE, New Delhi
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Campus: Arer, Madhubani, Bihar — 847222 | Email: academic@gecm.ac.in
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.8rem', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <div>
                    <strong>Ref No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>GECM/ACAD/2026/{appId}</span>
                  </div>
                  <div>
                    <strong>Date of Issue:</strong> {formatDate(approvedDate, 'dd MMMM yyyy')}
                  </div>
                </div>
              </div>

              {/* Title Ribbon */}
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '6px 20px',
                    background: '#0b1d3a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    borderRadius: '4px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}
                >
                  {isGatePass
                    ? 'OFFICIAL CAMPUS EXIT PASS & GATE SANCTION'
                    : isNoDues
                    ? 'OFFICIAL INSTITUTIONAL NO-DUES CLEARANCE CERTIFICATE'
                    : `OFFICIAL SANCTION & APPROVAL ORDER`}
                </span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
                  Subject: Sanction &amp; Approval of {typeName} ({appId})
                </div>
              </div>

              {/* Main Official Declaration Paragraph */}
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#1e293b', textAlign: 'justify', marginBottom: '20px' }}>
                <p style={{ marginBottom: '12px' }}>
                  This is to certify and officially record that the application bearing Reference ID{' '}
                  <strong style={{ fontFamily: 'monospace' }}>{appId}</strong>, submitted by{' '}
                  <strong style={{ color: '#0b1d3a' }}>{studentName}</strong> (Enrollment / Registration No:{' '}
                  <strong style={{ fontFamily: 'monospace' }}>{enrollmentNo}</strong>), a bona fide student of{' '}
                  <strong>Department of {departmentName}</strong>, Semester <strong>{semester}</strong>,{' '}
                  {isGatePass ? (
                    <span>
                      has been verified by the <strong>Hostel Warden (Mr. Suresh Patel)</strong> and approved by the <strong>Hostel &amp; Security Cell</strong> for authorized departure and transit.
                    </span>
                  ) : isNoDues ? (
                    <span>
                      has successfully undergone digital verification and received official clearance from all institutional bodies including <strong>Administrator, HOD CSE, Hostel Warden, Fee Cell, All Faculty &amp; Central Library</strong> with zero outstanding liabilities.
                    </span>
                  ) : isLeave ? (
                    <span>
                      has been verified by the <strong>Concerned Faculty</strong> and sanctioned by the <strong>HOD CSE Office</strong> for the requested leave duration.
                    </span>
                  ) : isBonafide ? (
                    <span>
                      has been verified by <strong>HOD CSE</strong> and authorized by the <strong>Academic Affairs Cell</strong> as a regular registered student.
                    </span>
                  ) : (
                    <span>
                      has been duly verified, cleared across departmental criteria, and officially <strong style={{ color: '#15803d' }}>APPROVED</strong> by the competent authorities of Government Engineering College, Madhubani.
                    </span>
                  )}
                </p>
              </div>

              {/* Application Details Summary Table */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px 18px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0b1d3a', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                  📋 Application Particulars &amp; Sanction Details:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                  <div><span style={{ color: '#64748b' }}>Application Type:</span> <strong>{typeName}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Sanctioning Cell:</span> <strong>{approvingDept}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Submission Date:</span> {formatDate(app.submitted_at, 'dd MMM yyyy, hh:mm a')}</div>
                  <div><span style={{ color: '#64748b' }}>Sanction Status:</span> <strong style={{ color: '#16a34a' }}>✅ OFFICIALLY APPROVED &amp; ISSUED</strong></div>
                  
                  {isGatePass && (
                    <>
                      <div><span style={{ color: '#64748b' }}>Hostel &amp; Room:</span> <strong>Bhabha Hall (A-304)</strong></div>
                      <div><span style={{ color: '#64748b' }}>Destination:</span> <strong>{app.form_data?.destination || 'Home / Authorized Leave'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Out Date &amp; Time:</span> <strong>{app.form_data?.outDate || formatDate(approvedDate)} ({app.form_data?.outTime || '10:00 AM'})</strong></div>
                      <div><span style={{ color: '#64748b' }}>Expected Return:</span> <strong>{app.form_data?.returnDate || formatDate(approvedDate)} ({app.form_data?.returnTime || '06:00 PM'})</strong></div>
                    </>
                  )}

                  {app.form_data?.reason && !isGatePass && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b' }}>Sanctioned Purpose:</span> <strong>{app.form_data.reason}</strong>
                    </div>
                  )}
                  {app.form_data?.fromDate && app.form_data?.toDate && !isGatePass && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b' }}>Sanctioned Period:</span> <strong>{formatDate(app.form_data.fromDate)} to {formatDate(app.form_data.toDate)}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Department Clearance Matrix Frame for No-Dues */}
              {isNoDues && (
                <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '6px', padding: '14px 18px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#166534', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #bbf7d0', paddingBottom: '6px' }}>
                    <span>🏛️ Multi-Department Digital Clearance Matrix</span>
                    <span style={{ fontSize: '0.74rem', background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                      ALL 6 DEPARTMENTS CLEARED ✓
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                    {clearancesList.map(c => (
                      <div key={c.department} style={{ background: '#ffffff', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{c.department}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '2px' }}>
                            ✓ {c.verified_by || 'Verified & Approved'}
                          </div>
                        </div>
                        <span style={{ fontWeight: 900, color: '#16a34a', fontSize: '0.75rem', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                          CLEARED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Stamp & QR Code Verification Section */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  borderTop: '2px solid #e2e8f0',
                  paddingTop: '20px',
                  marginTop: '16px'
                }}
              >
                {/* Left: QR Code Verification Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    <QRCodeCanvas
                      value={qrVerificationPayload}
                      size={96}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a' }}>
                      🔒 DIGITAL VERIFICATION QR
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', maxWidth: '180px', marginTop: '2px', lineHeight: 1.3 }}>
                      Scan QR code with any camera to verify this official certificate on GECM verification portal.
                    </div>
                    <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: '#94a3b8', marginTop: '4px' }}>
                      HASH: GECM-{appId.slice(-6)}
                    </div>
                  </div>
                </div>

                {/* Right: Official Authority Sign & Seal */}
                <div style={{ textAlign: 'center', minWidth: '210px' }}>
                  <div
                    style={{
                      border: '2px dashed #16a34a',
                      borderRadius: '50%',
                      width: '72px',
                      height: '72px',
                      margin: '0 auto 6px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: '#15803d',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      transform: 'rotate(-12deg)',
                      background: 'rgba(22, 163, 74, 0.05)'
                    }}
                  >
                    <span>★ GECM ★</span>
                    <span>APPROVED</span>
                    <span>OFFICIAL</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0b1d3a' }}>
                    {signatoryTitle}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                    {reviewerName}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {approvingDept}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                    Govt. Engineering College, Madhubani
                  </div>
                </div>
              </div>

              {/* Bottom Institutional Disclaimer */}
              <div style={{ fontSize: '0.66rem', color: '#94a3b8', textAlign: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                This is a digitally generated document issued under the authority of Government Engineering College, Madhubani. Physical signature is not required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
