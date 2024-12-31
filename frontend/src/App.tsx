import React, { useState } from 'react';
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
import SocialLinks from './components/SocialLinks';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/globals.css';

// Create a context for managing the social links modal
export const SocialLinksContext = React.createContext({
  showSocial: false,
  setShowSocial: (show: boolean) => {}
});

function AppContent() {
  const [showSocial, setShowSocial] = useState(false);
  const { isShopOpen, isLoading } = useShopAvailability();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  // Show loading spinner while checking shop status (except for admin routes)
  if (isLoading && !isAdminRoute && !isAuthRoute) {
    return <LoadingSpinner />;
  }

  // Show closed page only for public routes (not admin or auth) when shop is closed
  if (!isShopOpen && !isAdminRoute && !isAuthRoute) {
    return <ShopClosedPage />;
  }

  return (
    <SocialLinksContext.Provider value={{ showSocial, setShowSocial }}>
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
        
        {/* Admin routes - not affected by shop status */}
        <Route path="/admin/*" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Social Links Modal */}
      <SocialLinks 
        isOpen={showSocial} 
        onClose={() => setShowSocial(false)} 
      />
    </SocialLinksContext.Provider>
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