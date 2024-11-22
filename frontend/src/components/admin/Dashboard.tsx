import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, Plus, Settings, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import AppointmentList from './AppointmentList';
import StatsCards from './StatsCards';
import AddServiceModal from './AddServiceModal';
import ManageServicesModal from './ManageServicesModal';
import { useAuth } from '../../contexts/AuthContext';

interface Appointment {
  "@id": string;
  "@type": string;
  id: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  totalDuration: number;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
  user_: {
    "@id": string;
    "@type": string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  };
  appointmentServices: string[];
  timeSlots: string[];
}

export default function Dashboard() {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isManageServicesModalOpen, setIsManageServicesModalOpen] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cachedAppointments, setCachedAppointments] = useState<{
    data: Appointment[];
    timestamp: number;
  } | null>(null);
  const CACHE_DURATION = 30000; // 30 seconds cache
  const [isLoading, setIsLoading] = useState(true);

  const { pendingAppointments, acceptedAppointments } = useMemo(() => {
    const appointments = cachedAppointments?.data || [];
    return {
      pendingAppointments: appointments.filter(apt => apt.status === 'pending'),
      acceptedAppointments: appointments.filter(apt => apt.status === 'accepted')
    };
  }, [cachedAppointments]);

  const handleAppointmentAccepted = (acceptedAppointment: Appointment) => {
    setCachedAppointments(current => {
      if (!current) return null;
      const newData = current.data.map(apt => 
        apt.id === acceptedAppointment.id 
          ? { ...apt, status: 'accepted' }
          : apt
      );
      return {
        data: newData,
        timestamp: Date.now()
      };
    });
  };

  const fetchAppointments = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    
    if (!force && cachedAppointments && (now - cachedAppointments.timestamp < CACHE_DURATION)) {
      console.log('Using cached data');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments?page=1`, {
        headers: {
          'Accept': 'application/ld+json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      const sortedAppointments = data.member.sort((a: Appointment, b: Appointment) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      setCachedAppointments({
        data: sortedAppointments,
        timestamp: now
      });
      console.log('Cache updated at:', new Date(now).toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const forceRefresh = () => {
    setIsLoading(true);
    fetchAppointments(true);
  };

  useEffect(() => {
    fetchAppointments();

    const intervalId = setInterval(() => {
      fetchAppointments(true);
    }, CACHE_DURATION);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchAppointments]);

  const handleServiceAdded = () => {
    setIsAddServiceModalOpen(false);
    setIsManageServicesModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {translations.admin.dashboard.title}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsManageServicesModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg 
                       text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              {translations.admin.dashboard.manageServices}
            </button>
            <button
              onClick={() => setIsAddServiceModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-blue-500 hover:bg-blue-400 text-white rounded-lg 
                       text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {translations.admin.dashboard.addService}
            </button>
          </div>
        </div>
        
        <div className="space-y-8 mb-12">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {translations.admin.dashboard.pendingAppointments}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-sm">
                  {pendingAppointments.length} pending
                </span>
                <button
                  onClick={forceRefresh}
                  className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
            <AppointmentList 
              appointments={pendingAppointments}
              status="pending"
              onAppointmentUpdated={handleAppointmentAccepted}
              isLoading={isLoading}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {translations.admin.dashboard.acceptedAppointments}
              </h2>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">
                {acceptedAppointments.length} today
              </span>
            </div>
            <AppointmentList 
              appointments={acceptedAppointments}
              status="accepted"
              onAppointmentUpdated={fetchAppointments}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <StatsCards />
        </div>

        <AddServiceModal 
          isOpen={isAddServiceModalOpen}
          onClose={() => setIsAddServiceModalOpen(false)}
          onServiceAdded={handleServiceAdded}
        />
        <ManageServicesModal
          isOpen={isManageServicesModalOpen}
          onClose={() => setIsManageServicesModalOpen(false)}
        />
      </div>
    </div>
  );
} 