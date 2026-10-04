import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { libraryAPI, dashboardAPI } from '../../services/api';
import { formatDate, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function LibraryDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await libraryAPI.getStats();
      const circs = await libraryAPI.getCirculations();
      const reqs = await libraryAPI.getClearanceRequests();
      setData({
        stats: res?.data?.data || {},
        recentCirculations: (circs?.data?.data || []).slice(0, 5),
        recentClearance: (reqs?.data?.data || []).slice(0, 5)
      });
    } catch (err) {
      console.error('Failed to load library dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>Loading Central Library Dashboard...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const pendingNoDues = stats.pendingNoDues || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1180px', margin: '0 auto', padding: '20px' }}>
      
      {/* ── 1. WELCOME BANNER ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '4px', border: '1px solid #bfdbfe', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                🏛️ CENTRAL LIBRARY &amp; INFORMATION DIVISION
              </span>
              <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '4px', border: '1px solid #bbf7d0', fontSize: '0.72rem', fontWeight: 800 }}>
                ACTIVE INCHARGE WORKSPACE
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1d3a', margin: '4px 0' }}>
              📚 Library Incharge Portal &amp; Clearance Desk
            </h1>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
              Government Engineering College, Madhubani • Book Catalog, RFID Circulation &amp; Digital No-Dues Clearance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <NavLink to="/library/nodues" className="gov-btn-primary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✅</span> Verify No-Dues ({pendingNoDues})
            </NavLink>
            <NavLink to="/library/catalog" className="gov-btn-secondary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📚</span> Catalog &amp; Circulation
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── 2. STATS COUNTER GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Book Titles</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0b1d3a', marginTop: '4px' }}>
            {stats.totalTitles || 8}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>
            {stats.totalCopies || 45200} Physical Volumes in Stacks
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Borrowings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>
            {stats.activeBorrowingsCount || 4} Books
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Issued across Engineering Batches
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Overdue Fines Pending</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>
            ₹{stats.totalFinesPending || 60}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600 }}>
            ⚠️ {stats.overdueCount || 1} Overdue Book(s)
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pending No-Dues Desk</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: pendingNoDues > 0 ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
            {pendingNoDues} Applications
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>
            {stats.clearanceRate || '98.5%'} Clearance Rate
          </div>
        </div>
      </div>

      {/* ── 3. DEDICATED LIBRARY SERVICES DIRECTORY ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', marginBottom: '16px' }}>
          📚 Library Department Modules
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {[
            { icon: '✅', title: 'Library No-Dues Clearance', desc: 'Verify book returns, fines & digital clearance stamps', route: '/library/nodues', color: '#16a34a', badge: `${pendingNoDues} Pending` },
            { icon: '📚', title: 'Book Catalog & Stacks', desc: 'Browse catalog, add new textbook editions & shelf racks', route: '/library/catalog', color: '#1d4ed8' },
            { icon: '🔄', title: 'Circulation & Return Desk', desc: 'Issue books, 1-click returns & extend loan renewals', route: '/library/circulations', color: '#b45309' },
            { icon: '📥', title: 'Department Applications Inbox', desc: 'Review student clearance applications dispatched to Library', route: '/library/applications-inbox', color: '#0f766e' }
          ].map((m, idx) => (
            <NavLink
              key={idx}
              to={m.route}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0b1d3a'; e.currentTarget.style.background = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0b1d3a' }}>{m.title}</div>
                  {m.badge && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fee2e2', color: '#dc2626', padding: '2px 7px', borderRadius: '999px' }}>
                      {m.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{m.desc}</div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── 4. RECENT NO-DUES CLEARANCE REQUESTS PREVIEW ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1d3a', margin: 0 }}>
            📋 Recent Student No-Dues Clearance Applications
          </h2>
          <NavLink to="/library/nodues" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1d4ed8', textDecoration: 'none' }}>
            Open Full Clearance Desk →
          </NavLink>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Student</th>
                <th style={{ padding: '10px 12px' }}>Enrollment No</th>
                <th style={{ padding: '10px 12px' }}>Department</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Library Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Date</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentClearance || []).map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0b1d3a' }}>{r.student_name}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#475569' }}>{r.enrollment_no}</td>
                  <td style={{ padding: '10px 12px' }}>{r.department_name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      background: r.library_status === 'approved' ? '#f0fdf4' : '#fffbeb',
                      color: r.library_status === 'approved' ? '#16a34a' : '#b45309'
                    }}>
                      {r.library_status === 'approved' ? '✓ Cleared' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{timeAgo(r.created_at)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <NavLink to="/library/nodues" className="gov-btn-sm" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      Review
                    </NavLink>
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
