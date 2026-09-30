import { useState } from 'react';
import toast from 'react-hot-toast';

export default function FacultyExaminationsPage() {
  const [selectedExam, setSelectedExam] = useState('Mid-Term 1 (2026)');
  const [selectedCourse, setSelectedCourse] = useState('PCC-CS701');

  const [studentMarks, setStudentMarks] = useState([
    { id: 1, roll: 'CSE2021001', name: 'Arjun Patel', internal1: 18, internal2: 19, assignment: 9, total: 46 },
    { id: 2, roll: 'CSE2021002', name: 'Priya Sharma', internal1: 19, internal2: 20, assignment: 10, total: 49 },
    { id: 3, roll: 'CSE2021003', name: 'Rahul Verma', internal1: 14, internal2: 15, assignment: 7, total: 36 },
    { id: 4, roll: 'CSE2021004', name: 'Ananya Gupta', internal1: 17, internal2: 18, assignment: 9, total: 44 },
    { id: 5, roll: 'CSE2021005', name: 'Amit Kumar', internal1: 15, internal2: 16, assignment: 8, total: 39 },
    { id: 6, roll: 'CSE2021006', name: 'Sneha Roy', internal1: 12, internal2: 13, assignment: 6, total: 31 }
  ]);

  const handleMarkChange = (id, field, val) => {
    const num = Math.min(20, Math.max(0, parseInt(val) || 0));
    setStudentMarks(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: num };
      updated.total = (updated.internal1 || 0) + (updated.internal2 || 0) + (updated.assignment || 0);
      return updated;
    }));
  };

  const handleSaveMarks = (e) => {
    e.preventDefault();
    toast.success(`Internal Assessment & Mid-Term marks published for ${selectedCourse}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
          EXAMINATION ASSESSMENT &amp; MARKS ENTRY
        </span>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
          Internal Marks &amp; Mid-Term Assessment Entry
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
          Enter Continuous Internal Evaluation (CIE) scores, mid-term marks and submit directly to Controller of Examinations.
        </p>
      </div>

      {/* Selectors */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div className="gov-form-group">
            <label className="gov-form-label">Course / Subject</label>
            <select
              className="gov-form-input"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="PCC-CS701">PCC-CS701: Artificial Intelligence (Sem 7)</option>
              <option value="PCC-CS702">PCC-CS702: Cloud Computing (Sem 7)</option>
              <option value="PCC-CS501">PCC-CS501: DBMS (Sem 5)</option>
            </select>
          </div>

          <div className="gov-form-group">
            <label className="gov-form-label">Assessment Type</label>
            <select
              className="gov-form-input"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="Mid-Term 1 (2026)">Mid-Term Assessment 1 (Max 20 Marks)</option>
              <option value="Mid-Term 2 (2026)">Mid-Term Assessment 2 (Max 20 Marks)</option>
              <option value="Assignments">Assignments &amp; Quizzes (Max 10 Marks)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Marks Sheet */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px' }}>
          Student Evaluation Sheet ({studentMarks.length} Students)
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Roll Number</th>
                <th style={{ padding: '10px 12px' }}>Student Name</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Mid-Term 1 (20)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Mid-Term 2 (20)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Assignment (10)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Internal Total (50)</th>
              </tr>
            </thead>
            <tbody>
              {studentMarks.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0b1d3a' }}>{s.roll}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <input
                      type="number"
                      max="20"
                      min="0"
                      value={s.internal1}
                      onChange={(e) => handleMarkChange(s.id, 'internal1', e.target.value)}
                      style={{ width: '60px', padding: '4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <input
                      type="number"
                      max="20"
                      min="0"
                      value={s.internal2}
                      onChange={(e) => handleMarkChange(s.id, 'internal2', e.target.value)}
                      style={{ width: '60px', padding: '4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <input
                      type="number"
                      max="10"
                      min="0"
                      value={s.assignment}
                      onChange={(e) => handleMarkChange(s.id, 'assignment', e.target.value)}
                      style={{ width: '60px', padding: '4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#0b1d3a' }}>
                    {s.total} / 50
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="gov-btn-primary" onClick={handleSaveMarks} style={{ padding: '10px 24px' }}>
            💾 Submit Marks to Examination Cell
          </button>
        </div>
      </div>
    </div>
  );
}
