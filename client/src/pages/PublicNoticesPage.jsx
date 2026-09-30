import { useState } from 'react';
import { NOTICES_DATA } from '../data/mockData';
import InstitutionalHeader from '../components/InstitutionalHeader';

export default function PublicNoticesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);

  const categories = ['All', 'Exam', 'Accounts', 'Placement', 'Academic', 'Event'];

  const filteredNotices = NOTICES_DATA.filter(n => {
    const matchesCategory = activeCategory === 'All' || n.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="gov-landing-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Unified Responsive Header */}
      <InstitutionalHeader />

      {/* Main Notice Section */}
      <main className="gov-container" style={{ padding: '36px 20px', flex: 1 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <span className="gov-section-tag" style={{ background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                OFFICIAL CAMPUS CIRCULARS
              </span>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
                Official Campus Notices &amp; Circulars
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                Latest official notices from Examination, Academic, Accounts, Placement and Administrative cells.
              </p>
            </div>

            <div style={{ width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search notices by title or cell..."
                className="gov-form-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="gov-notice-filter-pills" style={{ marginBottom: '20px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`gov-filter-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' ? 'All Notices' : cat}
              </button>
            ))}
          </div>

          {/* Notices List */}
          <div className="gov-notices-list">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((n) => (
                <div key={n.id} className="gov-notice-card" onClick={() => setSelectedNotice(n)}>
                  <div className="gov-notice-date-box">
                    <span className="gov-notice-day">{n.date.split(' ')[0]}</span>
                    <span className="gov-notice-month">{n.date.split(' ')[1]} {n.date.split(' ')[2]}</span>
                  </div>
                  <div className="gov-notice-details">
                    <div className="gov-notice-meta">
                      <span className="gov-notice-tag">{n.category}</span>
                      <span className="gov-notice-dept">📍 {n.dept}</span>
                    </div>
                    <div className="gov-notice-item-title">{n.title}</div>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>{n.shortDesc}</p>
                  </div>
                  <button className="gov-btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedNotice(n); }}>
                    View Circular →
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                No circulars match your search or filter criteria.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal View */}
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
              <button className="gov-btn-outline" onClick={() => { alert('Downloading official signed PDF copy...'); setSelectedNotice(null); }}>
                Download Circular PDF
              </button>
              <button className="gov-btn-primary" onClick={() => setSelectedNotice(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
