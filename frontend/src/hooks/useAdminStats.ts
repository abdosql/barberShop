import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiCollection, AppointmentService } from '../types/api';
import { useHistoricalStats } from './useHistoricalStats';
import { StatsMetrics } from '../types/stats';

interface AdminStats {
  totalClients: StatsMetrics;
  todayAppointments: StatsMetrics;
  pendingRequests: StatsMetrics;
  monthlyRevenue: StatsMetrics;
  isLoading: boolean;
  error: string | null;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalClients: { current: 0, change: { percentageChange: '0%', trend: 'neutral', value: 0 }, isLoading: true },
    todayAppointments: { current: 0, change: { percentageChange: '0%', trend: 'neutral', value: 0 }, isLoading: true },
    pendingRequests: { current: 0, change: { percentageChange: '0%', trend: 'neutral', value: 0 }, isLoading: true },
    monthlyRevenue: { current: 0, change: { percentageChange: '0%', trend: 'neutral', value: 0 }, isLoading: true },
    isLoading: true,
    error: null,
  });

  const { calculateChange, isLoading: isHistoricalLoading } = useHistoricalStats();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [appointmentServicesRes, appointmentsRes, usersRes] = await Promise.all([
          axios.get<ApiCollection<AppointmentService>>('http://localhost:8000/api/appointment_services', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:8000/api/appointments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:8000/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const totalClients = usersRes.data.totalItems;
        const todayAppointments = appointmentsRes.data.member.filter(
          (apt: any) => new Date(apt.startTime).toDateString() === new Date().toDateString()
        ).length;
        const pendingRequests = appointmentsRes.data.member.filter(
          (apt: any) => apt.status === 'pending'
        ).length;
        const monthlyRevenue = appointmentServicesRes.data.member.reduce(
          (total: number, service: AppointmentService) => total + (service.price || 0),
          0
        );

        setStats({
          totalClients: {
            current: totalClients,
            change: calculateChange(totalClients, 'totalClients'),
            isLoading: false,
          },
          todayAppointments: {
            current: todayAppointments,
            change: calculateChange(todayAppointments, 'todayAppointments'),
            isLoading: false,
          },
          pendingRequests: {
            current: pendingRequests,
            change: calculateChange(pendingRequests, 'pendingRequests'),
            isLoading: false,
          },
          monthlyRevenue: {
            current: monthlyRevenue,
            change: calculateChange(monthlyRevenue, 'monthlyRevenue'),
            isLoading: false,
          },
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
  }, [calculateChange]);

  return {
    ...stats,
    isLoading: stats.isLoading || isHistoricalLoading,
  };
} 