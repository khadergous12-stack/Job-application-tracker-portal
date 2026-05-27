import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Analytics from './pages/Analytics';
import Kanban from './pages/Kanban';
import Navbar from './components/Navbar';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '10px' }
      }}
    />
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard"     element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
      <Route path="/applications"  element={<ProtectedRoute><Navbar /><Applications /></ProtectedRoute>} />
      <Route path="/kanban"        element={<ProtectedRoute><Navbar /><Kanban /></ProtectedRoute>} />
      <Route path="/analytics"     element={<ProtectedRoute><Navbar /><Analytics /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <ErrorBoundary>
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  </ErrorBoundary>
);

export default App;
