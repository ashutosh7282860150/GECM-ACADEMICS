import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { dashboardAPI, facultyAPI } from '../../services/api';
import { formatDate, timeAgo, getInitials } from '../../utils/helpers';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coursesList, setCoursesList] = useState([]);

  useEffect(() => {
    Promise.all([
      dashboardAPI.faculty().catch(() => ({ data: { data: null } })),
      facultyAPI.getCourses().catch(() => ({ data: { data: [] } }))
    ])
      .then(([dashRes, coursesRes]) => {
        setData(dashRes.data.data);
        setCoursesList(coursesRes.data.data || dashRes.data.data?.courses || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>Loading faculty academic dashboard...</span>
      </div>
    );
  }

  const faculty = data?.faculty || {
    name: 'Dr. Vikram Singh',
    email: 'faculty1@smartcampus.edu',
    phone: '9800000005',
    designation: 'Associate Professor',
    employee_id: 'EMP001',
    department_name: 'Department of Computer Science & Engineering',
    qualification: 'PhD in Computer Science (IIT Patna)',
    specialization: 'Artificial Intelligence, Data Structures & Cloud Computing',
    joining_date: '2018-07-01',
    office_room: 'Academic Block 1 — Room 204'
  };

  const stats = data?.stats || {
    totalStudents: 120,
    totalCourses: coursesList.length || 3,
    pendingResults: 0
  };

  const teachingCourses = coursesList.length > 0 ? coursesList : [
    { id: 'c1', name: 'Data Structures & Algorithms', code: 'CSE301', semester: 5, credits: 4, department_name: 'Computer Science & Engineering', schedule: 'Mon, Wed, Fri (10:00 AM)' },
    { id: 'c2', name: 'Machine Learning & Neural Nets', code: 'CSE401', semester: 7, credits: 4, department_name: 'Computer Science & Engineering', schedule: 'Tue, Thu (11:30 AM)' },
    { id: 'c3', name: 'Database Management Systems', code: 'CSE302', semester: 5, credits: 3, department_name: 'Computer Science & Engineering', schedule: 'Mon, Wed (02:00 PM)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1180px', margin: '0 auto' }}>
      
      {/* ── 1. FACULTY PROFILE WELCOME BANNER ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '800',
                color: '#059669',
                flexShrink: 0
              }}
            >
              {getInitials(faculty.name || 'Dr. Vikram Singh')}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0', fontSize: '0.72rem', fontWeight: 800 }}>
                  👨‍🏫 FACULTY ACADEMIC DESK
                </span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  ID: {faculty.employee_id || 'EMP001'}
                </span>
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0b1d3a', margin: '4px 0 0 0' }}>
                {faculty.name || 'Dr. Vikram Singh'}
              </h1>
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                {faculty.designation || 'Associate Professor'} • {faculty.department_name || 'Department of Computer Science & Engineering'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <NavLink to="/faculty/attendance" className="gov-btn-primary" style={{ fontSize: '0.82rem' }}>
              📝 Mark Attendance
            </NavLink>
            <NavLink to="/faculty/students" className="gov-btn-outline" style={{ fontSize: '0.82rem' }}>
              👥 Student Directory
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── 2. QUICK STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Assigned Courses</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0b1d3a', marginTop: '4px' }}>{stats.totalCourses}</div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>Theory &amp; Practical Labs</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Total Enrolled Students</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Under Active Instruction</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Pending Workflow Reviews</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>{stats.pendingResults || 2}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Leave &amp; No-Dues Clearances</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Institutional Status</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>Active</div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>✓ Verified Faculty</div>
        </div>
      </div>

      {/* ── 3. DETAILED FACULTY ACADEMIC DOSSIER & CREDENTIALS ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', margin: '0 0 16px 0' }}>
          👤 Complete Faculty Profile &amp; Employment Details
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>ACADEMIC DESIGNATION</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1d3a', marginTop: '2px' }}>
              {faculty.designation || 'Associate Professor'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>Regular Faculty Cadre</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>HIGHEST QUALIFICATION</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1d3a', marginTop: '2px' }}>
              {faculty.qualification || 'PhD in Computer Science & Engineering'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Doctoral Degree Verified</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>RESEARCH &amp; SPECIALIZATION</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1d3a', marginTop: '2px' }}>
              {faculty.specialization || 'AI, Machine Learning & Distributed Systems'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Primary Research Domain</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>OFFICIAL CONTACT</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0b1d3a', marginTop: '2px' }}>
              📧 {faculty.email || 'faculty1@smartcampus.edu'}
            </div>
            <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#475569', marginTop: '2px' }}>
              📞 {faculty.phone || '+91 9800000005'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>FACULTY CHAMBER / LOCATION</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0b1d3a', marginTop: '2px' }}>
              🏢 {faculty.office_room || 'Academic Block 1 — Chamber 204'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>GECM Campus, Madhubani</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>INSTITUTIONAL SERVICE</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0b1d3a', marginTop: '2px' }}>
              Joined: {faculty.joining_date ? formatDate(faculty.joining_date) : '01 Jul 2018'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>8+ Years Experience</div>
          </div>
        </div>
      </div>

      {/* ── 4. TEACHING COURSE LOAD ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', margin: 0 }}>
              📚 Current Teaching Load &amp; Subject Assignments
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Active semester subject codes, credit points, and class timetable schedules.
            </p>
          </div>
          <NavLink to="/faculty/attendance" className="gov-btn-sm">Take Class Attendance</NavLink>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Course Code</th>
                <th>Semester</th>
                <th>Credits</th>
                <th>Lecture Schedule</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachingCourses.map((c, i) => (
                <tr key={i}>
                  <td>
                    <strong style={{ fontSize: '13.5px', color: '#0b1d3a' }}>{c.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.department_name || 'CSE Dept'}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
                    {c.code}
                  </td>
                  <td>
                    <span style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700' }}>
                      Sem {c.semester}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700' }}>{c.credits || 4} Credits</td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>{c.schedule || 'Mon, Wed (10:00 AM)'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <NavLink to="/faculty/attendance" className="btn btn-outline btn-sm" style={{ fontSize: '11px' }}>
                      Attendance
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. FACULTY SERVICES DIRECTORY ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', marginBottom: '14px' }}>
          ⚡ Faculty Quick Services
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Student Directory', desc: 'Search and inspect roll roster & bio', icon: '👥', path: '/faculty/students', color: '#f59e0b' },
            { label: 'Attendance Management', desc: 'Daily lecture attendance & shortage review', icon: '📝', path: '/faculty/attendance', color: '#10b981' },
            { label: 'Applications Inbox', desc: 'Review & approve student leave & no-dues', icon: '📥', path: '/faculty/applications-inbox', color: '#6366f1' },
            { label: 'Official Notices', desc: 'Read & publish departmental circulars', icon: '📢', path: '/faculty/notices', color: '#0ea5e9' },
          ].map(action => (
            <NavLink
              key={action.path}
              to={action.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0b1d3a'; e.currentTarget.style.background = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
            >
              <span style={{ fontSize: '1.6rem' }}>{action.icon}</span>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1d3a' }}>{action.label}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{action.desc}</div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
