import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, userInfo } = useAuth();
  const location = useLocation();

  if (location.pathname === '/') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !userInfo?.roles.includes('ROLE_ADMIN')) {
    // Redirect non-admin users to home page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 