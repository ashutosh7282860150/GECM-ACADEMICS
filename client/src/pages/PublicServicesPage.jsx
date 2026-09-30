import { useState } from 'react';
import { SERVICES_DATA } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InstitutionalHeader from '../components/InstitutionalHeader';

export default function PublicServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = SERVICES_DATA.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServiceClick = (svc) => {
    if (svc.route.startsWith('/student') && !user) {
      navigate('/login');
    } else {
      navigate(svc.route);
    }
  };

  return (
    <div className="gov-landing-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Unified Responsive Header */}
      <InstitutionalHeader />

      {/* Main Services Section */}
      <main className="gov-container" style={{ padding: '36px 20px', flex: 1 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="gov-section-tag" style={{ background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
              SERVICES DIRECTORY
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Academic Services Directory
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Search through institutional services and modules. Click any module below to open its dedicated page.
            </p>
          </div>

          {/* Search Box */}
          <div className="gov-service-search-box" style={{ maxWidth: '450px', marginBottom: '24px' }}>
            <span className="gov-service-search-icon">🔍</span>
            <input
              type="text"
              className="gov-service-search-input"
              placeholder="Search services (e.g., Attendance, Results, Fees, Gate Pass)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Services Grid */}
          <div className="gov-services-grid">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="gov-service-item"
                onClick={() => handleServiceClick(svc)}
                style={{ cursor: 'pointer' }}
              >
                <div className="gov-service-icon-wrapper" style={{ fontSize: '1.4rem' }}>{svc.icon}</div>
                <div>
                  <div className="gov-service-title">{svc.title}</div>
                  <div className="gov-service-desc">{svc.desc}</div>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, marginTop: '6px' }}>
                    Open Service →
                  </div>
                </div>
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
