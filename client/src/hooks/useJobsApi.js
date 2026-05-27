import axios from 'axios';

// ─── Fetch all jobs (with optional filters) ───────────────────────────────────
export const fetchJobs = async ({ status = '', search = '', sortBy = 'createdAt', order = 'desc' } = {}) => {
  const params = new URLSearchParams();
  if (status && status !== 'All') params.append('status', status);
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  if (order) params.append('order', order);

  const { data } = await axios.get(`/api/jobs?${params.toString()}`);
  return data;
};

// ─── Create new job application ───────────────────────────────────────────────
export const createJob = async (jobData) => {
  const { data } = await axios.post('/api/jobs', jobData);
  return data;
};

// ─── Update existing job application ─────────────────────────────────────────
export const updateJob = async (id, jobData) => {
  const { data } = await axios.put(`/api/jobs/${id}`, jobData);
  return data;
};

// ─── Delete job application ───────────────────────────────────────────────────
export const deleteJob = async (id) => {
  const { data } = await axios.delete(`/api/jobs/${id}`);
  return data;
};

// ─── Fetch analytics ─────────────────────────────────────────────────────────
export const fetchAnalytics = async () => {
  const { data } = await axios.get('/api/jobs/analytics');
  return data;
};
