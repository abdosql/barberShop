import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, Plus, Settings, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import AppointmentList from './AppointmentList';
import StatsCards from './StatsCards';
import AddServiceModal from './AddServiceModal';
import ManageServicesModal from './ManageServicesModal';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

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

type NotificationType = 'success' | 'error';

export default function Dashboard() {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isManageServicesModalOpen, setIsManageServicesModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    show: boolean;
  }>({
    message: '',
    type: 'success',
    show: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cachedAppointments, setCachedAppointments] = useState<{
    data: Appointment[];
    timestamp: number;
  } | null>(() => {
    // Try to get cached data from localStorage on initial load
    const cached = localStorage.getItem('appointmentsCache');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      // Check if cache is still valid (24 hours)
      if (Date.now() - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
        return parsedCache;
      }
    }
    return null;
  });
  const [confirmedViewMode, setConfirmedViewMode] = useState<'accepted' | 'declined'>('accepted');

  const { pendingAppointments, confirmedAppointments, declinedAppointments } = useMemo(() => {
    const appointments = cachedAppointments?.data || [];
    return {
      pendingAppointments: appointments.filter(apt => apt.status === 'pending'),
      confirmedAppointments: appointments.filter(apt => apt.status === 'accepted'),
      declinedAppointments: appointments.filter(apt => apt.status === 'declined')
    };
  }, [cachedAppointments]);

  const showNotification = (message: string, type: NotificationType = 'success') => {
    setNotification({
      message,
      type,
      show: true
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleAppointmentAccepted = (acceptedAppointment: Appointment) => {
    setCachedAppointments(current => {
      if (!current) return null;
      const newData = current.data.map(apt => 
        apt.id === acceptedAppointment.id 
          ? { ...apt, status: 'accepted' }
          : apt
      );
      
      const newCache = {
        data: newData,
        timestamp: Date.now()
      };

      localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
      
      const clientName = `${acceptedAppointment.user_.firstName} ${acceptedAppointment.user_.lastName}`;
      showNotification(`Appointment for ${clientName} has been confirmed successfully.`, 'success');

      return newCache;
    });
  };

  const handleAppointmentDeclined = (declinedAppointment: Appointment) => {
    setCachedAppointments(current => {
      if (!current) return null;
      const newData = current.data.map(apt => 
        apt.id === declinedAppointment.id 
          ? { ...apt, status: 'declined' }
          : apt
      );
      
      const newCache = {
        data: newData,
        timestamp: Date.now()
      };

      localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
      
      const clientName = `${declinedAppointment.user_.firstName} ${declinedAppointment.user_.lastName}`;
      showNotification(`Appointment for ${clientName} has been declined.`, 'error');

      return newCache;
    });
  };

  const fetchAppointments = async (force: boolean = false) => {
    // If we have cached data and not forcing refresh, use cache
    if (!force && cachedAppointments) {
      console.log('Using cached data from localStorage');
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
      // Sort appointments by date and time
      const sortedAppointments = data.member.sort((a: Appointment, b: Appointment) => {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        return dateA.getTime() - dateB.getTime(); // This will sort from earliest to latest
      });
      
      const newCache = {
        data: sortedAppointments,
        timestamp: Date.now()
      };

      // Save to localStorage and state
      localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
      setCachedAppointments(newCache);
      console.log('Cache updated and saved to localStorage at:', new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update forceRefresh function with the same sorting logic
  const forceRefresh = async () => {
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
      // Sort appointments by date and time
      const sortedAppointments = data.member.sort((a: Appointment, b: Appointment) => {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        return dateA.getTime() - dateB.getTime(); // This will sort from earliest to latest
      });
      
      const newCache = {
        data: sortedAppointments,
        timestamp: Date.now()
      };

      // Update localStorage with fresh data
      localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
      setCachedAppointments(newCache);
      
      showNotification('Appointments refreshed successfully', 'success');
      console.log('Cache forcefully updated at:', new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error refreshing appointments:', err);
      showNotification('Failed to refresh appointments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch only if no cache exists
  useEffect(() => {
    if (!cachedAppointments) {
      fetchAppointments();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const handleServiceAdded = () => {
    setIsAddServiceModalOpen(false);
    setIsManageServicesModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Toast Notification */}
      {notification.show && (
        <div 
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg 
                     transform transition-all duration-500 ease-in-out z-50
                     ${notification.type === 'success' 
                       ? 'bg-green-500 text-white' 
                       : 'bg-rose-500 text-white'}`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
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
                onAppointmentUpdated={(appointment) => {
                  if (appointment.status === 'accepted') {
                    handleAppointmentAccepted(appointment);
                  } else if (appointment.status === 'declined') {
                    handleAppointmentDeclined(appointment);
                  }
                }}
                isLoading={isLoading}
                pageSize={5}
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {confirmedViewMode === 'accepted' 
                    ? translations.admin.dashboard.acceptedAppointments
                    : translations.admin.dashboard.declinedAppointments}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-zinc-800/50 rounded-lg p-1">
                    <button
                      onClick={() => setConfirmedViewMode('accepted')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        confirmedViewMode === 'accepted'
                          ? 'bg-blue-500 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Confirmed</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setConfirmedViewMode('declined')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        confirmedViewMode === 'declined'
                          ? 'bg-rose-500 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Declined</span>
                      </div>
                    </button>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    confirmedViewMode === 'accepted' 
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {confirmedViewMode === 'accepted' 
                      ? `${confirmedAppointments.length} confirmed`
                      : `${declinedAppointments.length} declined`}
                  </span>
                </div>
              </div>
              <AppointmentList 
                appointments={confirmedViewMode === 'accepted' ? confirmedAppointments : declinedAppointments}
                status={confirmedViewMode}
                onAppointmentUpdated={(appointment) => {
                  showNotification(
                    `Appointment status updated successfully.`,
                    appointment.status === 'accepted' ? 'success' : 'error'
                  );
                  fetchAppointments(true);
                }}
                isLoading={isLoading}
                pageSize={5}
              />
            </div>
          </motion.div>
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
      </motion.div>
    </div>
  );
} 