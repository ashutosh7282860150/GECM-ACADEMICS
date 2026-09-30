import InstitutionalHeader from '../components/InstitutionalHeader';

export default function PublicAboutPage() {
  return (
    <div className="gov-landing-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Unified Responsive Header */}
      <InstitutionalHeader />

      {/* Main Content */}
      <main className="gov-container" style={{ padding: '36px 20px', flex: 1 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '32px', marginBottom: '24px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <span className="gov-section-tag" style={{ background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
              INSTITUTION OVERVIEW
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Government Engineering College, Madhubani
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px' }}>
              A Premier Government Technical Institution under Department of Science, Technology &amp; Technical Education, Govt. of Bihar.
            </p>
          </div>

          <div className="gov-about-grid" style={{ alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.65, marginBottom: '14px' }}>
                Government Engineering College, Madhubani (GECM) is a government technical institution under the Department of Science, Technology &amp; Technical Education, Government of Bihar.
              </p>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.65, marginBottom: '20px' }}>
                The institution offers AICTE-approved undergraduate B.Tech engineering programs across core disciplines, supported by digital academic workflows, modern laboratories, smart classrooms, and faculty mentoring systems.
              </p>

              {/* Information Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🏛️</div>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '4px' }}>Govt. Technical College</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Department of Science &amp; Technology, Government of Bihar. AICTE Approved &amp; University Affiliated.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>⚡</div>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '4px' }}>Digital ERP System</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Integrated Academic Management, Attendance, Digital Gate Pass, No-Dues &amp; Examination workflows.
                  </p>
                </div>
              </div>

              {/* Quick Institutional Highlights */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '10px' }}>Campus Infrastructure &amp; Location</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: '#475569' }}>
                  <li>📍 <strong>Campus:</strong> Araria Sangram, Jhanjharpur, District Madhubani, Bihar - 847211</li>
                  <li>🎓 <strong>Affiliation:</strong> Bihar Engineering University (BEU), Patna</li>
                  <li>📚 <strong>Intake:</strong> 180 B.Tech Seats Annually across CSE, ECE and Civil</li>
                  <li>🌐 <strong>Official Portal:</strong> gecmadhubani.ac.in</li>
                </ul>
              </div>
            </div>

            {/* Clean Framed Campus Image */}
            <div>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <img
                  src="/gecm_campus.jpg"
                  alt="Government Engineering College Madhubani Administrative Block"
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '320px', objectFit: 'cover' }}
                />
                <div style={{ padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0b1d3a' }}>Administrative Block &amp; Main Campus</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>📍 GEC Madhubani Campus, Bihar</div>
                </div>
              </div>
            </div>
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
