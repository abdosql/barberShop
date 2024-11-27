// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Centralized API endpoints
export const API_ENDPOINTS = {
  SERVICES: `${API_BASE_URL}/api/services`,
  APPOINTMENTS: `${API_BASE_URL}/api/appointments`,
  TIME_SLOTS: `${API_BASE_URL}/api/time_slots`,
  AUTH: `${API_BASE_URL}/api/auth`,
  USERS: `${API_BASE_URL}/api/users`,
  // Add other endpoints as needed
} as const; 