import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import NotFound from '../NotFound';

interface VerificationRouteProps {
  children: React.ReactNode;
}

export default function VerificationRoute({ children }: VerificationRouteProps) {
  const location = useLocation();
  
  // First check: Prevent direct access without state
  // This ensures users see 404 instead of being redirected
  if (!location.state || !location.state.userData) {
    return <NotFound />;
  }

  const userData = location.state.userData;
  
  // Check if verification session exists and is valid
  const verificationSession = localStorage.getItem('verificationSession');
  const session = verificationSession ? JSON.parse(verificationSession) : null;
  const now = Date.now();
  
  // Verify session validity
  const isValidSession = session && 
    session.phoneNumber === userData.phoneNumber && 
    session.expiresAt > now;

  // Clear expired session
  if (session && session.expiresAt <= now) {
    localStorage.removeItem('verificationSession');
  }

  // If session is invalid, redirect to register
  if (!isValidSession) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
} 