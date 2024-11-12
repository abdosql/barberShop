import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Add navigation effect when auth state changes
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" /> : <Register />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
} 