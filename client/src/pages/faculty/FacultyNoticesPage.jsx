import { useState } from 'react';
import { NOTICES_DATA } from '../../data/mockData';

export default function FacultyNoticesPage() {
  const [selectedNotice, setSelectedNotice] = useState(null);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
          OFFICIAL CIRCULARS &amp; FACULTY INTIMATIONS
        </span>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
          Faculty &amp; Departmental Notices
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
          Official communications from Principal Office, Academic Dean, Exam Cell, and TEQIP/AICTE coordinators.
        </p>
      </div>

      {/* Notices List */}
      <div className="gov-notices-list">
        {NOTICES_DATA.map((n) => (
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
        ))}
      </div>

      {/* Modal */}
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
