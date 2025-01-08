import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotFound from '../NotFound';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, userInfo } = useAuth();
  const location = useLocation();

  // Allow public access to home page
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  // Check admin access first, before authentication
  // This ensures unauthorized users see 404 instead of being redirected
  if (requireAdmin && (!isAuthenticated || !userInfo?.roles?.includes('ROLE_ADMIN'))) {
    return <NotFound />;
  }

  // Then check general authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 