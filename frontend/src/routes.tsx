import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Register />
      } />

      {/* Protected routes */}
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

      {/* Catch all route - redirect to login if not authenticated, home if authenticated */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
} 