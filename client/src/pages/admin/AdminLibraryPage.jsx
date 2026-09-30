import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminLibraryPage() {
  const [issuedBooks] = useState([
    { id: 'LIB-4091', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', student: 'Arjun Patel', roll: 'CSE2021001', dueDate: '10 OCT 2026', status: 'Active' },
    { id: 'LIB-4092', title: 'Database System Concepts (7th Ed)', author: 'Silberschatz', student: 'Priya Sharma', roll: 'CSE2021002', dueDate: '12 OCT 2026', status: 'Active' },
    { id: 'LIB-4093', title: 'Design and Analysis of Algorithms', author: 'Cormen et al.', student: 'Rahul Verma', roll: 'CSE2021003', dueDate: '25 SEP 2026', status: 'Overdue (₹60 Fine)' },
    { id: 'LIB-4094', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', student: 'Amit Kumar', roll: 'ECE2021005', dueDate: '15 OCT 2026', status: 'Active' }
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              CENTRAL LIBRARY INFORMATION SYSTEM
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Library Management &amp; Book Circulation
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Track catalog volumes, issued books, overdue fines, and process digital No-Dues library clearance.
            </p>
          </div>

          <button className="gov-btn-primary" onClick={() => toast.success('New book volume added to library catalog')}>
            ➕ Add Book Title
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Total Book Titles</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0b1d3a', marginTop: '4px' }}>14,250</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Technical, Reference &amp; Journals</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Active Borrowings</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>342 Books</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Issued across all batches</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>No-Dues Clearance</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>98.2%</div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a' }}>Cleared for current semester</div>
        </div>
      </div>

      {/* Issued Books Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px' }}>
          Active Book Borrowings &amp; Overdue Status
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Accession No</th>
                <th style={{ padding: '10px 12px' }}>Book Title &amp; Author</th>
                <th style={{ padding: '10px 12px' }}>Issued Student</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Due Date</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {issuedBooks.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#0b1d3a' }}>{b.id}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700 }}>{b.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.author}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600 }}>{b.student}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.roll}</div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569' }}>{b.dueDate}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      background: b.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                      color: b.status === 'Active' ? '#16a34a' : '#dc2626'
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <button
                      className="gov-btn-sm"
                      onClick={() => toast.success(`Book ${b.id} returned & No-Dues updated`)}
                    >
                      Return / Clear
                    </button>
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
