import { useState, useEffect } from 'react';
import { applicationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function WorkflowConfigPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTypes = () => {
    applicationsAPI.getTypes()
      .then(res => setTypes(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedList = types.map(t => t.code === editingType.code ? editingType : t);
      await applicationsAPI.updateRoutingConfig({ updatedTypes: updatedList });
      toast.success('Centralized Workflow Routing Configuration updated successfully! ⚙️');
      setTypes(updatedList);
      setEditingType(null);
    } catch (err) {
      toast.error('Failed to update workflow routing configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading Workflow Routing Config...</span></div>;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">⚙️ Application Workflow Routing Configuration</h1>
          <p className="page-desc">Data-driven routing engine: Configure responsible roles, departments, clearance stages, and active workflows</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Application Name</th>
                <th>Category</th>
                <th>Responsible Role</th>
                <th>Responsible Department</th>
                <th>Multi-Dept Clearance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map(t => (
                <tr key={t.code}>
                  <td><strong style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>{t.code}</strong></td>
                  <td><span style={{ fontSize: '1.2rem', marginRight: '6px' }}>{t.icon}</span><strong>{t.name}</strong></td>
                  <td style={{ fontSize: '12px' }}>{t.category}</td>
                  <td><span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{t.responsibleRole}</span></td>
                  <td style={{ fontSize: '12px' }}>{t.responsibleDepartment}</td>
                  <td>
                    <span className={`badge ${t.multiDeptClearance ? 'badge-success' : 'badge-secondary'}`}>
                      {t.multiDeptClearance ? 'Yes (Multi-Dept)' : 'No (Single Approval)'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditingType({ ...t })}>
                      Edit Routing ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Config Modal */}
      {editingType && (
        <div className="modal-overlay" onClick={() => setEditingType(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Configure Routing ({editingType.code})</h3>
              <button className="modal-close" onClick={() => setEditingType(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveConfig}>
              <div className="form-group">
                <label className="form-label">Application Name</label>
                <input type="text" className="form-control" value={editingType.name} onChange={e => setEditingType({ ...editingType, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Responsible Role</label>
                <select className="form-control" value={editingType.responsibleRole} onChange={e => setEditingType({ ...editingType, responsibleRole: e.target.value })}>
                  <option value="admin">Administrator (admin)</option>
                  <option value="warden">Warden (warden)</option>
                  <option value="hod">HOD (hod)</option>
                  <option value="faculty">Faculty (faculty)</option>
                  <option value="accounts">Accounts Cell (accounts)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Responsible Department Name</label>
                <input type="text" className="form-control" value={editingType.responsibleDepartment} onChange={e => setEditingType({ ...editingType, responsibleDepartment: e.target.value })} required />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingType.multiDeptClearance} onChange={e => setEditingType({ ...editingType, multiDeptClearance: e.target.checked })} />
                  Require Multi-Department Clearance (Hostel, Library, Accounts, Dept, Lab, Admin)
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingType(null)}>Cancel</button>
                <button type="submit" className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} disabled={saving}>
                  {saving ? '' : 'Save Workflow Routing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
