import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { DEPARTMENTS_DATA } from '../../data/mockData';
import InstitutionalHeader from '../../components/InstitutionalHeader';

export default function DepartmentDetailPage() {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const dept = DEPARTMENTS_DATA[deptId?.toLowerCase()] || DEPARTMENTS_DATA.cse;

  return (
    <div className="gov-landing-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Unified Responsive Header */}
      <InstitutionalHeader />

      {/* Main Content */}
      <main className="gov-container" style={{ padding: '36px 20px', flex: 1 }}>
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => navigate('/departments')}
            style={{ background: 'none', border: 'none', color: '#b45309', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← Back to All Departments
          </button>
        </div>

        {/* Header Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span className="gov-section-tag" style={{ background: '#0b1d3a', color: '#ffffff', padding: '3px 8px', borderRadius: '4px' }}>
                B.TECH DEGREE PROGRAM
              </span>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
                {dept.fullName}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                Established in {dept.established} • Approved Intake: <strong>{dept.intake} Students / Year</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.keys(DEPARTMENTS_DATA).map(k => (
                <NavLink
                  key={k}
                  to={`/departments/${k}`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: dept.id === k ? '#0b1d3a' : '#f1f5f9',
                    color: dept.id === k ? '#ffffff' : '#334155'
                  }}
                >
                  {k.toUpperCase()}
                </NavLink>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '18px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            {dept.overview}
          </div>
        </div>

        {/* 2-Column Grid for HOD & Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* HOD Info Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              👨‍🏫 Head of Department (HOD)
            </h2>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1d3a' }}>{dept.hod.name}</div>
            <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>{dept.hod.designation}</div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}><strong>Qualifications:</strong> {dept.hod.qualification}</div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}><strong>Experience:</strong> {dept.hod.experience}</div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}><strong>Email:</strong> {dept.hod.email}</div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}><strong>Phone:</strong> {dept.hod.phone}</div>
          </div>

          {/* Department Contact Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              📍 Department Contact &amp; Location
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: '8px' }}>
              <strong>Location:</strong> Academic Block 2, Floor 2, GEC Madhubani Campus, Bihar - 847211
            </p>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: '8px' }}>
              <strong>Department Enquiry:</strong> dept.{dept.id}@gecmadhubani.ac.in
            </p>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>Office Hours:</strong> 09:30 AM - 05:00 PM (Monday to Saturday)
            </p>
          </div>
        </div>

        {/* Faculty List */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px' }}>
            👥 Department Faculty Members
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {dept.faculty.map((f, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', background: '#f8fafc' }}>
                <div style={{ fontWeight: 700, color: '#0b1d3a', fontSize: '0.9rem' }}>{f.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>{f.role}</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>{f.spec}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Laboratories & Infrastructure */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px' }}>
            🔬 Laboratories &amp; Technical Infrastructure
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {dept.laboratories.map((lab, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px', background: '#f8fafc' }}>
                <div style={{ fontWeight: 700, color: '#0b1d3a', fontSize: '0.9rem' }}>{lab.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Capacity / PCs: <strong>{lab.pcs} Workstations</strong></div>
                <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>Tools: {lab.os}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses & Timetable */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Courses */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '12px' }}>
              📚 Core Courses &amp; Modules
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dept.courses.map((c, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.82rem' }}>
                  <div>
                    <strong>{c.code}</strong> — {c.name}
                  </div>
                  <span style={{ color: '#b45309', fontWeight: 700 }}>{c.credits} Credits</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timetable */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '12px' }}>
              📅 Class Timetable (Current Semester)
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dept.timetable.map((t, i) => (
                <li key={i} style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 700, color: '#0b1d3a' }}>{t.time}</div>
                  <div style={{ color: '#475569' }}>{t.subject} • <span style={{ color: '#64748b' }}>{t.room}</span></div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Department Notices */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '12px' }}>
            📢 Department Circulars &amp; Announcements
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dept.notices.map((n, i) => (
              <li key={i} style={{ padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '0.84rem', color: '#92400e' }}>
                📌 {n}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="gov-footer" style={{ marginTop: 'auto' }}>
        <div className="gov-container">
          <div className="gov-footer-bottom" style={{ border: 'none', padding: '16px 0 0' }}>
            <p>© 2026 Government Engineering College, Madhubani. Dept. of Science, Technology &amp; Technical Education, Govt. of Bihar.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
