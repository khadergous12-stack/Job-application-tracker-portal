import React, { useState } from 'react';
import TaskPanel from './TaskPanel';
import DocumentPanel from './DocumentPanel';

const TABS = ['Tasks', 'Documents', 'Notes'];

const AppDetailDrawer = ({ job, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('Tasks');
  const [notes, setNotes]         = useState(job?.notes || '');
  const [saving, setSaving]       = useState(false);

  if (!job) return null;

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const axios = (await import('axios')).default;
      const { data } = await axios.put(`/api/jobs/${job._id}`, { notes });
      onUpdate && onUpdate(data.job);
      const toast = (await import('react-hot-toast')).default;
      toast.success('Notes saved');
    } catch {
      const toast = (await import('react-hot-toast')).default;
      toast.error('Failed to save notes');
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 480,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border-light)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s ease',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10,
        }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.roleTitle}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{job.companyName}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span className={`badge badge-${job.status?.toLowerCase()}`}>{job.status}</span>
              {job.location && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {job.location}</span>}
              {job.salaryNote && <span style={{ fontSize: 12, color: 'var(--success)' }}>💰 {job.salaryNote}</span>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ flexShrink: 0 }}>×</button>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s', marginBottom: -1,
              }}
            >
              {tab === 'Tasks' ? '✅ Tasks' : tab === 'Documents' ? '📄 Docs' : '📝 Notes'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: 24, flex: 1 }}>
          {activeTab === 'Tasks' && (
            <TaskPanel jobId={job._id} companyName={job.companyName} roleTitle={job.roleTitle} />
          )}

          {activeTab === 'Documents' && (
            <DocumentPanel jobId={job._id} />
          )}

          {activeTab === 'Notes' && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Notes about this application — interview feedback, recruiter details, follow-up actions.
              </p>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Write your notes here..."
                style={{ minHeight: 200, marginBottom: 12 }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSaveNotes} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Notes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AppDetailDrawer;
