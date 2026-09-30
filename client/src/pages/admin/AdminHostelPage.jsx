import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminHostelPage() {
  const [hostelBlocks] = useState([
    { name: 'Aryabhatta Boys Hostel (Block A)', capacity: 240, occupied: 232, warden: 'Dr. Alok Kumar', messStatus: 'Active', duesPending: 8 },
    { name: 'Bhaskara Boys Hostel (Block B)', capacity: 240, occupied: 228, warden: 'Prof. S. N. Singh', messStatus: 'Active', duesPending: 12 },
    { name: 'Gargi Girls Hostel (Block C)', capacity: 180, occupied: 174, warden: 'Prof. Neha Jha', messStatus: 'Active', duesPending: 4 }
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              HOSTEL &amp; RESIDENTIAL ADMINISTRATION
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Hostel Allotment &amp; Warden Administration
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Hostel room allotments, warden gate pass monitoring, mess fee clearance, and campus residential security.
            </p>
          </div>

          <button className="gov-btn-primary" onClick={() => toast.success('Hostel room allotment list exported')}>
            🏠 Export Room Allotments
          </button>
        </div>
      </div>

      {/* Hostel Blocks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {hostelBlocks.map((b, idx) => (
          <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '8px' }}>{b.name}</h2>
            
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#334155', marginBottom: '14px' }}>
              <div>👨‍💼 <strong>Chief Warden:</strong> {b.warden}</div>
              <div style={{ marginTop: '4px' }}>🛏️ <strong>Occupancy:</strong> {b.occupied} / {b.capacity} Rooms ({Math.round((b.occupied / b.capacity) * 100)}%)</div>
              <div style={{ marginTop: '4px' }}>🍽️ <strong>Mess Status:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{b.messStatus}</span></div>
              <div style={{ marginTop: '4px' }}>⚠️ <strong>Pending Mess Dues:</strong> <span style={{ color: '#dc2626', fontWeight: 700 }}>{b.duesPending} Students</span></div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="gov-btn-outline" style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }} onClick={() => toast.success(`Viewing room inventory for ${b.name}`)}>
                Room List
              </button>
              <button className="gov-btn-primary" style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }} onClick={() => toast.success('Warden clearance audit verified')}>
                Clear Dues
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
