import { useState } from 'react';

export default function StudentTimetablePage() {
  const [activeView, setActiveView] = useState('weekly');

  const WEEKLY_SCHEDULE = [
    {
      day: 'Monday',
      slots: [
        { time: '09:30 - 10:30', subject: 'Artificial Intelligence (CS701)', room: 'LH-204', faculty: 'Prof. Anjali Roy' },
        { time: '10:30 - 11:30', subject: 'Cloud Computing (CS702)', room: 'LH-204', faculty: 'Dr. Vikram Singh' },
        { time: '11:45 - 01:45', subject: 'AI & Data Science Lab (P1)', room: 'Comp Lab 1', faculty: 'Prof. Anjali Roy' },
        { time: '02:30 - 03:30', subject: 'Cyber Security (CS703A)', room: 'LH-202', faculty: 'Prof. Rajesh Kumar' }
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { time: '09:30 - 10:30', subject: 'Cloud Computing (CS702)', room: 'LH-204', faculty: 'Dr. Vikram Singh' },
        { time: '10:30 - 11:30', subject: 'Artificial Intelligence (CS701)', room: 'LH-204', faculty: 'Prof. Anjali Roy' },
        { time: '11:45 - 12:45', subject: 'Cyber Security (CS703A)', room: 'LH-202', faculty: 'Prof. Rajesh Kumar' },
        { time: '02:30 - 04:30', subject: 'Major Project Mentoring', room: 'Project Lab', faculty: 'Department Mentors' }
      ]
    },
    {
      day: 'Wednesday',
      slots: [
        { time: '09:30 - 10:30', subject: 'Cyber Security (CS703A)', room: 'LH-202', faculty: 'Prof. Rajesh Kumar' },
        { time: '10:30 - 11:30', subject: 'Artificial Intelligence (CS701)', room: 'LH-204', faculty: 'Prof. Anjali Roy' },
        { time: '11:45 - 01:45', subject: 'Cloud & DevOps Lab (P2)', room: 'Comp Lab 2', faculty: 'Dr. Vikram Singh' }
      ]
    },
    {
      day: 'Thursday',
      slots: [
        { time: '09:30 - 10:30', subject: 'Cloud Computing (CS702)', room: 'LH-204', faculty: 'Dr. Vikram Singh' },
        { time: '10:30 - 11:30', subject: 'Cyber Security (CS703A)', room: 'LH-202', faculty: 'Prof. Rajesh Kumar' },
        { time: '11:45 - 12:45', subject: 'Artificial Intelligence (CS701)', room: 'LH-204', faculty: 'Prof. Anjali Roy' },
        { time: '02:30 - 03:30', subject: 'Library & Self Study', room: 'Central Library', faculty: 'Self' }
      ]
    },
    {
      day: 'Friday',
      slots: [
        { time: '09:30 - 11:30', subject: 'Major Project Phase-1 Lab', room: 'Project Lab', faculty: 'Dr. Vikram Singh' },
        { time: '11:45 - 12:45', subject: 'Technical Seminar & Presentation', room: 'LH-204', faculty: 'Prof. Rajesh Kumar' },
        { time: '02:30 - 04:30', subject: 'Remedial / Placement Prep', room: 'LH-204', faculty: 'T&P Cell' }
      ]
    }
  ];

  const EXAM_SCHEDULE = [
    { date: '10 OCT 2026', time: '10:00 AM - 12:00 PM', subject: 'Artificial Intelligence (PCC-CS701)', room: 'Exam Hall A (Ground Floor)' },
    { date: '12 OCT 2026', time: '10:00 AM - 12:00 PM', subject: 'Cloud Computing (PCC-CS702)', room: 'Exam Hall A (Ground Floor)' },
    { date: '14 OCT 2026', time: '10:00 AM - 12:00 PM', subject: 'Cyber Security & Forensics (CS703A)', room: 'Exam Hall B (First Floor)' },
    { date: '16 OCT 2026', time: '09:30 AM - 04:30 PM', subject: 'AI & Data Science Practical Exam', room: 'Computing Lab 1' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
          B.TECH CSE • SEMESTER 7 • SESSION 2026-27
        </span>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
          Class &amp; Examination Timetable
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
          Official lecture schedule, laboratory batches, room allocations, and upcoming mid-term exam datesheet.
        </p>
      </div>

      {/* View Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveView('weekly')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeView === 'weekly' ? '1px solid #0b1d3a' : '1px solid #e2e8f0',
            background: activeView === 'weekly' ? '#0b1d3a' : '#ffffff',
            color: activeView === 'weekly' ? '#ffffff' : '#334155',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📅 Weekly Class Timetable
        </button>

        <button
          onClick={() => setActiveView('exam')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeView === 'exam' ? '1px solid #0b1d3a' : '1px solid #e2e8f0',
            background: activeView === 'exam' ? '#0b1d3a' : '#ffffff',
            color: activeView === 'exam' ? '#ffffff' : '#334155',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📝 Mid-Term Exam Datesheet
        </button>
      </div>

      {/* Weekly View */}
      {activeView === 'weekly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {WEEKLY_SCHEDULE.map((dayPlan, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                📌 {dayPlan.day}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {dayPlan.slots.map((s, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>⏱️ {s.time}</div>
                    <div style={{ fontWeight: 700, color: '#0b1d3a', fontSize: '0.88rem', marginTop: '4px' }}>{s.subject}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>📍 Room: <strong>{s.room}</strong></div>
                    <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>Instructor: {s.faculty}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exam Datesheet View */}
      {activeView === 'exam' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px' }}>
            Mid-Term Examination Datesheet — October 2026
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Exam Date</th>
                  <th style={{ padding: '10px 12px' }}>Time Slot</th>
                  <th style={{ padding: '10px 12px' }}>Subject &amp; Course Code</th>
                  <th style={{ padding: '10px 12px' }}>Examination Hall</th>
                </tr>
              </thead>
              <tbody>
                {EXAM_SCHEDULE.map((ex, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#b45309' }}>{ex.date}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ex.time}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0b1d3a' }}>{ex.subject}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>📍 {ex.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
