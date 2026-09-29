import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';

export default function AttendancePage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getAll()
      .then(res => {
        setData(res.data.data || []);
        setSummary(res.data.summary || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const overall = summary.reduce((acc, s) => ({
    total: acc.total + parseInt(s.total || 0),
    present: acc.present + parseInt(s.present || 0),
  }), { total: 0, present: 0 });

  const overallPct = overall.total > 0 ? Math.round((overall.present / overall.total) * 100) : 0;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">📋 Attendance</h1>
          <p className="page-desc">Your attendance records and course-wise summary</p>
        </div>
      </div>

      {/* Overall Attendance */}
      <div className="card" style={{ background: `linear-gradient(135deg, ${overallPct >= 75 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}, transparent)`, borderColor: overallPct >= 75 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Attendance</div>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: overallPct >= 75 ? 'var(--success)' : 'var(--danger)', fontFamily: 'Plus Jakarta Sans' }}>{overallPct}%</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {overall.present} present out of {overall.total} classes
            </div>
          </div>
          <div style={{ width: '120px', height: '120px', position: 'relative' }}>
            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--bg-4)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={overallPct >= 75 ? '#10b981' : '#ef4444'} strokeWidth="3" strokeDasharray={`${overallPct} ${100 - overallPct}`} />
            </svg>
            <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: overallPct >= 75 ? 'var(--success)' : 'var(--danger)' }}>
              {overallPct}%
            </div>
          </div>
        </div>
        {overallPct < 75 && (
          <div className="alert alert-warning mt-4" style={{ marginBottom: 0 }}>
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <div className="alert-title">Low Attendance Warning</div>
              <div className="alert-msg">Your attendance is below 75%. You need at least 75% to appear in exams.</div>
            </div>
          </div>
        )}
      </div>

      {/* Course-wise Summary */}
      {summary.length > 0 && (
        <div className="card">
          <div className="card-title mb-4">📊 Course-wise Attendance</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {summary.map((s, i) => {
              const pct = parseFloat(s.percentage) || 0;
              const color = pct >= 75 ? 'success' : pct >= 60 ? 'warning' : 'danger';
              return (
                <div key={i} style={{ padding: '14px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <strong style={{ fontSize: '13px' }}>{s.course_name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px', fontFamily: 'monospace' }}>{s.course_code}</span>
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '15px', color: pct >= 75 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {s.present}/{s.total} classes attended
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Records */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📅 Attendance Records</div>
        </div>
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h4>No attendance records</h4>
            <p>No attendance has been marked yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Date</th><th>Course</th><th>Course Code</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.slice(0, 30).map(a => (
                  <tr key={a.id}>
                    <td>{formatDate(a.date)}</td>
                    <td><strong>{a.course_name}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{a.course_code}</td>
                    <td>
                      <span className={`badge ${a.status === 'present' ? 'badge-success' : a.status === 'absent' ? 'badge-danger' : 'badge-warning'}`}>
                        {a.status === 'present' ? '✓ Present' : a.status === 'absent' ? '✗ Absent' : '⏰ Late'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
