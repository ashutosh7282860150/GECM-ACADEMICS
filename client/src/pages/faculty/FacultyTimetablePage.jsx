export default function FacultyTimetablePage() {
  const WEEKLY_TEACHING_LOAD = [
    {
      day: 'Monday',
      slots: [
        { time: '09:30 - 10:30', course: 'Artificial Intelligence (PCC-CS701)', sem: 'Sem 7 (CSE)', room: 'LH-204', type: 'Theory Lecture' },
        { time: '11:45 - 01:45', course: 'AI & Data Science Lab (PCC-CS701P)', sem: 'Sem 7 (Batch A)', room: 'Computing Lab 1', type: 'Practical Lab' }
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { time: '10:30 - 11:30', course: 'Artificial Intelligence (PCC-CS701)', sem: 'Sem 7 (CSE)', room: 'LH-204', type: 'Theory Lecture' },
        { time: '02:30 - 04:30', course: 'Major Project Mentoring', sem: 'Sem 7 (CSE)', room: 'AI Project Lab', type: 'Project Guidance' }
      ]
    },
    {
      day: 'Wednesday',
      slots: [
        { time: '10:30 - 11:30', course: 'Artificial Intelligence (PCC-CS701)', sem: 'Sem 7 (CSE)', room: 'LH-204', type: 'Theory Lecture' },
        { time: '02:30 - 03:30', course: 'Departmental Faculty Meeting', sem: 'All Faculty', room: 'Conference Room', type: 'Administrative' }
      ]
    },
    {
      day: 'Thursday',
      slots: [
        { time: '11:45 - 12:45', course: 'Artificial Intelligence (PCC-CS701)', sem: 'Sem 7 (CSE)', room: 'LH-204', type: 'Theory Lecture' },
        { time: '02:30 - 04:30', course: 'AI & Data Science Lab (PCC-CS701P)', sem: 'Sem 7 (Batch B)', room: 'Computing Lab 1', type: 'Practical Lab' }
      ]
    },
    {
      day: 'Friday',
      slots: [
        { time: '09:30 - 11:30', course: 'Research & Paper Guidance', sem: 'Final Year Scholars', room: 'R&D Cell', type: 'Research' }
      ]
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
          TEACHING SCHEDULE &amp; ALLOCATIONS
        </span>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
          Faculty Weekly Teaching Timetable
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
          Weekly lecture periods, laboratory practical batches, room numbers, and project guidance hours.
        </p>
      </div>

      {/* Schedule Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {WEEKLY_TEACHING_LOAD.map((dayPlan, idx) => (
          <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              📌 {dayPlan.day}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {dayPlan.slots.map((s, i) => (
                <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>⏱️ {s.time}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#0b1d3a', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>{s.type}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0b1d3a', fontSize: '0.9rem', marginTop: '4px' }}>{s.course}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Class: <strong>{s.sem}</strong></div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>📍 Venue: <strong>{s.room}</strong></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
