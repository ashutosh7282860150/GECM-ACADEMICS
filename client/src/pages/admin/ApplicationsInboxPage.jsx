import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import ApplicationDossierModal from '../common/ApplicationDossierModal';
import toast from 'react-hot-toast';

export default function ApplicationsInboxPage() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Dossier Modal
  const [activeDossier, setActiveDossier] = useState(null);

  const fetchInbox = () => {
    const params = {};
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (typeFilter !== 'ALL') params.type = typeFilter;
    if (searchQuery) params.search = searchQuery;
    if (sortBy) params.sortBy = sortBy;

    applicationsAPI.getInbox(params)
      .then(res => setInbox(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 2500); // Live real-time polling every 2.5s
    return () => clearInterval(interval);
  }, [statusFilter, typeFilter, searchQuery, sortBy]);

  const handleReviewAction = async (appId, reviewPayload) => {
    try {
      const res = await applicationsAPI.review(appId, reviewPayload);
      toast.success(res.data.message);
      fetchInbox();
      if (activeDossier && activeDossier.id === appId) {
        setActiveDossier(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review action failed');
      throw err;
    }
  };

  const handleClearanceUpdate = async (appId, department, status) => {
    try {
      const res = await applicationsAPI.updateClearance(appId, { department, status, remarks: `Verified by ${user?.name}` });
      toast.success(res.data.message);
      fetchInbox();
      if (activeDossier && activeDossier.id === appId) {
        setActiveDossier(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clearance update failed');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading Applications Inbox...</span></div>;

  // Stats calculation
  const totalCount = inbox.length;
  const pendingCount = inbox.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.current_status)).length;
  const approvedCount = inbox.filter(a => a.current_status === 'APPROVED').length;
  const rejectedCount = inbox.filter(a => a.current_status === 'REJECTED').length;
  const correctionCount = inbox.filter(a => a.current_status === 'NEEDS_CORRECTION').length;

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">📥 Applications Inbox ({user?.role.toUpperCase()})</h1>
          <p className="page-desc">Review student applications, verify department clearances, approve, reject or request corrections in real time</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', color: '#15803d', fontSize: '0.78rem', fontWeight: 700 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.5s infinite' }}></span>
          <span>⚡ Live Real-Time Sync</span>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">📬</div><div className="stat-info"><div className="stat-value">{totalCount}</div><div className="stat-label">Total Assigned</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div className="stat-info"><div className="stat-value">{pendingCount}</div><div className="stat-label">Pending Review</div></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><div className="stat-value">{approvedCount}</div><div className="stat-label">Approved</div></div></div>
        <div className="stat-card"><div className="stat-icon red">❌</div><div className="stat-info"><div className="stat-value">{rejectedCount}</div><div className="stat-label">Rejected</div></div></div>
        <div className="stat-card"><div className="stat-icon orange">⚠️</div><div className="stat-info"><div className="stat-value">{correctionCount}</div><div className="stat-label">Needs Correction</div></div></div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Search Application / Student</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search ID, Name, Roll No..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Filter by Status</label>
            <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="UNDER_REVIEW">Pending / Under Review</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Filter by Type</label>
            <select className="form-control" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="ALL">All Application Types</option>
              <option value="GECM-GP">Gate Pass (GECM-GP)</option>
              <option value="GECM-ND">No Dues Clearance (GECM-ND)</option>
              <option value="GECM-LV">Leave Application (GECM-LV)</option>
              <option value="GECM-BF">Bonafide Certificate (GECM-BF)</option>
              <option value="GECM-CC">Character Certificate (GECM-CC)</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Sort Order</label>
            <select className="form-control" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inbox Table */}
      <div className="card">
        {inbox.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📥</div>
            <h4>No Applications in Inbox</h4>
            <p>No applications match your active filters.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Student Name</th>
                  <th>Roll / Reg No</th>
                  <th>Type</th>
                  <th>Submitted Date</th>
                  <th>Current Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inbox.map(app => (
                  <tr key={app.id}>
                    <td><strong style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>{app.application_id}</strong></td>
                    <td><strong>{app.student_name}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{app.enrollment_no}</td>
                    <td>{app.type_name}</td>
                    <td style={{ fontSize: '12px' }}>{formatDate(app.submitted_at, 'dd MMM yyyy, hh:mm a')}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(app.current_status)}`}>
                        {getStatusLabel(app.current_status)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveDossier(app)}>
                        Review Dossier 🔍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Dossier Modal */}
      {activeDossier && (
        <ApplicationDossierModal
          app={activeDossier}
          onClose={() => setActiveDossier(null)}
          onReview={handleReviewAction}
          onClearanceUpdate={handleClearanceUpdate}
          userRole={user?.role}
        />
      )}
    </div>
  );
}
