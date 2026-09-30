import { useState } from 'react';
import toast from 'react-hot-toast';

export default function StudentResultsPage() {
  const [selectedSemester, setSelectedSemester] = useState('Sem 6');

  const SEMESTER_RESULTS = {
    'Sem 6': {
      sgpa: 8.84,
      cgpa: 8.62,
      status: 'PASS (First Class with Distinction)',
      subjects: [
        { code: 'PCC-CS601', name: 'Compiler Design', credits: 4, grade: 'A+', points: 9 },
        { code: 'PCC-CS602', name: 'Computer Networks', credits: 4, grade: 'A', points: 8 },
        { code: 'PEC-CS601', name: 'Data Analytics & Visualization', credits: 3, grade: 'O', points: 10 },
        { code: 'PCC-CS601P', name: 'Compiler & Networks Lab', credits: 2, grade: 'O', points: 10 },
        { code: 'OEC-CS601', name: 'Industrial Management', credits: 3, grade: 'A+', points: 9 },
        { code: 'PROJ-CS601', name: 'Minor Project - II', credits: 2, grade: 'O', points: 10 }
      ]
    },
    'Sem 5': {
      sgpa: 8.58,
      cgpa: 8.57,
      status: 'PASS',
      subjects: [
        { code: 'PCC-CS501', name: 'Database Management Systems', credits: 4, grade: 'A+', points: 9 },
        { code: 'PCC-CS502', name: 'Design and Analysis of Algorithms', credits: 4, grade: 'A', points: 8 },
        { code: 'PCC-CS503', name: 'Formal Language & Automata', credits: 4, grade: 'B+', points: 7 },
        { code: 'PCC-CS501P', name: 'DBMS & Algorithms Lab', credits: 2, grade: 'O', points: 10 }
      ]
    }
  };

  const currentResult = SEMESTER_RESULTS[selectedSemester] || SEMESTER_RESULTS['Sem 6'];

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
              EXAMINATION CELL • OFFICIAL GRADE REPORT
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Semester Examination Results &amp; Grade Sheets
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              View SGPA, cumulative CGPA, subject-wise letter grades, and download verified grade cards.
            </p>
          </div>

          <button
            className="gov-btn-primary"
            onClick={() => toast.success('Official Grade Card PDF generated and downloaded')}
          >
            📄 Download Grade Card PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Cumulative CGPA</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0b1d3a', marginTop: '4px' }}>8.62</div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>Overall Academic Standing</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Semester SGPA ({selectedSemester})</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>{currentResult.sgpa}</div>
          <div style={{ fontSize: '0.74rem', color: '#475569' }}>Total Earned Credits: 18.0</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Result Status</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', marginTop: '8px' }}>{currentResult.status}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>Zero Active Backlogs</div>
        </div>
      </div>

      {/* Semester Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {Object.keys(SEMESTER_RESULTS).map(sem => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: selectedSemester === sem ? '1px solid #0b1d3a' : '1px solid #e2e8f0',
              background: selectedSemester === sem ? '#0b1d3a' : '#ffffff',
              color: selectedSemester === sem ? '#ffffff' : '#334155',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {sem} Grade Sheet
          </button>
        ))}
      </div>

      {/* Subject Grades Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px' }}>
          Subject-Wise Grade Breakdown ({selectedSemester})
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Subject Code</th>
                <th style={{ padding: '10px 12px' }}>Course Title</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Credits</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Letter Grade</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Grade Points</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {currentResult.subjects.map((sub, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0b1d3a' }}>{sub.code}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{sub.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{sub.credits}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      background: sub.grade === 'O' ? '#f0fdf4' : '#eff6ff',
                      color: sub.grade === 'O' ? '#16a34a' : '#1d4ed8'
                    }}>
                      {sub.grade}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0b1d3a' }}>{sub.points} / 10</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Cleared</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
