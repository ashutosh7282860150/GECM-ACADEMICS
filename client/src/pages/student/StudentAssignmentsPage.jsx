import { useState } from 'react';
import toast from 'react-hot-toast';

export default function StudentAssignmentsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      subject: 'Artificial Intelligence (PCC-CS701)',
      faculty: 'Prof. Anita Sharma',
      title: 'Assignment 2: Heuristic Search & A* Algorithm Implementation',
      deadline: '05 OCT 2026',
      status: 'Pending',
      totalMarks: 20,
      description: 'Implement the A* search algorithm for 8-puzzle problem in Python. Include state space tree traversal and heuristic calculation in your submitted report.'
    },
    {
      id: 2,
      subject: 'Cloud Computing (PCC-CS702)',
      faculty: 'Dr. Vikram Singh',
      title: 'Assignment 1: AWS Architecture & Serverless Lambda Deployment',
      deadline: '08 OCT 2026',
      status: 'Pending',
      totalMarks: 25,
      description: 'Design a microservice architecture deploying AWS API Gateway, Lambda, and DynamoDB. Submit architectural diagram and source code repo link.'
    },
    {
      id: 3,
      subject: 'Cyber Security (CS703A)',
      faculty: 'Prof. Rajan Nair',
      title: 'Assignment 1: RSA Public Key Cryptography Analysis',
      deadline: '24 SEP 2026',
      status: 'Submitted',
      submittedOn: '23 SEP 2026',
      score: '19/20',
      totalMarks: 20,
      description: 'Mathematical proof and Python implementation of RSA key pair generation, encryption and decryption.'
    }
  ]);

  const [notes, setNotes] = useState([
    {
      id: 'nt1',
      title: 'Unit 1 & 2 Complete Lecture Handout: State Space Search & Heuristics',
      subject: 'PCC-CS701: Artificial Intelligence',
      faculty: 'Prof. Anita Sharma',
      unit: 'Unit 1 & 2',
      uploadedDate: '28 SEP 2026',
      fileSize: '4.2 MB PDF'
    },
    {
      id: 'nt2',
      title: 'AWS Core Services, EC2, S3 & VPC Architectural Notes',
      subject: 'PCC-CS702: Cloud Computing',
      faculty: 'Dr. Vikram Singh',
      unit: 'Unit 2: Virtualization & AWS',
      uploadedDate: '25 SEP 2026',
      fileSize: '6.8 MB PDF'
    },
    {
      id: 'nt3',
      title: 'Relational Algebra & SQL Query Optimization Slides',
      subject: 'PCC-CS501: Database Management Systems',
      faculty: 'Dr. Vikram Singh',
      unit: 'Unit 3: Query Processing',
      uploadedDate: '22 SEP 2026',
      fileSize: '3.1 MB PDF'
    }
  ]);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to submit.');
      return;
    }
    setAssignments(prev => prev.map(a => a.id === activeModal.id ? { ...a, status: 'Submitted', submittedOn: 'Today', score: 'Under Evaluation' } : a));
    toast.success(`Assignment "${activeModal.title}" uploaded successfully! Sent to faculty for grading.`);
    setActiveModal(null);
    setSelectedFile(null);
  };

  const pendingList = assignments.filter(a => a.status === 'Pending');
  const submittedList = assignments.filter(a => a.status === 'Submitted');

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
          ACADEMIC ASSIGNMENTS &amp; STUDY NOTES
        </span>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
          Coursework Submissions &amp; Lecture Materials
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
          View subject-wise assignments, track deadlines, submit coursework, and download faculty lecture notes in real time.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeTab === 'pending' ? '1px solid #0b1d3a' : '1px solid #e2e8f0',
            background: activeTab === 'pending' ? '#0b1d3a' : '#ffffff',
            color: activeTab === 'pending' ? '#ffffff' : '#334155',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ⏳ Pending Submissions ({pendingList.length})
        </button>

        <button
          onClick={() => setActiveTab('submitted')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeTab === 'submitted' ? '1px solid #0b1d3a' : '1px solid #e2e8f0',
            background: activeTab === 'submitted' ? '#0b1d3a' : '#ffffff',
            color: activeTab === 'submitted' ? '#ffffff' : '#334155',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ✅ Completed &amp; Graded ({submittedList.length})
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
          📚 Faculty Study Notes ({notes.length})
        </button>
      </div>

      {/* Assignments List */}
      {activeTab !== 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(activeTab === 'pending' ? pendingList : submittedList).map((asg) => (
            <div key={asg.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>{asg.subject}</span>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1d3a', marginTop: '2px' }}>{asg.title}</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Assigned by: <strong>{asg.faculty}</strong></div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: asg.status === 'Pending' ? '#fffbeb' : '#f0fdf4',
                    color: asg.status === 'Pending' ? '#b45309' : '#16a34a',
                    border: `1px solid ${asg.status === 'Pending' ? '#fde68a' : '#bbf7d0'}`
                  }}>
                    {asg.status === 'Pending' ? `Due: ${asg.deadline}` : `Submitted on ${asg.submittedOn}`}
                  </span>
                  {asg.score && (
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
                      Score: {asg.score}
                    </div>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '12px 0', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                {asg.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                {asg.status === 'Pending' ? (
                  <button className="gov-btn-primary" onClick={() => setActiveModal(asg)}>
                    📤 Submit Solution / Upload PDF →
                  </button>
                ) : (
                  <button className="gov-btn-outline" onClick={() => toast.success('Downloaded submitted file.')}>
                    📄 View Submitted Document
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Study Notes Tab */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notes.map((nt) => (
            <div key={nt.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{nt.subject} • {nt.unit}</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginTop: '2px' }}>{nt.title}</h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  Uploaded by: <strong>{nt.faculty}</strong> on {nt.uploadedDate} • Size: {nt.fileSize}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="gov-btn-primary"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => toast.success(`Study material "${nt.title}" downloaded successfully!`)}
                >
                  ⬇️ Download Notes PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {activeModal && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="gov-modal-close" onClick={() => setActiveModal(null)}>✕</button>
            <div className="gov-modal-header" style={{ textAlign: 'left' }}>
              <span className="gov-card-badge">ASSIGNMENT SUBMISSION</span>
              <h3 className="gov-modal-title" style={{ marginTop: '4px' }}>{activeModal.title}</h3>
              <p className="gov-modal-sub">{activeModal.subject} • Deadline: {activeModal.deadline}</p>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ marginTop: '16px' }}>
              <div className="gov-form-group">
                <label className="gov-form-label">Upload Solution File (PDF, ZIP, Max 15MB)</label>
                <input
                  type="file"
                  className="gov-form-input"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Optional Comments for Faculty</label>
                <textarea
                  className="gov-form-input"
                  rows={3}
                  placeholder="e.g., Attached complete source code and execution screenshots..."
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="gov-btn-outline" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="gov-btn-primary">
                  Confirm &amp; Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
