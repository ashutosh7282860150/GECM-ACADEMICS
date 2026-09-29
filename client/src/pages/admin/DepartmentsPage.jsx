import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

export default function DepartmentsPage() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDepartments()
      .then(res => setDepts(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🏛️ Departments</h1>
          <p className="page-desc">Academic department overview and statistics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {depts.map((dept, i) => {
          const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
          const color = colors[i % colors.length];
          return (
            <div key={dept.id} className="card" style={{ borderTop: `3px solid ${color}` }}>
              <div className="flex items-center gap-3 mb-4">
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🏛️</div>
                <div>
                  <strong style={{ fontSize: '15px' }}>{dept.name}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{dept.code}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color }}>{dept.student_count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Students</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color }}>{dept.faculty_count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Faculty</div>
                </div>
              </div>
              {dept.hod_name && (
                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>HOD: </span>
                  <strong>{dept.hod_name}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
