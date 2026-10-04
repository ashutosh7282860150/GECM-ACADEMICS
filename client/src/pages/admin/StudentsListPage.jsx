import { useState, useEffect } from 'react';
import { studentsAPI, adminAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function StudentsListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Create Student Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departmentsList, setDepartmentsList] = useState([
    { id: 'd1', name: 'Computer Science & Engineering', code: 'CSE' },
    { id: 'd2', name: 'Electronics & Communication Engineering', code: 'ECE' },
    { id: 'd3', name: 'Mechanical Engineering', code: 'ME' },
    { id: 'd4', name: 'Civil Engineering', code: 'CE' },
    { id: 'd5', name: 'Electrical Engineering', code: 'EE' }
  ]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'Student@123',
    phone: '',
    enrollment_no: '',
    roll_no: '',
    department_id: 'd1',
    semester: '1',
    batch: '2024-2028',
    gender: 'Male',
    hostel_resident: false,
    guardian_name: '',
    guardian_phone: ''
  });

  const fetchStudents = () => {
    setLoading(true);
    studentsAPI.getAll({ search, semester, department, page, limit: 20 })
      .then(res => {
        setStudents(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [search, semester, department, page]);

  useEffect(() => {
    adminAPI.getDepartments()
      .then(res => {
        if (res.data?.data?.length) {
          setDepartmentsList(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.enrollment_no.trim()) {
      toast.error('Please enter Full Name, Email, and Enrollment No.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await studentsAPI.create({
        ...form,
        semester: parseInt(form.semester) || 1,
        hostel_resident: Boolean(form.hostel_resident)
      });

      toast.success(res.data?.message || 'Student created and saved to database successfully!');
      setShowCreateModal(false);
      setForm({
        name: '',
        email: '',
        password: 'Student@123',
        phone: '',
        enrollment_no: '',
        roll_no: '',
        department_id: departmentsList[0]?.id || 'd1',
        semester: '1',
        batch: '2024-2028',
        gender: 'Male',
        hostel_resident: false,
        guardian_name: '',
        guardian_phone: ''
      });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const autoFillEnrollment = (nameVal, deptId) => {
    const dept = departmentsList.find(d => d.id === deptId) || departmentsList[0];
    const code = dept?.code || 'CSE';
    const year = new Date().getFullYear();
    const randSeq = Math.floor(100 + Math.random() * 900);
    const suggested = `${code}${year}${randSeq}`;
    
    setForm(prev => ({
      ...prev,
      enrollment_no: prev.enrollment_no || suggested,
      roll_no: prev.roll_no || suggested
    }));
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="dashboard-grid">
      {/* ── HEADER ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <h1 className="page-title" style={{ margin: 0 }}>Student Management</h1>
          </div>
          <p className="page-desc">Permanent Student Master Directory &amp; Academic Enrollment Registry ({total} registered)</p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
            onClick={() => setShowCreateModal(true)}
            id="create-new-student-btn"
          >
            <span>+</span> Create New User / Student
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="search-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: '1', minWidth: '220px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name, enrollment no or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={department}
            onChange={e => { setDepartment(e.target.value); setPage(1); }}
          >
            <option value="">All Branches</option>
            {departmentsList.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '130px' }}
            value={semester}
            onChange={e => { setSemester(e.target.value); setPage(1); }}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── STUDENTS DATA TABLE ── */}
      <div className="card">
        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Loading students...</span></div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <h4>No students found</h4>
            <p>Try adjusting your search criteria or click &quot;Create New User / Student&quot; to register a student.</p>
            <button className="btn btn-primary btn-sm mt-3" onClick={() => setShowCreateModal(true)}>+ Add Student</button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student Name &amp; Email</th>
                    <th>Enrollment No</th>
                    <th>Branch / Dept</th>
                    <th style={{ textAlign: 'center' }}>Semester</th>
                    <th>Batch</th>
                    <th>Gender</th>
                    <th>Hostel</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.email}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
                        {s.enrollment_no}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {s.department_name || 'Engineering'}
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.department_code || 'GECM'}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                          Sem {s.semester}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>{s.batch || '2024-28'}</td>
                      <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>{s.gender || 'Male'}</td>
                      <td>
                        <span className={`badge ${s.hostel_resident ? 'badge-success' : 'badge-muted'}`}>
                          {s.hostel_resident ? '✓ Resident' : 'Day Scholar'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>{s.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4" style={{ padding: '10px' }}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── CREATE NEW STUDENT / USER MODAL (SAVED TO DATABASE PERMANENTLY) ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🎓</span>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>Create New User / Student</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Data is permanently stored in the institutional database with login credentials.
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStudent} style={{ padding: '4px 0' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Full Student Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Kumar Verma"
                    required
                    value={form.name}
                    onChange={e => {
                      setForm({ ...form, name: e.target.value });
                      if (!form.email && e.target.value) {
                        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                        setForm(f => ({ ...f, name: e.target.value, email: `${slug}@smartcampus.edu` }));
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-required">Student Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="student@smartcampus.edu"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label form-required">Enrollment Number / Roll ID</label>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => autoFillEnrollment(form.name, form.department_id)}
                    >
                      ⚡ Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. CSE2024045"
                    required
                    value={form.enrollment_no}
                    onChange={e => setForm({ ...form, enrollment_no: e.target.value.toUpperCase(), roll_no: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-required">Branch / Academic Department</label>
                  <select
                    className="form-control"
                    value={form.department_id}
                    onChange={e => setForm({ ...form, department_id: e.target.value })}
                  >
                    {departmentsList.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Semester</label>
                  <select
                    className="form-control"
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Batch</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 2024-2028"
                    value={form.batch}
                    onChange={e => setForm({ ...form, batch: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Student Contact Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-required">Initial Login Password</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Set password (default: Student@123)"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Guardian Name (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Father / Mother / Guardian Name"
                    value={form.guardian_name}
                    onChange={e => setForm({ ...form, guardian_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guardian Phone (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Guardian phone number"
                    value={form.guardian_phone}
                    onChange={e => setForm({ ...form, guardian_phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0b1d3a' }}>Hostel Resident Status</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Check if student is residing in campus hostels (Bhabha / Gargi Halls)</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={form.hostel_resident}
                    onChange={e => setForm({ ...form, hostel_resident: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span>Hostel Resident</span>
                </label>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
                  disabled={submitting}
                  id="submit-create-student-btn"
                >
                  {submitting ? 'Saving to Database...' : '💾 Save Student to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
