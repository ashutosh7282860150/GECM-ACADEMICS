import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, getStatusBadgeClass, getStatusLabel, formatDate } from '../../utils/helpers';
import { NOTICES_DATA } from '../../data/mockData';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const fetchDashboard = () => {
    dashboardAPI.student()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading student dashboard...</span>
    </div>
  );

  const student = data?.student || {
    name: 'Arjun Patel',
    enrollment_no: 'CSE2021001',
    department_name: 'Computer Science & Engineering',
    semester: 7,
    academic_year: '2026-27'
  };

  const attendance = data?.attendance || { percentage: 88 };
  const fees = data?.fees || { pending: 0, overdue: 0, paid: 28500 };
  const noDues = data?.noDues;
  const gatePasses = data?.gatePasses || [];

  const STUDENT_QUICK_SERVICES = [
    { icon: '👤', title: 'Student Profile', desc: 'Personal & Academic Bio', route: '/student/profile' },
    { icon: '📑', title: 'Course Registration', desc: 'Semester 7 Subjects', route: '/student/course-registration' },
    { icon: '📊', title: 'Attendance', desc: '88% Overall Compliance', route: '/student/attendance' },
    { icon: '📝', title: 'Examination', desc: 'Hall Tickets & Schedule', route: '/student/examination' },
    { icon: '🏆', title: 'Results & Grades', desc: 'SGPA 8.84 • CGPA 8.62', route: '/student/results' },
    { icon: '💳', title: 'Fees & Receipts', desc: 'Tuition & Mess Ledger', route: '/student/fees' },
    { icon: '🚪', title: 'Digital Gate Pass', desc: 'Campus Outing Pass', route: '/student/gate-pass' },
    { icon: '✅', title: 'No-Dues Clearance', desc: 'Institutional Clearance', route: '/student/no-dues' },
    { icon: '📚', title: 'Assignments', desc: 'Submissions & Deadlines', route: '/student/assignments' },
    { icon: '📅', title: 'Time Table', desc: 'Weekly Lectures & Labs', route: '/student/timetable' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1180px', margin: '0 auto' }}>
      
      {/* ── 1. WELCOME BANNER ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', fontSize: '0.72rem', fontWeight: 800 }}>
                🎓 STUDENT PORTAL
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Roll: <strong>{student.enrollment_no}</strong></span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1d3a', lineHeight: 1.1 }}>
              Welcome, {student.name}!
            </h1>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '4px' }}>
              {student.department_name} • Semester {student.semester} • Session {student.academic_year}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <NavLink to="/student/gate-pass" className="gov-btn-primary" style={{ fontSize: '0.82rem' }}>
              🚪 Apply Gate Pass
            </NavLink>
            <NavLink to="/student/no-dues" className="gov-btn-outline" style={{ fontSize: '0.82rem' }}>
              ✅ No-Dues Status
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── 2. QUICK STATISTICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* Attendance Stat */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Overall Attendance</span>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: attendance.percentage >= 75 ? '#16a34a' : '#dc2626', marginTop: '4px' }}>
            {attendance.percentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: attendance.percentage >= 75 ? '#16a34a' : '#dc2626', fontWeight: 700, marginTop: '2px' }}>
            {attendance.percentage >= 75 ? '✅ Eligible for Exams (>75%)' : '⚠️ Short Attendance'}
          </div>
        </div>

        {/* Current Semester */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Current Semester</span>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0b1d3a', marginTop: '4px' }}>
            Sem {student.semester}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            B.Tech 4th Year (Final Year)
          </div>
        </div>

        {/* Pending Fees */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Pending Fees</span>
            <span style={{ fontSize: '1.2rem' }}>💳</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: fees.pending > 0 ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
            {formatCurrency(fees.pending)}
          </div>
          <div style={{ fontSize: '0.75rem', color: fees.pending > 0 ? '#dc2626' : '#16a34a', fontWeight: 700, marginTop: '2px' }}>
            {fees.pending > 0 ? '⚠️ Dues Pending' : '✅ All Fees Paid'}
          </div>
        </div>

        {/* Gate Passes & Applications */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Active Gate Pass</span>
            <span style={{ fontSize: '1.2rem' }}>🚪</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
            {gatePasses.length > 0 ? gatePasses[0].destination : 'No Active Pass'}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {gatePasses.length > 0 ? (
              <>
                <span style={{
                  fontWeight: 800,
                  color: gatePasses[0].status?.toLowerCase() === 'approved' ? '#16a34a' : gatePasses[0].status?.toLowerCase() === 'rejected' ? '#dc2626' : '#b45309'
                }}>
                  {gatePasses[0].status?.toLowerCase() === 'approved' ? '✅ APPROVED' : gatePasses[0].status?.toLowerCase() === 'rejected' ? '❌ REJECTED' : '⏳ PENDING WARDEN'}
                </span>
                {gatePasses[0].status?.toLowerCase() === 'approved' && (
                  <NavLink to="/student/gate-pass" style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textDecoration: 'none' }}>
                    📱 View QR Pass →
                  </NavLink>
                )}
              </>
            ) : (
              <span style={{ color: '#64748b' }}>Campus In-Bounds</span>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. QUICK SERVICES DIRECTORY ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a' }}>
              ⚡ Student Academic Services
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Click any module to open your records, submit forms and track approvals.
            </p>
          </div>
          <NavLink to="/services" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309', textDecoration: 'none' }}>
            View All Services →
          </NavLink>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {STUDENT_QUICK_SERVICES.map((s, idx) => (
            <NavLink
              key={idx}
              to={s.route}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0b1d3a'; e.currentTarget.style.background = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
            >
              <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0b1d3a' }}>{s.title}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{s.desc}</div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── 4. TWO-COLUMN WORKFLOW & NOTICES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* No-Dues Clearance Progress */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1d3a' }}>✅ No-Dues Clearance Tracker</h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Multi-department clearance sequence</div>
            </div>
            <NavLink to="/student/no-dues" className="gov-btn-sm">Open No-Dues</NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Hostel & Mess Cell', status: noDues?.hostel_status || 'approved', icon: '🏨' },
              { label: 'Central Library', status: noDues?.library_status || 'approved', icon: '📚' },
              { label: 'Accounts & Tuition Cell', status: noDues?.accounts_status || 'approved', icon: '💰' },
              { label: 'Academic & HOD Approval', status: noDues?.admin_status || 'pending', icon: '🏛️' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600, color: '#0b1d3a' }}>
                  <span>{step.icon}</span>
                  <span>{step.label}</span>
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: step.status === 'approved' ? '#f0fdf4' : '#fffbeb',
                  color: step.status === 'approved' ? '#16a34a' : '#b45309',
                  border: `1px solid ${step.status === 'approved' ? '#bbf7d0' : '#fde68a'}`
                }}>
                  {step.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Official Notices */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1d3a' }}>📢 Official Campus Circulars</h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Latest notices from exam &amp; academic cells</div>
            </div>
            <NavLink to="/notices" className="gov-btn-sm">All Notices</NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {NOTICES_DATA.slice(0, 3).map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedNotice(n)}
                style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309' }}>{n.category} • {n.date}</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>📍 {n.dept}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0b1d3a' }}>{n.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notice Modal */}
      {selectedNotice && (
        <div className="gov-modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="gov-modal-close" onClick={() => setSelectedNotice(null)}>✕</button>
            <div className="gov-modal-header" style={{ textAlign: 'left' }}>
              <span className="gov-notice-tag">{selectedNotice.category}</span>
              <h3 className="gov-modal-title" style={{ marginTop: '8px', fontSize: '1.15rem' }}>{selectedNotice.title}</h3>
              <p className="gov-modal-sub" style={{ marginTop: '4px' }}>Issued by: <strong>{selectedNotice.dept}</strong> | Date: <strong>{selectedNotice.date}</strong></p>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, padding: '16px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              {selectedNotice.details}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button className="gov-btn-primary" onClick={() => setSelectedNotice(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
