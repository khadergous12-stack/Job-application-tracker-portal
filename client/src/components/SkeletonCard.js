import React from 'react';

/* Pulsing skeleton shimmer for loading states */
const shimmer = {
  background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '6px',
};

// Inject keyframe once
if (!document.getElementById('skeleton-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-style';
  style.textContent = `@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
  document.head.appendChild(style);
}

const Box = ({ w = '100%', h = 14, style = {} }) => (
  <div style={{ width: w, height: h, ...shimmer, ...style }} />
);

/* Single skeleton job card */
export const SkeletonJobCard = () => (
  <div className="job-card" style={{ cursor: 'default' }}>
    <Box w={10} h={10} style={{ borderRadius: '50%', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Box w="45%" h={14} />
      <Box w="28%" h={12} />
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Box w={70} h={10} />
        <Box w={80} h={10} />
      </div>
    </div>
    <Box w={68} h={24} style={{ borderRadius: 20 }} />
    <div style={{ display: 'flex', gap: 8 }}>
      <Box w={32} h={32} style={{ borderRadius: 8 }} />
      <Box w={32} h={32} style={{ borderRadius: 8 }} />
    </div>
  </div>
);

/* Skeleton for stat card */
export const SkeletonStatCard = () => (
  <div className="stat-card">
    <Box w="55%" h={32} style={{ marginBottom: 8 }} />
    <Box w="70%" h={10} />
  </div>
);

/* Full page skeleton for Applications */
const SkeletonList = ({ count = 5 }) => (
  <div className="jobs-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonJobCard key={i} />
    ))}
  </div>
);

export default SkeletonList;
