// ─── Format date to readable string ──────────────────────────────────────────
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: '2-digit',
    ...options
  });
};

// ─── Get status badge CSS class ───────────────────────────────────────────────
export const getStatusClass = (status) =>
  `badge badge-${(status || '').toLowerCase()}`;

// ─── Status color map ─────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  Saved:     '#94a3b8',
  Applied:   '#3b82f6',
  OA:        '#06b6d4',
  Interview: '#8b5cf6',
  Offer:     '#10b981',
  Rejected:  '#ef4444',
  Withdrawn: '#f59e0b',
};

// ─── All status options ───────────────────────────────────────────────────────
export const STATUSES     = ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
export const ALL_STATUSES = ['All', ...STATUSES];
export const SOURCES      = ['LinkedIn', 'Indeed', 'Naukri', 'Company Website', 'Referral', 'GitHub Jobs', 'Other'];
export const PRIORITIES   = ['Low', 'Medium', 'High'];

// ─── Truncate long text ───────────────────────────────────────────────────────
export const truncate = (str, len = 40) =>
  str && str.length > len ? str.slice(0, len) + '…' : (str || '');

// ─── Get user initials ────────────────────────────────────────────────────────
export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Calculate response rate ──────────────────────────────────────────────────
export const calcResponseRate = (stats = {}) => {
  const applied = (stats.applied || 0) + (stats.oa || 0) + (stats.interview || 0) + (stats.offer || 0);
  const responded = (stats.oa || 0) + (stats.interview || 0) + (stats.offer || 0);
  return applied > 0 ? Math.round((responded / applied) * 100) : 0;
};

// ─── Greeting based on time ───────────────────────────────────────────────────
export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};
