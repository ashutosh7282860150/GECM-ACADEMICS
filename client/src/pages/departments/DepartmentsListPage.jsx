import { DEPARTMENTS_DATA } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import InstitutionalHeader from '../../components/InstitutionalHeader';

export default function DepartmentsListPage() {
  const navigate = useNavigate();
  const depts = Object.values(DEPARTMENTS_DATA);

  return (
    <div className="gov-landing-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Unified Responsive Header */}
      <InstitutionalHeader />

      {/* Main Content */}
      <main className="gov-container" style={{ padding: '36px 20px', flex: 1 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="gov-section-tag" style={{ background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
              ACADEMIC DEPARTMENTS
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              B.Tech Engineering Departments
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Undergraduate engineering degree programs offered at Government Engineering College, Madhubani.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {depts.map((d) => (
              <div
                key={d.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#0b1d3a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                      {d.code}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700 }}>
                      Intake: {d.intake} Seats
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '8px' }}>
                    {d.name}
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
                    {d.overview}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', marginBottom: '14px' }}>
                    <div><strong>Head of Department:</strong> {d.hod.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', marginTop: '2px' }}>{d.hod.qualification}</div>
                  </div>
                </div>

                <button
                  className="gov-btn-primary w-full"
                  onClick={() => navigate(`/departments/${d.id}`)}
                  style={{ justifyContent: 'center' }}
                >
                  View Department Page →
                </button>
              </div>
            ))}
          </div>
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
