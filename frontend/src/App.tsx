import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ShopAvailabilityProvider, useShopAvailability } from './contexts/ShopAvailabilityContext';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ShopClosedPage from './components/ShopClosedPage';

function AppContent() {
  const { isShopOpen } = useShopAvailability();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  // Show closed page only for public routes when shop is closed
  if (!isShopOpen && !isAdminRoute && !isAuthRoute) {
    return <ShopClosedPage />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <ShopAvailabilityProvider>
                <AppContent />
              </ShopAvailabilityProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;