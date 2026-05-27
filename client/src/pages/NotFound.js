import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)', textAlign: 'center', padding: '24px'
  }}>
    <div style={{ fontSize: '96px', marginBottom: '16px', opacity: 0.3 }}>🗂️</div>
    <h1 style={{ fontSize: '72px', fontWeight: '900', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>404</h1>
    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>Page Not Found</h2>
    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '360px', marginBottom: '32px', lineHeight: 1.6 }}>
      This page doesn't exist. You may have followed a broken link or mistyped the URL.
    </p>
    <Link to="/dashboard" className="btn btn-primary btn-lg">
      ← Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
