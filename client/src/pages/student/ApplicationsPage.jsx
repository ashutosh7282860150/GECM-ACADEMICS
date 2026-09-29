import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, studentsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Application Modal state
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      applicationsAPI.getTypes(),
      studentsAPI.getProfile().catch(() => ({ data: { data: null } }))
    ])
      .then(([typesRes, profRes]) => {
        setTypes(typesRes.data.data || []);
        setProfile(profRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openApplicationForm = (type) => {
    setSelectedType(type);
    setStep(1);
    setFormData({
      studentName: user?.name || '',
      enrollmentNo: profile?.enrollment_no || 'CSE2021001',
      department: profile?.department_name || 'Computer Science & Engineering',
      semester: profile?.semester || 7,
      mobile: user?.phone || '9900000010',
      reason: '',
      destination: '',
      outDate: '',
      outTime: '',
      returnDate: '',
      returnTime: '',
      emergencyContact: profile?.guardian_phone || '9800100001'
    });
    setUploadedFiles([]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('document', file);

    try {
      const res = await applicationsAPI.uploadDocument(fd);
      setUploadedFiles(prev => [...prev, res.data.data]);
      toast.success('Document uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft) {
      if (!formData.reason) {
        toast.error('Please enter the reason for your application');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        typeCode: selectedType.code,
        formData: {
          ...formData,
          uploadedFiles
        },
        isDraft
      };

      const res = await applicationsAPI.submit(payload);
      toast.success(res.data.message);
      setSelectedType(null);
      navigate('/student/my-applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading Academic Services...</span></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">📄 Applications & Academic Services</h1>
          <p className="page-desc">Submit digital applications, request certificates, outpasses, and track real-time routing</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/student/my-applications')}>
            📋 Track My Applications →
          </button>
        </div>
      </div>

      {/* 7 Application Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {types.map((type) => (
          <div key={type.code} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--primary)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem', padding: '10px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)' }}>{type.icon}</span>
                <span className="badge badge-info" style={{ fontSize: '11px', fontFamily: 'monospace' }}>{type.code}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>{type.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>{type.description}</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>📍 {type.responsibleDepartment}</span>
              <button className="btn btn-primary btn-sm" onClick={() => openApplicationForm(type)}>
                Apply Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-Step Application Modal */}
      {selectedType && (
        <div className="modal-overlay" onClick={() => setSelectedType(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>{selectedType.icon}</span>
                <div>
                  <h3 className="modal-title">{selectedType.name}</h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Routed to: {selectedType.responsibleDepartment}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedType(null)}>✕</button>
            </div>

            {/* Step Wizard Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: 'var(--bg-3)', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}>
              {[
                { num: 1, label: 'Student Info' },
                { num: 2, label: 'Details' },
                { num: 3, label: 'Documents' },
                { num: 4, label: 'Review' }
              ].map(s => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: step >= s.num ? 1 : 0.4, cursor: 'pointer' }} onClick={() => setStep(s.num)}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= s.num ? 'var(--primary)' : 'var(--border-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                    {s.num}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* STEP 1: Student Information */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--primary-light)' }}>Step 1: Student Information (Auto-filled)</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roll / Enrollment No</label>
                    <input type="text" className="form-control" value={formData.enrollmentNo} readOnly />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" value={formData.department} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <input type="text" className="form-control" value={`Semester ${formData.semester}`} readOnly />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="text" className="form-control" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setSelectedType(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>Next: Details →</button>
                </div>
              </div>
            )}

            {/* STEP 2: Application Details */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--primary-light)' }}>Step 2: {selectedType.name} Details</h4>

                <div className="form-group">
                  <label className="form-label form-required">Reason for Application</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="State detailed reason for this application..."
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    required
                  />
                </div>

                {selectedType.code === 'GECM-GP' && (
                  <>
                    <div className="form-group">
                      <label className="form-label form-required">Destination</label>
                      <input type="text" className="form-control" placeholder="e.g. Home - Madhubani" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Out Date & Time</label>
                        <input type="datetime-local" className="form-control" value={formData.outDate} onChange={e => setFormData({ ...formData, outDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Return Date & Time</label>
                        <input type="datetime-local" className="form-control" value={formData.returnDate} onChange={e => setFormData({ ...formData, returnDate: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}

                {selectedType.code === 'GECM-LV' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Leave From Date</label>
                      <input type="date" className="form-control" value={formData.outDate} onChange={e => setFormData({ ...formData, outDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Leave To Date</label>
                      <input type="date" className="form-control" value={formData.returnDate} onChange={e => setFormData({ ...formData, returnDate: e.target.value })} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input type="text" className="form-control" value={formData.emergencyContact} onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })} />
                </div>

                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Attachments →</button>
                </div>
              </div>
            )}

            {/* STEP 3: Documents */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--primary-light)' }}>Step 3: Attach Supporting Documents (Optional)</h4>

                <div style={{ padding: '20px', border: '2px dashed var(--border-dark)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg-3)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📁</div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>Upload Supporting Document (PDF, JPG, PNG)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 12px' }}>Max file size: 5MB</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} style={{ display: 'none' }} id="file-upload-input" />
                  <label htmlFor="file-upload-input" className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>Uploaded Files:</div>
                    {uploadedFiles.map((file, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                        <span>📄 {file.file_name} ({file.file_size})</span>
                        <button type="button" className="btn btn-danger btn-sm" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => removeFile(i)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(4)}>Next: Review & Submit →</button>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Submit */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--primary-light)' }}>Step 4: Review & Final Submission</h4>

                <div style={{ background: 'var(--bg-3)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div><strong>Type:</strong> {selectedType.name}</div>
                    <div><strong>Routing:</strong> {selectedType.responsibleDepartment}</div>
                    <div><strong>Student:</strong> {formData.studentName} ({formData.enrollmentNo})</div>
                    <div><strong>Mobile:</strong> {formData.mobile}</div>
                  </div>
                  <div><strong>Reason:</strong> {formData.reason}</div>
                  {uploadedFiles.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Attached Files: {uploadedFiles.map(f => f.file_name).join(', ')}
                    </div>
                  )}
                </div>

                <div className="alert alert-info">
                  <span className="alert-icon">ℹ️</span>
                  <div>
                    <div className="alert-msg">Upon clicking submit, your application will be assigned to {selectedType.responsibleDepartment} and stored in the database.</div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                  <button className="btn btn-outline" onClick={() => handleSubmit(true)} disabled={submitting}>Save Draft</button>
                  <button className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} onClick={() => handleSubmit(false)} disabled={submitting}>
                    {submitting ? '' : 'Submit Application →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
