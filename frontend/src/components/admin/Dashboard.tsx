import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import PendingAppointments from './PendingAppointments';
import AppointmentTabs from './AppointmentTabs';
import StatsCards from './StatsCards';
import AddServiceModal from './AddServiceModal';
import ManageServicesModal from './ManageServicesModal';
import Pagination from './Pagination';
import { Appointment } from '../../types/appointment';
import { useLanguage } from '../../contexts/LanguageContext';

type NotificationType = 'success' | 'error';

interface NotificationMessage {
  message: string;
  type: NotificationType;
  show: boolean;
}

interface ApiResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  totalItems: number;
  member: Appointment[];
  view?: {
    "@id": string;
    "@type": string;
    first: string;
    last: string;
    previous?: string;
    next?: string;
  };
}

interface CacheData {
  data: Appointment[];
  totalItems: number;
  timestamp: number;
  currentPage: number;
}

export default function Dashboard() {
  const { token } = useAuth();
  const { translations } = useLanguage();
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    const cached = localStorage.getItem('appointmentsCache');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
        return parsedCache.currentPage || 1;
      }
    }
    return 1;
  });

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isManageServicesModalOpen, setIsManageServicesModalOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationMessage>({
    message: '',
    type: 'success',
    show: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cachedAppointments, setCachedAppointments] = useState<CacheData | null>(() => {
    const cached = localStorage.getItem('appointmentsCache');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
        setTotalItems(parsedCache.totalItems);
        return parsedCache;
      }
    }
    return null;
  });
  const [confirmedViewMode, setConfirmedViewMode] = useState<'accepted' | 'declined' | 'cancelled' | 'completed'>('accepted');

  const { pendingAppointments, confirmedAppointments, declinedAppointments, cancelledAppointments, completedAppointments } = useMemo(() => {
    const appointments = cachedAppointments?.data || [];
    return {
      pendingAppointments: appointments.filter(apt => apt.status === 'pending'),
      confirmedAppointments: appointments.filter(apt => apt.status === 'accepted'),
      completedAppointments: appointments.filter(apt => apt.status === 'completed'),
      declinedAppointments: appointments.filter(apt => apt.status === 'declined'),
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled')
    };
  }, [cachedAppointments]);

  const fetchAppointments = async (force: boolean = false, page: number = currentPage) => {
    if (!force && cachedAppointments) {
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const formattedDate = today.toISOString().split('T')[0];

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments?page=${page}&startTime[after]=${formattedDate}`,
        {
          headers: {
            'Accept': 'application/ld+json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data: ApiResponse = await response.json();
      
      setTotalItems(data.totalItems);
      
      const newCache: CacheData = {
        data: data.member,
        totalItems: data.totalItems,
        timestamp: Date.now(),
        currentPage: page
      };

      localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
      setCachedAppointments(newCache);
    } catch (err) {
      showNotification(translations.admin.dashboard.notifications.fetchError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newCache = {
      ...cachedAppointments,
      currentPage: page
    };
    localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
    fetchAppointments(true, page);
  };

  useEffect(() => {
    if (!cachedAppointments) {
      fetchAppointments(false, Math.ceil(totalItems / itemsPerPage));
    } else {
      setIsLoading(false);
    }

    // Subscribe to Mercure for real-time appointment updates
    const mercureUrl = import.meta.env.VITE_MERCURE_PUBLIC_URL;
    
    if (!mercureUrl) {
      console.error('VITE_MERCURE_PUBLIC_URL is not defined in environment variables');
      return;
    }

    try {
      const url = new URL(mercureUrl);
      url.searchParams.append('topic', 'appointment');

      const eventSource = new EventSource(url, { withCredentials: true });

      eventSource.onmessage = async (event) => {
        try {
          const update = JSON.parse(event.data);
          
          if (update.action === 'deleted') {
            // Remove the appointment from cache if it was deleted
            setCachedAppointments(current => {
              if (!current) return null;
              
              const newData = current.data.filter(apt => apt.id !== update.id);
              const newCache = {
                data: newData,
                timestamp: Date.now()
              };
              
              localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
              return newCache;
            });
            
            showNotification(translations.admin.dashboard.notifications.appointmentDeleted, 'error');
            return;
          }
          
          // Fetch the full appointment data for created/updated appointments
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${update.id}`, {
            headers: {
              'Accept': 'application/ld+json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch appointment');
          }
          
          const appointmentData = await response.json();
          
          // Update the cached appointments
          setCachedAppointments(current => {
            if (!current) return null;
            
            const appointmentExists = current.data.some(apt => apt.id === update.id);
            
            let newData;
            if (appointmentExists) {
              newData = current.data.map(apt => 
                apt.id === update.id ? appointmentData : apt
              );
            } else {
              newData = [...current.data, appointmentData];
            }

            const sortedData = newData.sort((a: Appointment, b: Appointment) => {
              const dateA = new Date(a.startTime);
              const dateB = new Date(b.startTime);
              return dateA.getTime() - dateB.getTime();
            });

            const newCache = {
              data: sortedData,
              timestamp: Date.now()
            };

            localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
            return newCache;
          });

          // Show appropriate notification based on action
          if (update.action === 'created') {
            showNotification(translations.admin.dashboard.notifications.newAppointment, 'success');
          } else if (update.action === 'updated') {
            showNotification(translations.admin.dashboard.notifications.appointmentUpdated, 'success');
          }
        } catch (error) {
          console.error('Error processing Mercure message:', error);
          showNotification(translations.admin.dashboard.notifications.processingError, 'error');
        }
      };

      eventSource.onerror = (error) => {
        console.error('Mercure EventSource error:', error);
        showNotification(translations.admin.dashboard.notifications.realTimeError, 'error');
      };

      // Cleanup function
      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error('Error setting up Mercure connection:', error);
      showNotification(translations.admin.dashboard.notifications.realTimeError, 'error');
    }
  }, [token]);

  const handleServiceAdded = () => {
    setIsAddServiceModalOpen(false);
    setIsManageServicesModalOpen(true);
  };

  const handleAppointmentUpdated = (appointment: Appointment) => {
    const clientName = `${appointment.user_.firstName} ${appointment.user_.lastName}`;
    let notificationMessage = '';

    // Helper function to get notification message with fallback
    const getNotificationMessage = (translationKey: string, fallbackMessage: string) => {
      const translation = translations.admin?.dashboard?.notifications?.[translationKey];
      if (translation) {
        return translation.replace('{clientName}', clientName);
      }
      return fallbackMessage.replace('{clientName}', clientName);
    };

    switch (appointment.status) {
      case 'accepted':
        notificationMessage = getNotificationMessage(
          'appointmentAccepted',
          'Appointment accepted for {clientName}'
        );
        showNotification(notificationMessage, 'success');
        break;

      case 'completed':
        notificationMessage = getNotificationMessage(
          'appointmentCompleted',
          'Appointment completed for {clientName}'
        );
        showNotification(notificationMessage, 'success');
        break;

      case 'declined':
        notificationMessage = getNotificationMessage(
          'appointmentDeclined',
          'Appointment declined for {clientName}'
        );
        showNotification(notificationMessage, 'error');
        break;

      case 'cancelled':
        notificationMessage = getNotificationMessage(
          'appointmentCancelled',
          'Appointment cancelled for {clientName}'
        );
        showNotification(notificationMessage, 'error');
        break;
    }

    // Update the cache
    setCachedAppointments(current => {
      if (!current) return null;
      
      const newData = current.data.map(apt => 
        apt.id === appointment.id ? appointment : apt
      );
      
      const newCache = {
        data: newData,
        timestamp: Date.now()
      };

      localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
      return newCache;
    });
  };

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
      showNotification(translations.admin.dashboard.notifications.appointmentConfirmed, 'success');

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
      showNotification(translations.admin.dashboard.notifications.appointmentDeclined, 'error');

      return newCache;
    });
  };

  const handleAppointmentCancelled = (cancelledAppointment: Appointment) => {
    setCachedAppointments(current => {
      if (!current) return null;
      const newData = current.data.map(apt => 
        apt.id === cancelledAppointment.id 
          ? { ...apt, status: 'cancelled' }
          : apt
      );
      
      const newCache = {
        data: newData,
        timestamp: Date.now()
      };

      localStorage.setItem('appointmentsCache', JSON.stringify(newCache));
      
      const clientName = `${cancelledAppointment.user_.firstName} ${cancelledAppointment.user_.lastName}`;
      showNotification(translations.admin.dashboard.notifications.appointmentCancelled, 'error');

      return newCache;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {notification.show && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50
            ${notification.type === 'success' 
              ? 'bg-green-500/90 backdrop-blur-sm border border-green-400/20' 
              : 'bg-rose-500/90 backdrop-blur-sm border border-rose-400/20'}`}
        >
          <div className="flex items-center gap-2 text-white">
            {notification.type === 'success' ? (
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <DashboardHeader 
          onManageServices={() => setIsManageServicesModalOpen(true)}
          onAddService={() => setIsAddServiceModalOpen(true)}
        />
        
        <div className="space-y-8 mb-12">
          <div>
            <PendingAppointments
              appointments={pendingAppointments}
              onAppointmentUpdated={handleAppointmentUpdated}
              onRefresh={() => fetchAppointments(true, currentPage)}
              isLoading={isLoading}
            />
            {totalItems > itemsPerPage && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
          
          <div>
            <AppointmentTabs
              confirmedViewMode={confirmedViewMode}
              setConfirmedViewMode={setConfirmedViewMode}
              confirmedAppointments={confirmedAppointments}
              declinedAppointments={declinedAppointments}
              cancelledAppointments={cancelledAppointments}
              completedAppointments={completedAppointments}
              onAppointmentUpdated={handleAppointmentUpdated}
              isLoading={isLoading}
            />
            {(confirmedViewMode === 'accepted' && confirmedAppointments.length > itemsPerPage) && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            )}
            {(confirmedViewMode === 'declined' && declinedAppointments.length > itemsPerPage) && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            )}
            {(confirmedViewMode === 'cancelled' && cancelledAppointments.length > itemsPerPage) && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            )}
            {(confirmedViewMode === 'completed' && completedAppointments.length > itemsPerPage) && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-white mb-4">
            {translations.admin.dashboard.overview}
          </h2>
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