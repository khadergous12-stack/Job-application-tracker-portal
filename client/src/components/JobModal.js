import React, { useState, useEffect } from 'react';

const STATUSES = ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const SOURCES = ['LinkedIn', 'Indeed', 'Naukri', 'Company Website', 'Referral', 'GitHub Jobs', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const defaultForm = {
  companyName: '', roleTitle: '', location: '', jobUrl: '',
  source: 'LinkedIn', status: 'Saved', priority: 'Medium',
  appliedDate: '', interviewDate: '', salaryNote: '', notes: ''
};

const JobModal = ({ job, onClose, onSave }) => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setForm({
        companyName: job.companyName || '',
        roleTitle: job.roleTitle || '',
        location: job.location || '',
        jobUrl: job.jobUrl || '',
        source: job.source || 'LinkedIn',
        status: job.status || 'Saved',
        priority: job.priority || 'Medium',
        appliedDate: job.appliedDate ? job.appliedDate.substring(0, 10) : '',
        interviewDate: job.interviewDate ? job.interviewDate.substring(0, 10) : '',
        salaryNote: job.salaryNote || '',
        notes: job.notes || ''
      });
    }
  }, [job]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{job ? 'Edit Application' : 'Add Application'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Company & Role */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input type="text" name="companyName" className="form-input" placeholder="e.g. Google" value={form.companyName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role / Job Title *</label>
                <input type="text" name="roleTitle" className="form-input" placeholder="e.g. Software Engineer" value={form.roleTitle} onChange={handleChange} required />
              </div>
            </div>

            {/* Location & URL */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" name="location" className="form-input" placeholder="e.g. Bangalore, Remote" value={form.location} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Job URL</label>
                <input type="url" name="jobUrl" className="form-input" placeholder="https://..." value={form.jobUrl} onChange={handleChange} />
              </div>
            </div>

            {/* Status, Source, Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select name="source" className="form-select" value={form.source} onChange={handleChange}>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Salary / Package Note</label>
                <input type="text" name="salaryNote" className="form-input" placeholder="e.g. ₹12 LPA" value={form.salaryNote} onChange={handleChange} />
              </div>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Applied Date</label>
                <input type="date" name="appliedDate" className="form-input" value={form.appliedDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Interview Date</label>
                <input type="date" name="interviewDate" className="form-input" value={form.interviewDate} onChange={handleChange} />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-textarea" placeholder="Any additional notes, recruiter contact, etc." value={form.notes} onChange={handleChange} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Saving...' : job ? 'Save Changes' : 'Add Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
