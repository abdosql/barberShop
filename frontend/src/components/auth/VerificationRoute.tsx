import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface VerificationRouteProps {
  children: React.ReactNode;
}

export default function VerificationRoute({ children }: VerificationRouteProps) {
  const location = useLocation();
  const userData = location.state?.userData;
  
  // Check if verification session exists and is valid
  const verificationSession = localStorage.getItem('verificationSession');
  const session = verificationSession ? JSON.parse(verificationSession) : null;
  const now = Date.now();
  
  // Verify session validity
  const isValidSession = session && 
    session.phoneNumber === userData?.phoneNumber && 
    session.expiresAt > now;

  // Clear expired session
  if (session && session.expiresAt <= now) {
    localStorage.removeItem('verificationSession');
  }

  if (!userData || !isValidSession) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
} 