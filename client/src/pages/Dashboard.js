import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchJobs } from '../hooks/useJobsApi';
import { SkeletonStatCard } from '../components/SkeletonCard';

const STAGE_COLORS = {
  Saved: '#94a3b8', Applied: '#3b82f6', OA: '#06b6d4',
  Interview: '#8b5cf6', Offer: '#10b981', Rejected: '#ef4444', Withdrawn: '#f59e0b'
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchJobs({ sortBy: 'createdAt', order: 'desc' });
        setStats(data.stats);
        setRecentJobs(data.jobs.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusBadgeClass = (status) => `badge badge-${status.toLowerCase()}`;

  const pipelineStages = [
    { label: 'Saved', count: stats?.saved || 0, color: STAGE_COLORS.Saved },
    { label: 'Applied', count: stats?.applied || 0, color: STAGE_COLORS.Applied },
    { label: 'OA', count: stats?.oa || 0, color: STAGE_COLORS.OA },
    { label: 'Interview', count: stats?.interview || 0, color: STAGE_COLORS.Interview },
    { label: 'Offer', count: stats?.offer || 0, color: STAGE_COLORS.Offer },
    { label: 'Rejected', count: stats?.rejected || 0, color: STAGE_COLORS.Rejected },
  ];

  const maxCount = Math.max(...pipelineStages.map(s => s.count), 1);

  if (loading) return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ width: 220, height: 28, background: 'var(--bg-card)', borderRadius: 8, marginBottom: 8 }} />
          <div style={{ width: 160, height: 14, background: 'var(--bg-card)', borderRadius: 6 }} />
        </div>
      </div>
      <div className="stats-grid">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
    </div>
  );

  const responseRate = stats?.applied > 0
    ? Math.round(((stats.interview + stats.oa + stats.offer) / stats.applied) * 100)
    : 0;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">Here's your job search overview</p>
        </div>
        <Link to="/applications" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          Add Application
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>{stats?.total || 0}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#06b6d4' }}>{stats?.applied || 0}</div>
          <div className="stat-label">Applied</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats?.interview || 0}</div>
          <div className="stat-label">Interviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>{stats?.offer || 0}</div>
          <div className="stat-label">Offers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats?.rejected || 0}</div>
          <div className="stat-label">Rejected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{responseRate}%</div>
          <div className="stat-label">Response Rate</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Pipeline */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Application Pipeline</h2>
          </div>
          {pipelineStages.map(stage => (
            <div className="pipeline-row" key={stage.label}>
              <div className="pipeline-stage">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, display: 'inline-block' }} />
                {stage.label}
              </div>
              <div className="pipeline-bar-wrap">
                <div className="pipeline-bar" style={{ width: `${(stage.count / maxCount) * 100}%`, background: stage.color }} />
              </div>
              <div className="pipeline-count">{stage.count}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Applications</h2>
            <Link to="/applications" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              <p>No applications yet. Add your first one!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentJobs.map(job => (
                <div key={job._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.roleTitle}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.companyName}</div>
                  </div>
                  <span className={getStatusBadgeClass(job.status)}>{job.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h2 className="card-title">💡 Quick Tips</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { icon: '📝', tip: 'Update your status after every interaction with a company' },
              { icon: '📅', tip: 'Set interview dates to stay prepared and never miss a call' },
              { icon: '🎯', tip: 'Track the source of applications to focus on what works' },
              { icon: '📊', tip: 'Check Analytics regularly to improve your strategy' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
