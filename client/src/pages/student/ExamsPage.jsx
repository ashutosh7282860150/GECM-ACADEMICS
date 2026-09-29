import { useState, useEffect } from 'react';
import { examsAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('exams');

  useEffect(() => {
    Promise.all([examsAPI.getAll(), examsAPI.getResults()])
      .then(([examsRes, resultsRes]) => {
        setExams(examsRes.data.data || []);
        setResults(resultsRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const upcoming = exams.filter(e => new Date(e.exam_date) >= new Date());
  const past = exams.filter(e => new Date(e.exam_date) < new Date());

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">📝 Examinations</h1>
          <p className="page-desc">View your exam schedule and results</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">📅</div><div className="stat-info"><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming Exams</div></div></div>
        <div className="stat-card"><div className="stat-icon green">🏆</div><div className="stat-info"><div className="stat-value">{results.length}</div><div className="stat-label">Published Results</div></div></div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {['exams', 'results'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`}>
            {t === 'exams' ? '📝 Exam Schedule' : '🏆 My Results'}
          </button>
        ))}
      </div>

      {tab === 'exams' && (
        <div className="card">
          {upcoming.length > 0 && (
            <>
              <div className="card-title mb-4" style={{ color: 'var(--warning)' }}>📅 Upcoming Exams</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {upcoming.map(e => (
                  <div key={e.id} style={{ padding: '16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{e.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{e.course_name} ({e.course_code})</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: 'var(--warning)' }}>{formatDate(e.exam_date)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max: {e.max_marks} marks</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {past.length > 0 && (
            <>
              <div className="card-title mb-4">📚 Past Exams</div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Exam Name</th><th>Course</th><th>Type</th><th>Date</th><th>Max Marks</th></tr></thead>
                  <tbody>
                    {past.map(e => (
                      <tr key={e.id}>
                        <td><strong>{e.name}</strong></td>
                        <td style={{ fontSize: '12px' }}>{e.course_name}</td>
                        <td><span className="badge badge-muted" style={{ textTransform: 'capitalize', fontSize: '11px' }}>{e.exam_type?.replace('_', ' ')}</span></td>
                        <td style={{ fontSize: '12px' }}>{formatDate(e.exam_date)}</td>
                        <td>{e.max_marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {exams.length === 0 && (
            <div className="empty-state"><div className="empty-state-icon">📝</div><h4>No exams scheduled</h4></div>
          )}
        </div>
      )}

      {tab === 'results' && (
        <div className="card">
          {results.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🏆</div><h4>No results published yet</h4></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Course</th><th>Exam</th><th>Type</th><th>Date</th><th>Marks</th><th>Max</th><th>Grade</th></tr></thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.course_name}</strong><div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.course_code}</div></td>
                      <td style={{ fontSize: '13px' }}>{r.exam_name}</td>
                      <td><span className="badge badge-muted" style={{ fontSize: '10px', textTransform: 'capitalize' }}>{r.exam_type?.replace('_', ' ')}</span></td>
                      <td style={{ fontSize: '12px' }}>{formatDate(r.exam_date)}</td>
                      <td><strong style={{ color: 'var(--primary-light)', fontSize: '16px' }}>{r.marks_obtained}</strong></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.max_marks}</td>
                      <td>
                        <span className={`badge ${r.grade?.startsWith('A') ? 'badge-success' : r.grade?.startsWith('B') ? 'badge-info' : r.grade?.startsWith('C') ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '13px', fontWeight: '800' }}>
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
