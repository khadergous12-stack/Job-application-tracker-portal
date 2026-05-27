import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import JobModal from '../components/JobModal';
import SkeletonList from '../components/SkeletonCard';
import QuickStatusSelect from '../components/QuickStatusSelect';
import AppDetailDrawer from '../components/AppDetailDrawer';
import CSVImportModal from '../components/CSVImportModal';
import { fetchJobs, createJob, updateJob, deleteJob } from '../hooks/useJobsApi';

const ALL_STATUSES = ['All', 'Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

const Applications = () => {
  const [jobs, setJobs]               = useState([]);
  const [stats, setStats]             = useState({});
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal]     = useState(false);
  const [editJob, setEditJob]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [drawerJob, setDrawerJob]     = useState(null);
  const [showCSV, setShowCSV]         = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobs({ status: statusFilter, search });
      setJobs(data.jobs);
      setStats(data.stats);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(loadJobs, 300);
    return () => clearTimeout(timer);
  }, [loadJobs]);

  const handleAddOrUpdate = async (formData) => {
    try {
      if (editJob) {
        await updateJob(editJob._id, formData);
        toast.success('Application updated!');
      } else {
        await createJob(formData);
        toast.success('Application added!');
      }
      setShowModal(false);
      setEditJob(null);
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      toast.success('Application deleted');
      setDeleteConfirm(null);
      loadJobs();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (job) => { setEditJob(job); setShowModal(true); };
  const openAdd  = ()    => { setEditJob(null); setShowModal(true); };

  const getPriorityDot = (priority) => {
    const cls = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' };
    return <span className={`priority-dot ${cls[priority] || ''}`} title={`${priority} priority`} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">
            {stats.total || 0} total · {stats.applied || 0} applied · {stats.interview || 0} interviews
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowCSV(true)}>
            📥 Import CSV
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Add Application
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text" className="search-input"
            placeholder="Search company or role..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <SkeletonList count={5} />
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>{search || statusFilter !== 'All' ? 'No results found' : 'No applications yet'}</h3>
          <p>
            {search || statusFilter !== 'All'
              ? 'Try adjusting your filters'
              : 'Add your first job application to get started!'}
          </p>
          {!search && statusFilter === 'All' && (
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={openAdd}>
              Add First Application
            </button>
          )}
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div className="job-card" key={job._id}>
              {getPriorityDot(job.priority)}

              {/* Main info — click to open drawer */}
              <div className="job-card-main" style={{ cursor: 'pointer' }} onClick={() => setDrawerJob(job)}>
                <div className="job-title">{job.roleTitle}</div>
                <div className="job-company">{job.companyName}</div>
                <div className="job-meta">
                  {job.location && (
                    <span className="job-meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {job.location}
                    </span>
                  )}
                  {job.source && (
                    <span className="job-meta-item">{job.source}</span>
                  )}
                  {job.appliedDate && (
                    <span className="job-meta-item">
                      📅 Applied {formatDate(job.appliedDate)}
                    </span>
                  )}
                  {job.interviewDate && (
                    <span className="job-meta-item" style={{ color: '#8b5cf6' }}>
                      🗓 Interview {formatDate(job.interviewDate)}
                    </span>
                  )}
                  {job.salaryNote && (
                    <span className="job-meta-item" style={{ color: '#10b981' }}>
                      💰 {job.salaryNote}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 4 }}>
                    → click for tasks & docs
                  </span>
                </div>
              </div>

              {/* Inline status selector */}
              <QuickStatusSelect
                jobId={job._id}
                currentStatus={job.status}
                onUpdated={(newStatus) => {
                  setJobs(prev => prev.map(j =>
                    j._id === job._id ? { ...j, status: newStatus } : j
                  ));
                }}
              />

              {/* Action buttons */}
              <div className="job-actions">
                {job.jobUrl && (
                  <a
                    href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm" title="Open job link"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEdit(job)} title="Edit"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteConfirm(job._id)} title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Drawer */}
      {drawerJob && (
        <AppDetailDrawer
          job={drawerJob}
          onClose={() => setDrawerJob(null)}
          onUpdate={(updatedJob) => {
            setDrawerJob(updatedJob);
            setJobs(prev => prev.map(j => j._id === updatedJob._id ? updatedJob : j));
          }}
        />
      )}

      {/* CSV Import Modal */}
      {showCSV && (
        <CSVImportModal
          onClose={() => setShowCSV(false)}
          onImported={() => { setShowCSV(false); loadJobs(); }}
        />
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <JobModal
          job={editJob}
          onClose={() => { setShowModal(false); setEditJob(null); }}
          onSave={handleAddOrUpdate}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Are you sure you want to delete this application? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(deleteConfirm)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
