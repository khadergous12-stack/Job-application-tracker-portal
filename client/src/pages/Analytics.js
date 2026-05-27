import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { fetchAnalytics } from '../hooks/useJobsApi';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-muted)' }}>
      Loading analytics...
    </div>
  );

  if (!data || data.total === 0) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>No data yet</h3>
        <p>Add some job applications to see your analytics here.</p>
      </div>
    </div>
  );

  const funnelData = data.funnel.filter(f => f.count > 0);
  const monthlyArr = Object.entries(data.monthlyData).map(([month, count]) => ({ month, count }));
  const sourceArr  = Object.entries(data.sourceData).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
          <p style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Insights from your job search journey</p>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>{data.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>{data.responseRate}%</div>
          <div className="stat-label">Response Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {data.funnel.find(f => f.stage === 'Interview')?.count || 0}
          </div>
          <div className="stat-label">Interviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {data.funnel.find(f => f.stage === 'Offer')?.count || 0}
          </div>
          <div className="stat-label">Offers</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '20px' }}>

        {/* Funnel Bar Chart */}
        {funnelData.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Application Funnel</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="stage" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Applications */}
        {monthlyArr.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Applications Over Time</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyArr} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Source Pie Chart */}
        {sourceArr.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Application Sources</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={sourceArr} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {sourceArr.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Applications']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stage Breakdown Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Stage Breakdown</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {data.funnel.map((item, i) => (
              <div key={item.stage} className="pipeline-row">
                <div className="pipeline-stage">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                  {item.stage}
                </div>
                <div className="pipeline-bar-wrap">
                  <div className="pipeline-bar" style={{ width: `${data.total > 0 ? (item.count / data.total) * 100 : 0}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className="pipeline-count">{item.count}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '36px', textAlign: 'right' }}>
                    {data.total > 0 ? Math.round((item.count / data.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
