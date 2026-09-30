import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function FacultyProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || 'Dr. Vikram Singh',
    employeeId: 'EMP-CSE-004',
    designation: 'Associate Professor & HOD',
    department: 'Department of Computer Science & Engineering',
    email: user?.email || 'faculty1@smartcampus.edu',
    phone: '+91 98765 43210',
    qualification: 'Ph.D. in Computer Science (IIT Patna), M.Tech (NIT Trichy)',
    specialization: 'Distributed Computing, Artificial Intelligence & Cloud Security',
    joiningDate: '15th July 2020',
    researchPapers: '18 Publications in IEEE / Springer Journals',
    officeRoom: 'Cabin 204, Academic Block 2'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success('Faculty profile updated successfully!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
              FACULTY PROFILE &amp; ACADEMIC RECORD
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1d3a', marginTop: '6px' }}>
              {profile.name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              {profile.designation} • {profile.department}
            </p>
          </div>

          <button
            className={isEditing ? 'gov-btn-primary' : 'gov-btn-outline'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Editing' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Institutional Information */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              🏛️ Institutional Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="gov-form-group">
                <label className="gov-form-label">Employee ID</label>
                <input type="text" className="gov-form-input" value={profile.employeeId} disabled />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Department</label>
                <input type="text" className="gov-form-input" value={profile.department} disabled />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Designation</label>
                <input type="text" className="gov-form-input" value={profile.designation} disabled />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Office / Cabin Location</label>
                <input
                  type="text"
                  className="gov-form-input"
                  value={profile.officeRoom}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, officeRoom: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Academic & Contact Details */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              🎓 Qualifications &amp; Research
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="gov-form-group">
                <label className="gov-form-label">Highest Qualification</label>
                <input
                  type="text"
                  className="gov-form-input"
                  value={profile.qualification}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Research Specialization</label>
                <input
                  type="text"
                  className="gov-form-input"
                  value={profile.specialization}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Official Email</label>
                <input
                  type="email"
                  className="gov-form-input"
                  value={profile.email}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="gov-form-input"
                  value={profile.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
            <button type="button" className="gov-btn-outline" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="gov-btn-primary">
              💾 Save Profile Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
