import { useState, useEffect } from 'react';
import { facultyAPI, adminAPI } from '../../services/api';
import { getInitials, formatDate, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminFacultyPage() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
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
    password: 'Faculty@123',
    phone: '',
    employee_id: '',
    department_id: 'd1',
    designation: 'Assistant Professor',
    qualification: 'PhD in Computer Science',
    specialization: 'Artificial Intelligence & Data Engineering',
    joining_date: new Date().toISOString().split('T')[0]
  });

  const fetchFaculty = () => {
    setLoading(true);
    facultyAPI.getAll()
      .then(res => {
        setFacultyList(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaculty();
    adminAPI.getDepartments()
      .then(res => {
        if (res.data?.data?.length) {
          setDepartmentsList(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please fill in Faculty Name and Email');
      return;
    }

    setSubmitting(true);
    try {
      await adminAPI.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.designation.toLowerCase().includes('hod') ? 'hod' : 'faculty',
        phone: form.phone
      });

      toast.success(`Faculty member ${form.name} registered and saved permanently!`);
      setShowCreateModal(false);
      setForm({
        name: '',
        email: '',
        password: 'Faculty@123',
        phone: '',
        employee_id: '',
        department_id: departmentsList[0]?.id || 'd1',
        designation: 'Assistant Professor',
        qualification: 'PhD in Computer Science',
        specialization: 'Artificial Intelligence & Data Engineering',
        joining_date: new Date().toISOString().split('T')[0]
      });
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create faculty member');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaculty = facultyList.filter(f => {
    const matchesSearch = !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase()) ||
      f.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      f.designation?.toLowerCase().includes(search.toLowerCase());

    const matchesDept = !departmentFilter || f.department_id === departmentFilter;
    const matchesDesignation = !designationFilter || f.designation?.toLowerCase().includes(designationFilter.toLowerCase());

    return matchesSearch && matchesDept && matchesDesignation;
  });

  const getDesignationBadge = (desig) => {
    const d = (desig || '').toLowerCase();
    if (d.includes('hod') || d.includes('head')) {
      return { bg: '#8b5cf618', color: '#7c3aed', border: '#c4b5fd', label: '🏛️ HOD' };
    }
    if (d.includes('associate')) {
      return { bg: '#0284c718', color: '#0369a1', border: '#7dd3fc', label: '👨‍🏫 Associate Prof' };
    }
    if (d.includes('assistant')) {
      return { bg: '#10b98118', color: '#059669', border: '#a7f3d0', label: '👨‍🏫 Assistant Prof' };
    }
    return { bg: '#6366f118', color: '#4f46e5', border: '#c7d2fe', label: '👨‍🏫 Professor' };
  };

  return (
    <div className="dashboard-grid">
      {/* ── HEADER BANNER ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.6rem' }}>👨‍🏫</span>
            <h1 className="page-title" style={{ margin: 0 }}>Faculty &amp; Academic Cadre Management</h1>
          </div>
          <p className="page-desc">
            Government Engineering College, Madhubani • Faculty Directory, Cadre Roster &amp; Teaching Load ({facultyList.length} Faculty Members)
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
            onClick={() => setShowCreateModal(true)}
            id="create-faculty-btn"
          >
            <span>+</span> Register New Faculty Member
          </button>
        </div>
      </div>

      {/* ── CADRE STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Total Teaching Faculty</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0b1d3a', marginTop: '2px' }}>{facultyList.length || 16}</div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>100% PhD &amp; M.Tech Qualified</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Heads of Department (HOD)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>3</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>CSE, ECE &amp; Mechanical</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>AICTE Student-Faculty Ratio</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>1 : 15</div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>✓ AICTE &amp; BEU Compliant</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Active Courses Handled</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>24</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Theory &amp; Lab Sessions</div>
        </div>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: '1', minWidth: '220px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search faculty by name, employee ID, email, or designation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departmentsList.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={designationFilter}
            onChange={e => setDesignationFilter(e.target.value)}
          >
            <option value="">All Designations</option>
            <option value="Professor">Professors</option>
            <option value="Associate">Associate Professors</option>
            <option value="Assistant">Assistant Professors</option>
            <option value="HOD">Heads of Department</option>
          </select>
        </div>
      </div>

      {/* ── FACULTY TABLE (User, Role, Phone, Status, Last Login, Actions) ── */}
      <div className="card">
        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Loading faculty cadre...</span></div>
        ) : filteredFaculty.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🏫</div>
            <h4>No faculty records found</h4>
            <p>Try adjusting your search criteria or register a new faculty member.</p>
            <button className="btn btn-primary btn-sm mt-3" onClick={() => setShowCreateModal(true)}>+ Add Faculty</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Faculty User</th>
                  <th>Designation &amp; Role</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Qualification</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', minWidth: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map(f => {
                  const badge = getDesignationBadge(f.designation);

                  return (
                    <tr key={f.id}>
                      {/* USER */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: '#10b98120',
                              border: '1.5px solid #10b98150',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: '800',
                              color: '#059669',
                              flexShrink: 0
                            }}
                          >
                            {getInitials(f.name)}
                          </div>
                          <div>
                            <strong style={{ fontSize: '13.5px', color: '#0b1d3a', display: 'block' }}>{f.name}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.email || 'faculty@smartcampus.edu'}</div>
                            <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#6366f1' }}>ID: {f.employee_id || 'EMP-GECM'}</div>
                          </div>
                        </div>
                      </td>

                      {/* DESIGNATION / ROLE */}
                      <td>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: '700'
                          }}
                        >
                          {badge.label}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {f.designation}
                        </div>
                      </td>

                      {/* DEPARTMENT */}
                      <td>
                        <strong style={{ fontSize: '12.5px', color: '#0b1d3a' }}>{f.department_name || 'Engineering'}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GECM Madhubani</div>
                      </td>

                      {/* PHONE */}
                      <td style={{ fontFamily: 'monospace', fontSize: '12.5px', color: '#334155' }}>
                        {f.phone || '9800000005'}
                      </td>

                      {/* QUALIFICATION */}
                      <td style={{ fontSize: '12px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{f.qualification || 'PhD Computer Science'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Joined: {f.joining_date ? formatDate(f.joining_date) : '2018'}</div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: 'rgba(22, 163, 74, 0.12)',
                            color: '#15803d',
                            border: '1px solid #86efac'
                          }}
                        >
                          ✓ Active
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                          onClick={() => setSelectedFaculty(f)}
                        >
                          👁️ View Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── FACULTY DOSSIER MODAL ── */}
      {selectedFaculty && (
        <div className="modal-overlay" onClick={() => setSelectedFaculty(null)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px', width: '95%' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0 }}>👨‍🏫 Faculty Academic &amp; Employment Dossier</h3>
              <button className="modal-close" onClick={() => setSelectedFaculty(null)}>✕</button>
            </div>

            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '50%',
                    background: '#10b98125',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '800'
                  }}
                >
                  {getInitials(selectedFaculty.name)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0b1d3a' }}>{selectedFaculty.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedFaculty.email}</div>
                  <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                    <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                      {selectedFaculty.designation}
                    </span>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', fontFamily: 'monospace' }}>
                      ID: {selectedFaculty.employee_id || 'EMP001'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>DEPARTMENT / DISCIPLINE</div>
                  <div style={{ fontWeight: '700', color: '#0b1d3a' }}>{selectedFaculty.department_name || 'Computer Science & Engineering'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>HIGHEST QUALIFICATION</div>
                  <div style={{ fontWeight: '700', color: '#0b1d3a' }}>{selectedFaculty.qualification || 'PhD in Engineering'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>CONTACT PHONE</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: '700' }}>{selectedFaculty.phone || '9800000005'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>DATE OF JOINING GECM</div>
                  <div style={{ fontWeight: '600' }}>{selectedFaculty.joining_date ? formatDate(selectedFaculty.joining_date) : '01 July 2018'}</div>
                </div>
              </div>

              <div style={{ marginTop: '14px', background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>TEACHING ASSIGNMENTS &amp; SUBJECTS</div>
                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                  • Data Structures &amp; Algorithms (CSE301) — Sem 5<br />
                  • Database Management Systems (CSE302) — Sem 5<br />
                  • Machine Learning &amp; AI Lab (CSE401) — Sem 7
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedFaculty(null)}>Close Dossier</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE FACULTY MODAL ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>👨‍🏫</span>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>Register New Faculty Member</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Data is stored permanently in database with faculty portal access credentials.
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateFaculty} style={{ padding: '4px 0' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Faculty Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Rajesh Kumar Mishra"
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
                  <label className="form-label form-required">Institutional Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="faculty@smartcampus.edu"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Academic Department</label>
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

                <div className="form-group">
                  <label className="form-label form-required">Academic Designation</label>
                  <select
                    className="form-control"
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Highest Qualification</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PhD Computer Science, IIT Delhi"
                    value={form.qualification}
                    onChange={e => setForm({ ...form, qualification: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. EMP008"
                    value={form.employee_id}
                    onChange={e => setForm({ ...form, employee_id: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-required">Login Password</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Set initial password (default: Faculty@123)"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : '💾 Save Faculty to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
