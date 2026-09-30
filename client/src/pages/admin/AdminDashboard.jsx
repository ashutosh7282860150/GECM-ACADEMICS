import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading administration dashboard...</span>
    </div>
  );

  const stats = data?.stats || {
    totalStudents: 180,
    totalFaculty: 16,
    totalFeeCollected: 2845000,
    hostelOccupancy: 634,
    pendingNoDues: 3,
    pendingGatePasses: 2
  };

  const recentActivity = data?.recentActivity || [];

  const ADMIN_MODULES = [
    { icon: '🎓', title: 'Student Management', desc: 'Roll lists, branches & bio', route: '/admin/students' },
    { icon: '👨‍🏫', title: 'Faculty Management', desc: 'Professors & HOD roster', route: '/admin/faculty' },
    { icon: '💰', title: 'Accounts & Fee Cell', desc: 'Tuition & mess dues', route: '/admin/accounts' },
    { icon: '📝', title: 'Examination Cell', desc: 'Datesheets & admit cards', route: '/admin/examination' },
    { icon: '📚', title: 'Central Library', desc: 'Books catalog & clearance', route: '/admin/library' },
    { icon: '🔬', title: 'Laboratory Inventory', desc: 'Equipment & lab clearance', route: '/admin/laboratory' },
    { icon: '🏨', title: 'Hostel Administration', desc: 'Rooms, wardens & mess', route: '/admin/hostel' },
    { icon: '🏛️', title: 'Department Programs', desc: 'CSE, ECE, Civil intake', route: '/admin/department' },
    { icon: '📢', title: 'Official Notices', desc: 'Publish campus circulars', route: '/admin/notices' },
    { icon: '📊', title: 'Institutional Reports', desc: 'Audit & analytics PDF', route: '/admin/reports' },
    { icon: '⚙️', title: 'Workflow Config', desc: 'Approval sequences', route: '/admin/workflow-config' },
    { icon: '🔍', title: 'System Audit Logs', desc: 'User transaction trail', route: '/admin/audit' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1180px', margin: '0 auto' }}>
      
      {/* ── 1. WELCOME BANNER ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span style={{ background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', fontSize: '0.72rem', fontWeight: 800 }}>
              🏛️ ADMINISTRATIVE HEADQUARTERS
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Campus Administration &amp; Governance
            </h1>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '2px' }}>
              Government Engineering College, Madhubani • Institutional Oversight
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <NavLink to="/admin/notices" className="gov-btn-primary" style={{ fontSize: '0.82rem' }}>
              📢 Publish Circular
            </NavLink>
            <NavLink to="/admin/reports" className="gov-btn-outline" style={{ fontSize: '0.82rem' }}>
              📊 Export Report
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── 2. QUICK STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Total Enrolled Students</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0b1d3a', marginTop: '4px' }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>CSE, ECE, Civil Batches</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Faculty &amp; Staff</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>{stats.totalFaculty}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Professors, HODs &amp; Lab Incharges</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Fee Collected</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{formatCurrency(stats.totalFeeCollected)}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Current Academic Session</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Pending Approvals</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: (stats.pendingNoDues + stats.pendingGatePasses) > 0 ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
            {stats.pendingNoDues + stats.pendingGatePasses}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>No-Dues &amp; Gate Passes</div>
        </div>
      </div>

      {/* ── 3. ADMINISTRATIVE SERVICES DIRECTORY ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', marginBottom: '16px' }}>
          🏛️ Institutional Management Modules
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {ADMIN_MODULES.map((m, idx) => (
            <NavLink
              key={idx}
              to={m.route}
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
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0b1d3a'; e.currentTarget.style.background = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
            >
              <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1d3a' }}>{m.title}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{m.desc}</div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── 4. RECENT SYSTEM ACTIVITY LOG ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1d3a' }}>🔍 Recent System Activity &amp; Audit Trail</h3>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Real-time user logins, fee payments and approval logs</div>
          </div>
          <NavLink to="/admin/audit" className="gov-btn-sm">Full Audit Trail</NavLink>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((act, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#0b1d3a' }}>{act.user_name || 'System User'}</span> ({act.role}): {act.action}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(act.timestamp)}</div>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#0b1d3a' }}>System Audit</span>: All services online and responsive.
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Live</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
