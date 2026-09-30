import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionalHeader from '../components/InstitutionalHeader';

export default function PublicAcademicsPage() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);

  const ACADEMIC_SECTIONS = [
    {
      id: 'departments',
      tag: 'DEPARTMENTS',
      title: 'Academic Departments',
      desc: 'B.Tech degree programs in CSE, ECE, and Civil Engineering with modern laboratories and dedicated faculty.',
      highlight: '3 Core Branches (CSE, ECE, Civil)',
      actionText: 'View Details →',
      onAction: () => navigate('/departments'),
      content: `1. Computer Science & Engineering (60 Seats)
2. Electronics & Communication Engineering (60 Seats)
3. Civil Engineering (60 Seats)

All departments feature modern compute clusters, digital classrooms, VLSI simulators, heavy structures testing labs, and high-speed Wi-Fi connectivity.`
    },
    {
      id: 'courses',
      tag: 'COURSES',
      title: 'Degree & Curriculum',
      desc: 'AICTE and University prescribed course structure, semester syllabus, choice-based credit system (CBCS), and program electives.',
      highlight: 'B.Tech 4-Year (8 Semesters)',
      actionText: 'View Syllabus →',
      onAction: () => setActiveModal({
        tag: 'COURSES',
        title: 'B.Tech Curriculum & Semester Syllabus',
        meta: 'AICTE Model Curriculum / Bihar Eng. University',
        body: `• Semester 1 & 2: Basic Sciences, Engineering Mechanics, Programming for Problem Solving, Basic Electrical.
• Semester 3 & 4: Core Branch Foundations, Data Structures, Signals & Systems, Building Materials.
• Semester 5 & 6: Advanced Branch Specializations, Database Systems, DSP, Structural Analysis, Summer Internships.
• Semester 7 & 8: Open Electives, Industry 4.0 Projects, Minor/Major Dissertation, Seminar.`
      }),
    },
    {
      id: 'calendar',
      tag: 'CALENDAR',
      title: 'Academic Calendar',
      desc: 'Semester schedule, mid-term examinations, sports week, technical fests, gazetted holidays, and university end-term exams.',
      highlight: 'Session 2026-27 (Odd & Even Sem)',
      actionText: 'Download Calendar →',
      onAction: () => setActiveModal({
        tag: 'CALENDAR',
        title: 'Academic Calendar — Session 2026-27',
        meta: 'Approved by Academic Council',
        body: `• Odd Semester Commences: 1st August 2026
• Mid-Term Examination (1st Slot): 10th - 16th October 2026
• Tech-Fest & Sports Meet: 12th - 14th November 2026
• End-Semester Practical Exams: 1st - 8th December 2026
• End-Semester Theory University Exams: 12th - 28th December 2026
• Winter Vacation: 29th December 2026 - 15th January 2027
• Even Semester Commences: 18th January 2027`
      }),
    },
    {
      id: 'examination',
      tag: 'EXAMINATION',
      title: 'Examination Cell',
      desc: 'Conduct of exams, internal assessment records, admit card issuance, scrutiny process, and university evaluation guidelines.',
      highlight: 'Internal & University Exams',
      actionText: 'Exam Guidelines →',
      onAction: () => setActiveModal({
        tag: 'EXAMINATION',
        title: 'Examination Cell Guidelines & Ordinances',
        meta: 'Controller of Examinations (CoE)',
        body: `1. Mandatory 75% Attendance: Students failing to secure 75% attendance across lecture and practical hours shall be debarred from writing end-sem examinations.
2. Digital Admit Cards: Hall tickets must be downloaded from the student portal and physically endorsed by the proctor.
3. Continuous Assessment: Internal assessment comprises 30% weighting (Mid-term test 20%, Class assignments & quizzes 10%).
4. No Malpractice Policy: Strict disciplinary action per university ordinances for possession of mobile phones or unauthorized materials in exam halls.`
      }),
    }
  ];

  return (
    <div className="gov-landing-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Unified Responsive Header */}
      <InstitutionalHeader />

      {/* Main Content */}
      <main className="gov-container" style={{ padding: '36px 20px', flex: 1 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="gov-section-tag" style={{ background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
              CURRICULUM &amp; BRANCHES
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Academic Information &amp; Resources
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Explore academic departments, B.Tech degree syllabus, institutional calendar, and examination cell guidelines.
            </p>
          </div>

          <div className="gov-academic-grid">
            {ACADEMIC_SECTIONS.map((sec) => (
              <div key={sec.id} className="gov-academic-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="gov-card-badge">{sec.tag}</span>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1d3a', margin: '4px 0 8px' }}>{sec.title}</h2>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, flex: 1 }}>{sec.desc}</p>
                <div className="gov-card-footer" style={{ marginTop: '16px', paddingTop: '12px' }}>
                  <span style={{ fontWeight: 600, color: '#64748b' }}>{sec.highlight}</span>
                  <button
                    className="gov-btn-sm"
                    onClick={sec.onAction}
                    style={{ background: '#0b1d3a', color: '#ffffff', border: 'none' }}
                  >
                    {sec.actionText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal */}
      {activeModal && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <button className="gov-modal-close" onClick={() => setActiveModal(null)}>✕</button>
            <div className="gov-modal-header" style={{ textAlign: 'left' }}>
              <span className="gov-card-badge">{activeModal.tag}</span>
              <h3 className="gov-modal-title" style={{ marginTop: '6px' }}>{activeModal.title}</h3>
              <p className="gov-modal-sub" style={{ marginTop: '2px' }}>{activeModal.meta}</p>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, padding: '16px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', whiteSpace: 'pre-line' }}>
              {activeModal.body}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button className="gov-btn-outline" onClick={() => { alert('Official document opened.'); setActiveModal(null); }}>
                Download Official PDF
              </button>
              <button className="gov-btn-primary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="gov-footer" style={{ marginTop: 'auto' }}>
        <div className="gov-container">
          <div className="gov-footer-bottom" style={{ border: 'none', padding: '16px 0 0' }}>
            <p>© 2026 Government Engineering College, Madhubani. Dept. of Science, Technology &amp; Technical Education, Govt. of Bihar.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
