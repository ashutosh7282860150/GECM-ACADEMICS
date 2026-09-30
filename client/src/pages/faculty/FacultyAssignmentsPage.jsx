import { useState } from 'react';
import toast from 'react-hot-toast';

export default function FacultyAssignmentsPage() {
  const [activeTab, setActiveTab] = useState('assignments');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState('assignment'); // 'assignment' | 'notes'
  
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('PCC-CS701: Artificial Intelligence');
  const [newDeadline, setNewDeadline] = useState('2026-10-15');
  const [newDesc, setNewDesc] = useState('');
  const [newUnit, setNewUnit] = useState('Unit 3: Knowledge Representation & Logic');

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Assignment 2: Heuristic Search & A* Algorithm Implementation',
      subject: 'PCC-CS701: Artificial Intelligence',
      deadline: '15 OCT 2026',
      submissions: 42,
      totalStudents: 58,
      status: 'Active'
    },
    {
      id: 2,
      title: 'Assignment 1: Uninformed vs Informed Search Techniques',
      subject: 'PCC-CS701: Artificial Intelligence',
      deadline: '20 SEP 2026',
      submissions: 56,
      totalStudents: 58,
      status: 'Graded'
    },
    {
      id: 3,
      title: 'Assignment 1: Cloud Architecture Microservices on AWS',
      subject: 'PCC-CS702: Cloud Computing',
      deadline: '18 OCT 2026',
      submissions: 35,
      totalStudents: 58,
      status: 'Active'
    }
  ]);

  const [notes, setNotes] = useState([
    {
      id: 'nt1',
      title: 'Unit 1 & 2 Complete Lecture Handout: State Space Search & Heuristics',
      subject: 'PCC-CS701: Artificial Intelligence',
      unit: 'Unit 1 & 2',
      uploadedDate: '28 SEP 2026',
      fileSize: '4.2 MB PDF',
      downloads: 84
    },
    {
      id: 'nt2',
      title: 'AWS Core Services, EC2, S3 & VPC Architectural Notes',
      subject: 'PCC-CS702: Cloud Computing',
      unit: 'Unit 2: Virtualization & AWS',
      uploadedDate: '25 SEP 2026',
      fileSize: '6.8 MB PDF',
      downloads: 72
    },
    {
      id: 'nt3',
      title: 'Relational Algebra & SQL Query Optimization Slides',
      subject: 'PCC-CS501: Database Management Systems',
      unit: 'Unit 3: Query Processing',
      uploadedDate: '22 SEP 2026',
      fileSize: '3.1 MB PDF',
      downloads: 95
    }
  ]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle) {
      toast.error('Please enter a title');
      return;
    }

    if (modalType === 'assignment') {
      const newEntry = {
        id: Date.now(),
        title: newTitle,
        subject: newSubject,
        deadline: newDeadline,
        submissions: 0,
        totalStudents: 58,
        status: 'Active'
      };
      setAssignments([newEntry, ...assignments]);
      toast.success(`⚡ Assignment "${newTitle}" published! Real-time notification broadcasted to enrolled students.`);
    } else {
      const newNote = {
        id: 'nt_' + Date.now(),
        title: newTitle,
        subject: newSubject,
        unit: newUnit,
        uploadedDate: 'Today',
        fileSize: '2.5 MB PDF',
        downloads: 0
      };
      setNotes([newNote, ...notes]);
      toast.success(`⚡ Study Notes "${newTitle}" uploaded! Real-time notification sent to student portal.`);
    }

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              ACADEMIC CONTENT &amp; EVALUATION
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              Faculty Coursework &amp; Study Notes Portal
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Upload course assignments, lecture handouts, notes, and evaluate student submissions in real time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="gov-btn-primary" onClick={() => { setModalType('assignment'); setShowCreateModal(true); }}>
              ➕ Create Assignment
            </button>
            <button className="gov-btn-outline" onClick={() => { setModalType('notes'); setShowCreateModal(true); }}>
              📄 Upload Study Notes
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeTab === 'assignments' ? '1px solid #0b1d3a' : '1px solid #e2e8f0',
            background: activeTab === 'assignments' ? '#0b1d3a' : '#ffffff',
            color: activeTab === 'assignments' ? '#ffffff' : '#334155',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📝 Coursework Assignments ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeTab === 'notes' ? '1px solid #0b1d3a' : '1px solid #e2e8f0',
            background: activeTab === 'notes' ? '#0b1d3a' : '#ffffff',
            color: activeTab === 'notes' ? '#ffffff' : '#334155',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📚 Lecture Notes &amp; Handouts ({notes.length})
        </button>
      </div>

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {assignments.map((asg) => (
            <div key={asg.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>{asg.subject}</span>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1d3a', marginTop: '2px' }}>{asg.title}</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Deadline: <strong>{asg.deadline}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: asg.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                    color: asg.status === 'Active' ? '#16a34a' : '#475569',
                    border: '1px solid #cbd5e1'
                  }}>
                    {asg.status}
                  </span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1d3a', marginTop: '6px' }}>
                    Submissions: {asg.submissions} / {asg.totalStudents} ({Math.round((asg.submissions / asg.totalStudents) * 100)}%)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  className="gov-btn-outline"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => toast.success(`Viewing ${asg.submissions} student submissions for ${asg.title}`)}
                >
                  📥 View Submissions ({asg.submissions})
                </button>
                <button
                  className="gov-btn-primary"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => toast.success('Bulk grade sheet opened')}
                >
                  📝 Grade Submissions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notes.map((nt) => (
            <div key={nt.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{nt.subject} • {nt.unit}</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginTop: '2px' }}>{nt.title}</h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  Uploaded: {nt.uploadedDate} • Size: {nt.fileSize} • {nt.downloads} student downloads
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="gov-btn-outline"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => toast.success(`Study material "${nt.title}" downloaded!`)}
                >
                  ⬇️ Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="gov-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button className="gov-modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            <div className="gov-modal-header" style={{ textAlign: 'left' }}>
              <span className="gov-card-badge">
                {modalType === 'assignment' ? 'NEW ASSIGNMENT' : 'STUDY NOTES & HANDOUTS'}
              </span>
              <h3 className="gov-modal-title" style={{ marginTop: '4px' }}>
                {modalType === 'assignment' ? 'Create & Publish Coursework' : 'Upload Lecture Notes & Materials'}
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ marginTop: '14px' }}>
              <div className="gov-form-group">
                <label className="gov-form-label">Course / Subject</label>
                <select
                  className="gov-form-input"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                >
                  <option value="PCC-CS701: Artificial Intelligence">PCC-CS701: Artificial Intelligence</option>
                  <option value="PCC-CS702: Cloud Computing">PCC-CS702: Cloud Computing</option>
                  <option value="PCC-CS501: Database Management Systems">PCC-CS501: Database Management Systems</option>
                </select>
              </div>

              {modalType === 'notes' && (
                <div className="gov-form-group">
                  <label className="gov-form-label">Unit / Module</label>
                  <input
                    type="text"
                    className="gov-form-input"
                    placeholder="e.g. Unit 3: Knowledge Representation & Reasoning"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="gov-form-group">
                <label className="gov-form-label">
                  {modalType === 'assignment' ? 'Assignment Title' : 'Handout / Notes Title'}
                </label>
                <input
                  type="text"
                  className="gov-form-input"
                  placeholder={modalType === 'assignment' ? 'e.g. Assignment 3: Neural Networks with PyTorch' : 'e.g. Unit 3 Complete Notes: Expert Systems'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              {modalType === 'assignment' && (
                <div className="gov-form-group">
                  <label className="gov-form-label">Submission Deadline</label>
                  <input
                    type="date"
                    className="gov-form-input"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="gov-form-group">
                <label className="gov-form-label">Instructions / Description</label>
                <textarea
                  className="gov-form-input"
                  rows={3}
                  placeholder="Provide details or reading instructions for students..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '6px', fontSize: '0.78rem', color: '#475569', margin: '14px 0' }}>
                ⚡ <strong>Real-time Broadcast:</strong> Submitting will immediately notify all enrolled students on their portal dashboard.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="gov-btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="gov-btn-primary">
                  {modalType === 'assignment' ? 'Publish Assignment →' : 'Upload & Notify Students →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
