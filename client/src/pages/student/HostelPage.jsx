import { useState, useEffect } from 'react';
import { hostelAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';

export default function HostelPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hostelAPI.getInfo()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading hostel info...</span></div>;

  const { hostelResident, allocation } = data || {};

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🏠 Hostel</h1>
          <p className="page-desc">Your hostel accommodation details</p>
        </div>
      </div>

      {hostelResident && allocation ? (
        <>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))', borderColor: 'rgba(99,102,241,0.3)' }}>
            <div className="flex items-center gap-4">
              <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🏠</div>
              <div>
                <h3>{allocation.hostel_name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'capitalize' }}>{allocation.hostel_type} Hostel</p>
              </div>
              <div className="ml-auto">
                <span className="badge badge-success">✓ Allocated</span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">🚪</div>
              <div className="stat-info">
                <div className="stat-value">Room {allocation.room_no}</div>
                <div className="stat-label">Room Number</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">🏢</div>
              <div className="stat-info">
                <div className="stat-value">Floor {allocation.floor_no}</div>
                <div className="stat-label">Floor</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">👥</div>
              <div className="stat-info">
                <div className="stat-value" style={{ textTransform: 'capitalize' }}>{allocation.room_type}</div>
                <div className="stat-label">Room Type</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon cyan">📅</div>
              <div className="stat-info">
                <div className="stat-value">{formatDate(allocation.check_in_date)}</div>
                <div className="stat-label">Check-in Date</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title mb-4">📋 Accommodation Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Hostel Name', value: allocation.hostel_name },
                { label: 'Room Number', value: allocation.room_no },
                { label: 'Floor', value: `Floor ${allocation.floor_no}` },
                { label: 'Room Type', value: allocation.room_type },
                { label: 'Check-in Date', value: formatDate(allocation.check_in_date) },
                { label: 'Status', value: <span className={`badge ${getStatusBadgeClass(allocation.status)}`}>{allocation.status}</span> },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                  <div style={{ fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title mb-4">📜 Hostel Rules</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: '🕙', rule: 'Curfew time: 10:00 PM on weekdays, 11:00 PM on weekends' },
                { icon: '🚪', rule: 'Gate pass required for overnight stays or extended leaves' },
                { icon: '🔕', rule: 'Silence hours: 11:00 PM – 6:00 AM' },
                { icon: '🚫', rule: 'No cooking inside rooms except in designated kitchen areas' },
                { icon: '🧹', rule: 'Rooms must be kept clean and tidy at all times' },
                { icon: '📵', rule: 'No visitors allowed in rooms after 8:00 PM' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <h4>Day Scholar</h4>
            <p>You are not currently allocated a hostel room. Contact the warden's office if you wish to apply for hostel accommodation.</p>
            <div className="mt-4 alert alert-info" style={{ textAlign: 'left' }}>
              <span className="alert-icon">📞</span>
              <div className="alert-content">
                <div className="alert-title">Contact Warden</div>
                <div className="alert-msg">Email: warden@smartcampus.edu | Phone: +91 9800000003</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
