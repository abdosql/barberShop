import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiCollection, AppointmentService } from '../types/api';

interface AdminStats {
  totalClients: number;
  todayAppointments: number;
  pendingRequests: number;
  monthlyRevenue: number;
  isLoading: boolean;
  error: string | null;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalClients: 0,
    todayAppointments: 0,
    pendingRequests: 0,
    monthlyRevenue: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token'); // Adjust based on your token storage
        
        const [appointmentServicesRes, appointmentsRes, usersRes] = await Promise.all([
          axios.get<ApiCollection<AppointmentService>>('http://localhost:8000/api/appointment_services', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get('http://localhost:8000/api/appointments', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get('http://localhost:8000/api/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        // Calculate monthly revenue from appointment services
        const monthlyRevenue = appointmentServicesRes.data.member.reduce(
          (total, service) => total + (service.price || 0),
          0
        );

        setStats({
          totalClients: usersRes.data.totalItems,
          todayAppointments: appointmentsRes.data.member.filter(
            (apt: any) => new Date(apt.startTime).toDateString() === new Date().toDateString()
          ).length,
          pendingRequests: appointmentsRes.data.member.filter(
            (apt: any) => apt.status === 'pending'
          ).length,
          monthlyRevenue,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch statistics',
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
} 