import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminExaminationPage() {
  const [examSchedules] = useState([
    { id: 1, title: 'B.Tech 7th Sem Mid-Term Examination 2026', branch: 'CSE, ECE, Civil', dates: '10 Oct - 16 Oct 2026', totalCandidates: 180, admitCardsIssued: 174, status: 'Scheduled' },
    { id: 2, title: 'B.Tech 5th Sem Mid-Term Examination 2026', branch: 'CSE, ECE, Civil', dates: '10 Oct - 16 Oct 2026', totalCandidates: 180, admitCardsIssued: 168, status: 'Scheduled' },
    { id: 3, title: 'End-Semester University Practical Exams', branch: 'All Branches', dates: '01 Dec - 08 Dec 2026', totalCandidates: 720, admitCardsIssued: 0, status: 'Upcoming' }
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              OFFICE OF CONTROLLER OF EXAMINATIONS (COE)
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Examination Cell Management
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Manage examination schedules, hall ticket generation, invigilation duty rosters, and university grade sheets.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="gov-btn-primary" onClick={() => toast.success('Admit cards generated & released to student portals')}>
              🖨️ Release Admit Cards
            </button>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {examSchedules.map((ex) => (
          <div key={ex.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>{ex.branch}</span>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1d3a', marginTop: '2px' }}>{ex.title}</h2>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>Exam Window: <strong>{ex.dates}</strong></div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0'
                }}>
                  {ex.status}
                </span>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
                  Admit Cards: <strong>{ex.admitCardsIssued} / {ex.totalCandidates}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <button className="gov-btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => toast.success('Invigilation duty roster downloaded')}>
                📋 Duty Roster
              </button>
              <button className="gov-btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => toast.success('Exam form status verified')}>
                🔍 Verify Eligibility
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
