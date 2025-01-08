import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Types for our authentication context
interface User {
  "@context": string;
  "@id": string;
  "@type": string;
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: User | null;
  login: (phoneNumber: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  token: string | null;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

interface JWTPayload {
  exp: number;
  username: string;
  roles: string[];
}

interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

interface LoginError {
  code?: string | number;
  message: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('token')
  );
  const [userInfo, setUserInfo] = useState<User | null>(() => {
    // Try to get user info from sessionStorage on initial load
    const savedUserInfo = sessionStorage.getItem('userInfo');
    return savedUserInfo ? JSON.parse(savedUserInfo) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Function to fetch user data from API Platform
  const fetchUserData = async (token: string) => {
    try {
      // First check if we have valid user data in sessionStorage
      const savedUserInfo = sessionStorage.getItem('userInfo');
      if (savedUserInfo) {
        const parsedUserInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedUserInfo);
        return;
      }

      // If no valid cached data, fetch from API
      const response = await fetch(`${API_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/ld+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData: User = await response.json();
      // Store in sessionStorage
      sessionStorage.setItem('userInfo', JSON.stringify(userData));
      setUserInfo(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const login = async (phoneNumber: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.code === 'INACTIVE_ACCOUNT') {
          throw {
            code: 'INACTIVE_ACCOUNT',
            message: data.message
          };
        } else if (response.status === 401) {
          throw {
            code: 401,
            message: 'Invalid credentials'
          };
        }
        throw {
          code: response.status,
          message: data.message || 'Login failed'
        };
      }

      // If login was successful, fetch user data
      const userResponse = await fetch(`${API_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Accept': 'application/ld+json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData: User = await userResponse.json();

      // Check if user is active
      if (!userData.isActive) {
        throw {
          code: 'INACTIVE_ACCOUNT',
          message: 'Account is not active. Please verify your account.'
        };
      }

      // Store credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          phoneNumber,
          lastLogin: new Date().toISOString()
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      // If everything is OK, set the authentication state
      localStorage.setItem('token', data.token);
      sessionStorage.setItem('userInfo', JSON.stringify(userData));
      setToken(data.token);
      setUserInfo(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      // Clean up any partial authentication state
      localStorage.removeItem('token');
      localStorage.removeItem('rememberedUser');
      sessionStorage.removeItem('userInfo');
      setToken(null);
      setUserInfo(null);
      setIsAuthenticated(false);
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberedUser');
    sessionStorage.removeItem('userInfo'); // Clear user info from sessionStorage
    setToken(null);
    setUserInfo(null);
    setIsAuthenticated(false);
  };

  // Function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Effect to validate token and fetch user data on mount/token change
  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        return;
      }

      setIsAuthenticated(true);
      
      // Only fetch user data if we don't have it in state
      if (!userInfo) {
        fetchUserData(token);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [token]);

  // Effect to update sessionStorage when userInfo changes
  useEffect(() => {
    if (userInfo) {
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  const value = {
    isAuthenticated,
    userInfo,
    login,
    logout,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 