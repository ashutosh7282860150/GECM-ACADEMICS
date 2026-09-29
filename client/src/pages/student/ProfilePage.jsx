import { useState, useEffect } from 'react';
import { studentsAPI } from '../../services/api';
import { formatDate, getInitials, getRoleColor } from '../../utils/helpers';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsAPI.getProfile()
      .then(res => setProfile(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!profile) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><h4>Profile not found</h4></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">👤 My Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))', borderColor: 'rgba(99,102,241,0.3)' }}>
        <div className="flex items-center gap-5 flex-wrap">
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${getRoleColor('student')}, ${getRoleColor('student')}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: 'white', flexShrink: 0, boxShadow: '0 8px 20px rgba(99,102,241,0.4)' }}>
            {getInitials(profile.name)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '4px' }}>{profile.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{profile.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge badge-primary">Student</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile.enrollment_no}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile.department_name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Academic Info */}
        <div className="card">
          <div className="card-title mb-4">🎓 Academic Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Enrollment No', value: profile.enrollment_no, mono: true },
              { label: 'Department', value: `${profile.department_name} (${profile.department_code})` },
              { label: 'Semester', value: `Semester ${profile.semester}` },
              { label: 'Academic Year', value: profile.academic_year },
              { label: 'Batch', value: profile.batch },
              { label: 'Hostel Resident', value: profile.hostel_resident ? '✅ Yes' : '❌ No' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', fontFamily: item.mono ? 'monospace' : 'inherit' }}>{item.value || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="card">
          <div className="card-title mb-4">👤 Personal Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Date of Birth', value: formatDate(profile.dob) },
              { label: 'Gender', value: profile.gender },
              { label: 'Blood Group', value: profile.blood_group },
              { label: 'Phone', value: profile.phone },
              { label: 'Guardian Name', value: profile.guardian_name },
              { label: 'Guardian Phone', value: profile.guardian_phone },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{item.value || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
