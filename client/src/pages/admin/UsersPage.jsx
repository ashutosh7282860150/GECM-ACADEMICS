import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { timeAgo, getInitials, getRoleColor, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    adminAPI.getUsers({ search, role: roleFilter })
      .then(res => setUsers(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await adminAPI.createUser(form);
      toast.success('User created successfully!');
      setCreateModal(false);
      setForm({ name: '', email: '', password: '', role: 'student', phone: '' });
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
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const ROLE_COLORS = { admin: '#ef4444', student: '#6366f1', faculty: '#10b981', hod: '#8b5cf6', warden: '#f59e0b', accounts: '#0ea5e9' };

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">👥 User Management</h1>
          <p className="page-desc">Manage all system users and their roles</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCreateModal(true)} id="create-user-btn">+ Create User</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input type="text" className="form-control" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto', minWidth: '140px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {['student', 'faculty', 'hod', 'warden', 'accounts', 'admin'].map(r => (
              <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-page"><div className="spinner" /></div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>User</th><th>Role</th><th>Phone</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">👥</div><h4>No users found</h4></div></td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${ROLE_COLORS[u.role]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: ROLE_COLORS[u.role], flexShrink: 0 }}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px' }}>{u.name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role], padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.last_login ? timeAgo(u.last_login) : 'Never'}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-success'}`}
                        style={{ borderColor: u.is_active ? 'var(--danger)' : '', color: u.is_active ? 'var(--danger)' : '' }}
                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {createModal && (
        <div className="modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">👥 Create New User</h3>
              <button className="modal-close" onClick={() => setCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Full Name</label>
                  <input type="text" className="form-control" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label form-required">Role</label>
                  <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {['student', 'faculty', 'hod', 'warden', 'accounts', 'admin'].map(r => (
                      <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label form-required">Email</label>
                <input type="email" className="form-control" placeholder="user@smartcampus.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-required">Password</label>
                  <input type="password" className="form-control" placeholder="Set password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-control" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setCreateModal(false)}>Cancel</button>
                <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} disabled={submitting} id="create-user-submit-btn">
                  {submitting ? '' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
