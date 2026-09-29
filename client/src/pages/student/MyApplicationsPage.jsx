import { useState, useEffect } from 'react';
import { applicationsAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import ApplicationDossierModal from '../common/ApplicationDossierModal';
import toast from 'react-hot-toast';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeDossier, setActiveDossier] = useState(null);

  // Correction Edit state
  const [correctionModal, setCorrectionModal] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({ reason: '', remarks: '' });
  const [resubmitting, setResubmitting] = useState(false);

  const fetchApplications = () => {
    applicationsAPI.getMyApplications()
      .then(res => setApplications(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 10000); // Poll every 10s for real-time updates
    return () => clearInterval(interval);
  }, []);

  const handleResubmit = async (e) => {
    e.preventDefault();
    setResubmitting(true);
    try {
      await applicationsAPI.resubmit(correctionModal.id, { formData: correctionForm });
      toast.success('Application updated and resubmitted successfully! 🚀');
      setCorrectionModal(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resubmission failed');
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading My Applications...</span></div>;

  const filteredApps = filterStatus === 'ALL'
    ? applications
    : applications.filter(a => a.current_status.toUpperCase() === filterStatus);

  return (
    <div className="dashboard-grid">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">📋 My Applications</h1>
          <p className="page-desc">Track real-time routing status, reviewer notes, department clearances, and download certificates</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_CORRECTION', 'APPROVED', 'REJECTED', 'DRAFT'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '12px' }}
          >
            {status === 'ALL' ? 'All Applications' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Applications Table / Cards */}
      <div className="card">
        {filteredApps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h4>No Applications Found</h4>
            <p>You have no applications matching status "{filterStatus}".</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Type</th>
                  <th>Submitted Date</th>
                  <th>Assigned Department</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => (
                  <tr key={app.id}>
                    <td><strong style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>{app.application_id}</strong></td>
                    <td><strong>{app.type_name}</strong></td>
                    <td style={{ fontSize: '12px' }}>{formatDate(app.submitted_at, 'dd MMM yyyy, hh:mm a')}</td>
                    <td style={{ fontSize: '12px' }}>{app.assigned_department}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(app.current_status)}`}>
                        {getStatusLabel(app.current_status)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setActiveDossier(app)}>
                          View Dossier 🔍
                        </button>
                        {app.current_status === 'NEEDS_CORRECTION' && (
                          <button className="btn btn-warning btn-sm" onClick={() => {
                            setCorrectionModal(app);
                            setCorrectionForm(app.form_data || {});
                          }}>
                            Fix & Resubmit ✏️
                          </button>
                        )}
                      </div>
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
          userRole="student"
        />
      )}

      {/* Correction Resubmission Modal */}
      {correctionModal && (
        <div className="modal-overlay" onClick={() => setCorrectionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Resubmit Application ({correctionModal.application_id})</h3>
              <button className="modal-close" onClick={() => setCorrectionModal(null)}>✕</button>
            </div>

            <div className="alert alert-warning mb-4">
              <span className="alert-icon">⚠️</span>
              <div>
                <strong>Requested Correction Note:</strong>
                <div>{correctionModal.correction_note || 'Please update details as requested by reviewer.'}</div>
              </div>
            </div>

            <form onSubmit={handleResubmit}>
              <div className="form-group">
                <label className="form-label form-required">Updated Application Reason / Details</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={correctionForm.reason || ''}
                  onChange={e => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setCorrectionModal(null)}>Cancel</button>
                <button type="submit" className={`btn btn-primary ${resubmitting ? 'btn-loading' : ''}`} disabled={resubmitting}>
                  {resubmitting ? '' : 'Resubmit Application →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
