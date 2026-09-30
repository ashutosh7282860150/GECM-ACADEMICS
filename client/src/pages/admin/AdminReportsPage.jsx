import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const reportsList = [
    { title: 'Semester Attendance Audit Report (75% Shortage List)', desc: 'List of students with under 75% attendance eligible for debarment review.', category: 'Academic', date: '28 SEP 2026' },
    { title: 'Institutional Fee Collection & Defaulter Registry', desc: 'Detailed department-wise breakdown of tuition, mess and hostel dues.', category: 'Accounts', date: '25 SEP 2026' },
    { title: 'AICTE / NIRF Mandatory Disclosure Analytics', desc: 'Faculty cadre ratios, laboratory equipment compliance and student intake data.', category: 'Accreditation', date: '20 SEP 2026' },
    { title: 'Hostel Outing & Warden Gate Pass Security Log', desc: 'Consolidated report on active outings, biometric entries and warden approvals.', category: 'Hostel & Security', date: '18 SEP 2026' },
    { title: 'Campus Recruitment & Placement Statistics 2026', desc: 'Branch-wise placement percentage, average CTC and recruiter registration count.', category: 'Placement', date: '15 SEP 2026' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              INSTITUTIONAL ANALYTICS &amp; GOVERNANCE
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Institutional Audits &amp; Academic Reports
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Download official institutional analytics, audit reports, attendance compilations and compliance summaries.
            </p>
          </div>

          <button className="gov-btn-primary" onClick={() => toast.success('Comprehensive Annual Academic Report 2026 exported')}>
            📥 Generate Annual Report
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {reportsList.map((r, i) => (
          <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#f8fafc', color: '#0b1d3a', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                {r.category}
              </span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginTop: '4px' }}>{r.title}</h2>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>{r.desc}</p>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Generated on: <strong>{r.date}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="gov-btn-outline"
                style={{ fontSize: '0.8rem' }}
                onClick={() => toast.success(`Viewing analytics for ${r.title}`)}
              >
                📊 View Analytics
              </button>
              <button
                className="gov-btn-primary"
                style={{ fontSize: '0.8rem' }}
                onClick={() => toast.success(`Downloaded official PDF for ${r.title}`)}
              >
                📥 Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
