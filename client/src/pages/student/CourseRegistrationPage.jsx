import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CourseRegistrationPage() {
  const [selectedElectives, setSelectedElectives] = useState(['CS703A']);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);

  const CORE_SUBJECTS = [
    { code: 'PCC-CS701', name: 'Artificial Intelligence & Machine Learning', credits: 4, type: 'Theory Core', faculty: 'Prof. Anjali Roy' },
    { code: 'PCC-CS702', name: 'Cloud Computing Architecture', credits: 3, type: 'Theory Core', faculty: 'Dr. Vikram Singh' },
    { code: 'PCC-CS701P', name: 'AI & Data Science Laboratory', credits: 2, type: 'Practical', faculty: 'Prof. Anjali Roy' },
    { code: 'PROJ-CS701', name: 'Major Project (Phase - 1)', credits: 4, type: 'Project / Dissertation', faculty: 'Department Mentors' }
  ];

  const ELECTIVE_CHOICES = [
    { code: 'CS703A', name: 'Cyber Security & Digital Forensics', credits: 3, capacity: '45/60 Enrolled' },
    { code: 'CS703B', name: 'Natural Language Processing', credits: 3, capacity: '38/60 Enrolled' },
    { code: 'CS703C', name: 'Blockchain Technology & Smart Contracts', credits: 3, capacity: '40/60 Enrolled' }
  ];

  const handleElectiveToggle = (code) => {
    if (registrationSubmitted) return;
    setSelectedElectives([code]);
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    setRegistrationSubmitted(true);
    toast.success('Semester 7 Course Registration Submitted successfully to Academic Cell!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              ACADEMIC YEAR 2026-27 • SEMESTER 7
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Online Course Registration (B.Tech CSE)
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Enroll in compulsory core subjects and select department elective courses.
            </p>
          </div>

          <div style={{ background: registrationSubmitted ? '#f0fdf4' : '#fffbeb', border: `1px solid ${registrationSubmitted ? '#bbf7d0' : '#fde68a'}`, padding: '8px 14px', borderRadius: '6px', textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Registration Status</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: registrationSubmitted ? '#16a34a' : '#b45309' }}>
              {registrationSubmitted ? '✅ Approved & Registered' : '⏳ Pending Student Submission'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleRegistrationSubmit}>
        {/* Core Subjects Section */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📚</span> Compulsory Core Subjects (13 Credits)
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Subject Code</th>
                  <th style={{ padding: '10px 12px' }}>Course Title</th>
                  <th style={{ padding: '10px 12px' }}>Type</th>
                  <th style={{ padding: '10px 12px' }}>Instructor</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Credits</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {CORE_SUBJECTS.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0b1d3a' }}>{s.code}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{s.type}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{s.faculty}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#b45309' }}>{s.credits}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        Mandatory
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Elective Selection */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎯</span> Program Elective - III (Choose 1 Subject • 3 Credits)
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
            Select your preferred elective specialization for Semester 7.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ELECTIVE_CHOICES.map((el) => (
              <label
                key={el.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: selectedElectives.includes(el.code) ? '2px solid #0b1d3a' : '1px solid #e2e8f0',
                  background: selectedElectives.includes(el.code) ? '#f0f4f9' : '#ffffff',
                  cursor: registrationSubmitted ? 'default' : 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="radio"
                    name="elective"
                    checked={selectedElectives.includes(el.code)}
                    onChange={() => handleElectiveToggle(el.code)}
                    disabled={registrationSubmitted}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0b1d3a', fontSize: '0.88rem' }}>
                      <strong>{el.code}</strong> — {el.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Credits: 3.0 • Capacity: {el.capacity}</div>
                  </div>
                </div>

                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: selectedElectives.includes(el.code) ? '#0b1d3a' : '#64748b' }}>
                  {selectedElectives.includes(el.code) ? 'Selected' : 'Available'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {!registrationSubmitted ? (
            <button type="submit" className="gov-btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              Confirm &amp; Submit Course Registration →
            </button>
          ) : (
            <button
              type="button"
              className="gov-btn-outline"
              onClick={() => {
                toast.success('Course registration card downloaded');
              }}
            >
              📥 Download Registration Slip (PDF)
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
