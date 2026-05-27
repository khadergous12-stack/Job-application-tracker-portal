import React, { useState } from 'react';
import { updateJob } from '../hooks/useJobsApi';
import toast from 'react-hot-toast';

const STATUSES = ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

const STATUS_COLORS = {
  Saved: '#94a3b8', Applied: '#3b82f6', OA: '#06b6d4',
  Interview: '#8b5cf6', Offer: '#10b981', Rejected: '#ef4444', Withdrawn: '#f59e0b',
};

/**
 * Inline status dropdown — click the badge to change status instantly
 * Props: jobId, currentStatus, onUpdated (callback)
 */
const QuickStatusSelect = ({ jobId, currentStatus, onUpdated }) => {
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setSaving(true);
    try {
      await updateJob(jobId, { status: newStatus });
      toast.success(`Status → ${newStatus}`);
      onUpdated && onUpdated(newStatus);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={saving}
      style={{
        background: `${STATUS_COLORS[currentStatus]}18`,
        border: `1px solid ${STATUS_COLORS[currentStatus]}44`,
        color: STATUS_COLORS[currentStatus],
        borderRadius: '20px',
        padding: '4px 24px 4px 10px',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: 'inherit',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(STATUS_COLORS[currentStatus])}' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        opacity: saving ? 0.6 : 1,
        transition: 'all 0.2s',
        minWidth: '100px',
      }}
    >
      {STATUSES.map(s => (
        <option key={s} value={s} style={{ background: '#0f172a', color: '#f1f5f9' }}>
          {saving && s === currentStatus ? 'Saving...' : s}
        </option>
      ))}
    </select>
  );
};

export default QuickStatusSelect;
