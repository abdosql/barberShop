import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface User {
  "@id": string;
  "@type": string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

interface Appointment {
  "@id": string;
  "@type": string;
  id: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected' | 'cancelled';
  totalDuration: number;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
  user_: User;
  appointmentServices: string[];
  timeSlots: string[];
}

interface AppointmentContextType {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  refreshAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/api`;
const MERCURE_URL = import.meta.env.VITE_MERCURE_PUBLIC_URL;

export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    console.log('Fetching appointments with token:', token ? 'present' : 'missing');
    if (!token) {
      setError('No authentication token available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Making API request to:', `${API_URL}/appointments`);
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: {
          'Accept': 'application/ld+json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Response:', response.data);
      if (response.data.member && Array.isArray(response.data.member)) {
        console.log('Setting appointments:', response.data.member.length);
        setAppointments(response.data.member);
        setError(null);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('AppointmentProvider useEffect running with token:', token ? 'present' : 'missing');
    if (token) {
      fetchAppointments();

      // Subscribe to Mercure hub for appointment updates
      const url = new URL(MERCURE_URL);
      url.searchParams.append('topic', 'appointment');
      console.log('Connecting to Mercure hub:', url.toString());

      const eventSource = new EventSource(url, {
        withCredentials: false
      });

      eventSource.onmessage = (event) => {
        console.log('Received Mercure update:', event.data);
        const data = JSON.parse(event.data);
        
        setAppointments(prevAppointments => {
          console.log('Updating appointments with new data:', data);
          const updatedAppointments = [...prevAppointments];
          const index = updatedAppointments.findIndex(apt => apt.id === data.id);
          
          if (index !== -1) {
            updatedAppointments[index] = data;
          } else if (data.status) {
            updatedAppointments.push(data);
          }
          
          return updatedAppointments.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
      };

      return () => {
        console.log('Cleaning up EventSource');
        eventSource.close();
      };
    }
  }, [token]);

  const contextValue = {
    appointments,
    isLoading,
    error,
    refreshAppointments: fetchAppointments
  };

  console.log('AppointmentProvider rendering with:', {
    appointmentsCount: appointments.length,
    isLoading,
    error
  });

  return (
    <AppointmentContext.Provider value={contextValue}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}
