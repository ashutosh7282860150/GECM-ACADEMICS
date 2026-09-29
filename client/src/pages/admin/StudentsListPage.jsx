import { useState, useEffect } from 'react';
import { studentsAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';

export default function StudentsListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchStudents = () => {
    setLoading(true);
    studentsAPI.getAll({ search, semester, page, limit: 20 })
      .then(res => {
        setStudents(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [search, semester, page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🎓 Students</h1>
          <p className="page-desc">Total: {total} students</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input type="text" className="form-control" placeholder="Search by name or enrollment no..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ width: 'auto', minWidth: '140px' }} value={semester} onChange={e => { setSemester(e.target.value); setPage(1); }}>
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <h4>No students found</h4>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Enrollment No</th><th>Department</th><th>Semester</th><th>Batch</th><th>Gender</th><th>Hostel</th><th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.email}</div></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{s.enrollment_no}</td>
                      <td style={{ fontSize: '12px' }}>{s.department_name}<div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.department_code}</div></td>
                      <td style={{ textAlign: 'center' }}><span style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>Sem {s.semester}</span></td>
                      <td>{s.batch}</td>
                      <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>{s.gender}</td>
                      <td><span className={`badge ${s.hostel_resident ? 'badge-success' : 'badge-muted'}`}>{s.hostel_resident ? 'Yes' : 'No'}</span></td>
                      <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>{s.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
