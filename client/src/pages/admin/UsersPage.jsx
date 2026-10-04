import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { timeAgo, getInitials, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const location = useLocation();
  const isFacultyRoute = location.pathname.includes('/faculty');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(isFacultyRoute ? 'faculty' : '');
  const [createModal, setCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: isFacultyRoute ? 'Faculty@123' : 'Admin@123', role: isFacultyRoute ? 'faculty' : 'faculty', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isFacultyRoute && !roleFilter) {
      setRoleFilter('faculty');
    }
  }, [isFacultyRoute]);

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getUsers({ search, role: roleFilter })
      .then(res => setUsers(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await adminAPI.createUser(form);
      toast.success(`User ${form.name} created and saved to database successfully!`);
      setCreateModal(false);
      setForm({ name: '', email: '', password: 'Faculty@123', role: isFacultyRoute ? 'faculty' : 'faculty', phone: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const ROLE_COLORS = {
    admin: '#ef4444',
    student: '#3b82f6',
    faculty: '#10b981',
    hod: '#8b5cf6',
    warden: '#f59e0b',
    accounts: '#0ea5e9',
    librarian: '#ec4899',
    library: '#ec4899'
  };

  const ROLE_LABELS = {
    admin: 'Administrator',
    faculty: 'Faculty / Professor',
    hod: 'Head of Dept (HOD)',
    student: 'Student',
    warden: 'Hostel Warden',
    accounts: 'Accounts & Fee Cell',
    librarian: 'Library Incharge',
    library: 'Library Staff'
  };

  return (
    <div className="dashboard-grid">
      {/* ── HEADER ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>{isFacultyRoute ? '👨‍🏫' : '👥'}</span>
            <h1 className="page-title" style={{ margin: 0 }}>
              {isFacultyRoute ? 'Faculty & Staff Management' : 'User & Faculty Management'}
            </h1>
          </div>
          <p className="page-desc">
            Authorized institutional user accounts, roles, access permissions and real-time login audit
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCreateModal(true)} id="create-user-btn" style={{ fontWeight: '700' }}>
            + Create New {isFacultyRoute ? 'Faculty / User' : 'User'}
          </button>
        </div>
      </div>

      {/* ── ROLE TABS / FILTER BAR ── */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="search-input-wrapper" style={{ flex: '1', minWidth: '220px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by user name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${roleFilter === '' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRoleFilter('')}
            >
              All Roles ({users.length})
            </button>
            <button
              className={`btn btn-sm ${roleFilter === 'faculty' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRoleFilter('faculty')}
            >
              👨‍🏫 Faculty
            </button>
            <button
              className={`btn btn-sm ${roleFilter === 'hod' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRoleFilter('hod')}
            >
              🏛️ HODs
            </button>
            <button
              className={`btn btn-sm ${roleFilter === 'warden' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRoleFilter('warden')}
            >
              🏨 Wardens
            </button>
            <button
              className={`btn btn-sm ${roleFilter === 'accounts' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRoleFilter('accounts')}
            >
              💰 Accounts
            </button>
            <button
              className={`btn btn-sm ${roleFilter === 'student' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRoleFilter('student')}
            >
              🎓 Students
            </button>
            <button
              className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRoleFilter('admin')}
            >
              👑 Admin
            </button>
          </div>
        </div>
      </div>

      {/* ── USERS TABLE (User, Role, Phone, Status, Last Login, Actions) ── */}
      <div className="card">
        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Loading user roster...</span></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>User</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: 'right', minWidth: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h4>No user accounts found</h4>
                        <p>No records match your filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : users.map(u => {
                  const roleColor = ROLE_COLORS[u.role] || '#64748b';
                  const roleLabel = ROLE_LABELS[u.role] || u.role?.toUpperCase();

                  return (
                    <tr key={u.id}>
                      {/* 1. USER */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: `${roleColor}18`,
                              border: `1.5px solid ${roleColor}40`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: '800',
                              color: roleColor,
                              flexShrink: 0
                            }}
                          >
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <strong style={{ fontSize: '13.5px', color: '#0b1d3a', display: 'block' }}>{u.name}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* 2. ROLE */}
                      <td>
                        <span
                          style={{
                            background: `${roleColor}15`,
                            color: roleColor,
                            border: `1px solid ${roleColor}35`,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ● {roleLabel}
                        </span>
                      </td>

                      {/* 3. PHONE */}
                      <td style={{ fontFamily: 'monospace', fontSize: '12.5px', color: '#334155' }}>
                        {u.phone || '—'}
                      </td>

                      {/* 4. STATUS */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            background: u.is_active ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                            color: u.is_active ? '#15803d' : '#b91c1c',
                            border: `1px solid ${u.is_active ? '#86efac' : '#fca5a5'}`
                          }}
                        >
                          {u.is_active ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>

                      {/* 5. LAST LOGIN */}
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: u.last_login ? '#1e293b' : 'var(--text-muted)' }}>
                          {u.last_login ? timeAgo(u.last_login) : 'Never logged in'}
                        </div>
                        {u.last_login && (
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {formatDate(u.last_login)}
                          </div>
                        )}
                      </td>

                      {/* 6. ACTIONS */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => setSelectedUser(u)}
                            title="View user dossier"
                          >
                            👁️ View
                          </button>
                          <button
                            className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-success'}`}
                            style={{
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderColor: u.is_active ? '#dc2626' : '',
                              color: u.is_active ? '#dc2626' : ''
                            }}
                            onClick={() => handleToggleStatus(u.id, u.is_active)}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE USER MODAL ── */}
      {createModal && (
        <div className="modal-overlay" onClick={() => setCreateModal(false)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>👥</span>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>Create New User Account</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Saved permanently to PostgreSQL database with active credentials.
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '6px 0' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Alok Kumar"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-required">System Role</label>
                  <select
                    className="form-control"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="faculty">👨‍🏫 Faculty / Professor</option>
                    <option value="hod">🏛️ Head of Dept (HOD)</option>
                    <option value="warden">🏨 Hostel Warden</option>
                    <option value="accounts">💰 Accounts &amp; Fee Cell</option>
                    <option value="librarian">📚 Library Incharge</option>
                    <option value="admin">👑 Administrator</option>
                    <option value="student">🎓 Student</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-required">Institutional Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@smartcampus.edu"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Login Password</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Set password (e.g. Faculty@123)"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9800000020"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setCreateModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
                  disabled={submitting}
                  id="create-user-submit-btn"
                >
                  {submitting ? 'Creating...' : '💾 Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW USER DOSSIER MODAL ── */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '95%' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0 }}>👤 User Profile Dossier</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: `${ROLE_COLORS[selectedUser.role]}22`,
                    color: ROLE_COLORS[selectedUser.role],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '800'
                  }}
                >
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0b1d3a' }}>{selectedUser.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedUser.email}</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${selectedUser.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {selectedUser.is_active ? '✓ Active Account' : '✕ Deactivated'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ROLE DESIGNATION</div>
                  <div style={{ fontWeight: '700', color: '#0b1d3a', textTransform: 'capitalize' }}>{selectedUser.role}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>PHONE NUMBER</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: '700' }}>{selectedUser.phone || 'Not configured'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>LAST LOGIN RECORD</div>
                  <div style={{ fontWeight: '600' }}>{selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ACCOUNT CREATED</div>
                  <div style={{ fontWeight: '600' }}>{formatDate(selectedUser.created_at)}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                className={`btn btn-sm ${selectedUser.is_active ? 'btn-outline' : 'btn-success'}`}
                onClick={() => {
                  handleToggleStatus(selectedUser.id, selectedUser.is_active);
                  setSelectedUser(null);
                }}
              >
                {selectedUser.is_active ? 'Deactivate Account' : 'Activate Account'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
