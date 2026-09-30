import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminLaboratoryPage() {
  const [labs] = useState([
    { id: 'LAB-CSE-01', name: 'AI & Data Science Lab', dept: 'CSE', incharge: 'Prof. Anjali Roy', pcs: 45, status: 'Operational', clearanceStatus: 'All Clear' },
    { id: 'LAB-CSE-02', name: 'Cloud & Network Security Lab', dept: 'CSE', incharge: 'Prof. Rajesh Kumar', pcs: 40, status: 'Operational', clearanceStatus: 'All Clear' },
    { id: 'LAB-ECE-01', name: 'VLSI & Cadence Simulation Lab', dept: 'ECE', incharge: 'Dr. Amitav Mishra', pcs: 35, status: 'Operational', clearanceStatus: 'All Clear' },
    { id: 'LAB-ECE-02', name: 'Microprocessor & Embedded Lab', dept: 'ECE', incharge: 'Prof. Alok Prasad', pcs: 30, status: 'Operational', clearanceStatus: 'All Clear' },
    { id: 'LAB-CE-01', name: 'Strength of Materials & Concrete Lab', dept: 'Civil', incharge: 'Dr. R. K. Choudhary', pcs: 10, status: 'Operational', clearanceStatus: 'All Clear' },
    { id: 'LAB-CE-02', name: 'Surveying & Total Station Lab', dept: 'Civil', incharge: 'Prof. Manish Verma', pcs: 15, status: 'Operational', clearanceStatus: 'All Clear' }
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              LABORATORY INVENTORY &amp; AUDIT
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Institutional Laboratories &amp; Equipment
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Monitor department laboratories, workstation status, equipment calibration, and student lab clearance.
            </p>
          </div>

          <button className="gov-btn-primary" onClick={() => toast.success('Laboratory audit schedule created')}>
            🔍 Schedule Lab Audit
          </button>
        </div>
      </div>

      {/* Labs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {labs.map((l) => (
          <div key={l.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#0b1d3a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                {l.dept}
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                {l.status}
              </span>
            </div>

            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '4px' }}>{l.name}</h2>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>{l.id}</div>

            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', margin: '14px 0' }}>
              <div>👨‍🏫 <strong>Faculty In-Charge:</strong> {l.incharge}</div>
              <div style={{ marginTop: '2px' }}>💻 <strong>Capacity:</strong> {l.pcs} Workstations / Testing Units</div>
              <div style={{ marginTop: '2px', color: '#16a34a' }}>✅ <strong>Student Lab Clearance:</strong> {l.clearanceStatus}</div>
            </div>

            <button
              className="gov-btn-outline w-full"
              style={{ fontSize: '0.8rem', justifyContent: 'center' }}
              onClick={() => toast.success(`Viewing inventory & equipment log for ${l.name}`)}
            >
              📋 Equipment Inventory &amp; Stock Register
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
