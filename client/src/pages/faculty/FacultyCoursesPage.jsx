import { useState } from 'react';
import toast from 'react-hot-toast';

export default function FacultyCoursesPage() {
  const [courses] = useState([
    {
      code: 'PCC-CS701',
      name: 'Artificial Intelligence & Machine Learning',
      sem: 'Semester 7',
      branch: 'Computer Science & Engineering',
      credits: 4,
      enrolled: 58,
      syllabus: 'Module 1: Search Algorithms (BFS, DFS, A*, Heuristics)\nModule 2: Knowledge Representation & First Order Logic\nModule 3: Machine Learning Supervised Algorithms (SVM, Decision Trees, KNN)\nModule 4: Neural Networks & Deep Learning Basics',
      materialsCount: 12
    },
    {
      code: 'PCC-CS701P',
      name: 'AI & Data Science Laboratory',
      sem: 'Semester 7',
      branch: 'Computer Science & Engineering',
      credits: 2,
      enrolled: 58,
      syllabus: 'Lab 1: Python NumPy, Pandas & Scikit-learn Setup\nLab 2: Implement A* algorithm for puzzle solving\nLab 3: Classification on UCI datasets using Logistic Regression & Random Forest\nLab 4: Convolutional Neural Network on MNIST dataset',
      materialsCount: 6
    },
    {
      code: 'PCC-CS501',
      name: 'Database Management Systems',
      sem: 'Semester 5',
      branch: 'Computer Science & Engineering',
      credits: 4,
      enrolled: 62,
      syllabus: 'Module 1: ER Modelling & Relational Algebra\nModule 2: SQL & Advanced Queries\nModule 3: Normalization (1NF, 2NF, 3NF, BCNF)\nModule 4: Transaction Management & Concurrency Control (ACID, 2PL)',
      materialsCount: 15
    }
  ]);

  const [activeCourseModal, setActiveCourseModal] = useState(null);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
          ACADEMIC TEACHING LOAD • ODD SEMESTER 2026
        </span>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
          Assigned Courses &amp; Curriculum Materials
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
          View approved university syllabus, lesson plans, course lecture notes, and student rosters.
        </p>
      </div>

      {/* Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {courses.map((c) => (
          <div key={c.code} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#0b1d3a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                  {c.code}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700 }}>
                  {c.sem} • {c.credits} Credits
                </span>
              </div>

              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '4px' }}>{c.name}</h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>{c.branch}</div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', marginBottom: '14px' }}>
                <div>👥 <strong>Enrolled Students:</strong> {c.enrolled} Students</div>
                <div style={{ marginTop: '2px' }}>📁 <strong>Lecture Notes Uploaded:</strong> {c.materialsCount} Files</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <button
                className="gov-btn-outline"
                style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
                onClick={() => setActiveCourseModal(c)}
              >
                📖 View Syllabus
              </button>
              <button
                className="gov-btn-primary"
                style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
                onClick={() => toast.success(`Lecture notes uploader ready for ${c.code}`)}
              >
                📤 Upload Notes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Syllabus Modal */}
      {activeCourseModal && (
        <div className="gov-modal-overlay" onClick={() => setActiveCourseModal(null)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button className="gov-modal-close" onClick={() => setActiveCourseModal(null)}>✕</button>
            <div className="gov-modal-header" style={{ textAlign: 'left' }}>
              <span className="gov-card-badge">{activeCourseModal.code}</span>
              <h3 className="gov-modal-title" style={{ marginTop: '4px' }}>{activeCourseModal.name}</h3>
              <p className="gov-modal-sub">{activeCourseModal.sem} • {activeCourseModal.credits} Credits</p>
            </div>
            <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, padding: '14px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', whiteSpace: 'pre-line' }}>
              {activeCourseModal.syllabus}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
              <button className="gov-btn-primary" onClick={() => setActiveCourseModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
