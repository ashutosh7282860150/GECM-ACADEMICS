import { useState } from 'react';
import { NOTICES_DATA } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState(NOTICES_DATA);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('Examination Cell');
  const [category, setCategory] = useState('Exam');
  const [details, setDetails] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title || !details) {
      toast.error('Please fill out all fields');
      return;
    }
    const newNotice = {
      id: Date.now(),
      date: '29 SEP 2026',
      title,
      dept,
      category,
      shortDesc: details.slice(0, 100) + '...',
      details
    };
    setNotices([newNotice, ...notices]);
    toast.success('Official circular published across student & faculty portals!');
    setShowCreateModal(false);
    setTitle('');
    setDetails('');
  };

  const handleDelete = (id) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    toast.success('Notice revoked.');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              OFFICIAL COMMUNICATION &amp; CIRCULARS
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Publish &amp; Manage Campus Notices
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Broadcast urgent circulars, exam notifications, placement orders and administrative mandates.
            </p>
          </div>

          <button className="gov-btn-primary" onClick={() => setShowCreateModal(true)}>
            📢 Publish New Circular
          </button>
        </div>
      </div>

      {/* Notices List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notices.map((n) => (
          <div key={n.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span className="gov-notice-tag">{n.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {n.dept}</span>
                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>• {n.date}</span>
              </div>
              <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0b1d3a' }}>{n.title}</h2>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>{n.shortDesc || n.details}</p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="gov-btn-outline" style={{ fontSize: '0.78rem' }} onClick={() => toast.success('Notice edited')}>
                ✏️ Edit
              </button>
              <button
                className="gov-btn-outline"
                style={{ fontSize: '0.78rem', color: '#dc2626', borderColor: '#ef4444' }}
                onClick={() => handleDelete(n.id)}
              >
                🗑️ Revoke
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="gov-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="gov-modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            <div className="gov-modal-header" style={{ textAlign: 'left' }}>
              <span className="gov-card-badge">CAMPUS CIRCULAR</span>
              <h3 className="gov-modal-title" style={{ marginTop: '4px' }}>Publish Institutional Circular</h3>
            </div>

            <form onSubmit={handleCreate} style={{ marginTop: '14px' }}>
              <div className="gov-form-group">
                <label className="gov-form-label">Issuing Department / Cell</label>
                <select
                  className="gov-form-input"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option value="Examination Cell">Examination Cell</option>
                  <option value="Academic Affairs">Academic Affairs</option>
                  <option value="Accounts & Hostel Cell">Accounts &amp; Hostel Cell</option>
                  <option value="Training & Placement">Training &amp; Placement</option>
                  <option value="Principal Office">Principal Office</option>
                  <option value="R&D Cell">R&D Cell</option>
                </select>
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Category</label>
                <select
                  className="gov-form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Exam">Exam</option>
                  <option value="Academic">Academic</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Placement">Placement</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Circular Title</label>
                <input
                  type="text"
                  className="gov-form-input"
                  placeholder="e.g. Schedule of B.Tech 5th Sem End-Semester Exams"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Full Circular Text</label>
                <textarea
                  className="gov-form-input"
                  rows={4}
                  placeholder="Enter complete circular notice description..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="gov-btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="gov-btn-primary">
                  Publish Circular →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
