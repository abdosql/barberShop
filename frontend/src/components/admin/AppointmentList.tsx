import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, DollarSign, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Appointment } from '../../types/appointment';
import { ServicesModal } from './services/ServicesModal';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import { getClientName, getUrgencyIndicator } from '../../utils/appointmentUtils';
import { useLanguage } from '../../contexts/LanguageContext';

interface AppointmentListProps {
  appointments: Appointment[];
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'cancelled';
  onAppointmentUpdated: (appointment: Appointment) => void;
  isLoading: boolean;
  pageSize?: number;
}

export default function AppointmentList({ 
  appointments, 
  status, 
  onAppointmentUpdated,
  isLoading,
  pageSize = 5
}: AppointmentListProps) {
  const { token } = useAuth();
  const { translations } = useLanguage();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isDeclining, setIsDeclining] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  // Filter appointments based on the toggle state for accepted appointments
  const filteredAppointments = status === 'accepted' && showTodayOnly
    ? appointments.filter(appointment => isToday(appointment.startTime))
    : appointments;

  const visibleAppointments = filteredAppointments.slice(0, displayCount);

  useEffect(() => {
    setDisplayCount(pageSize);
  }, [appointments, status, pageSize]);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 5, appointments.length));
      setIsLoadingMore(false);
    }, 500);
  };

  const handleAccept = async (appointmentId: number) => {
    setIsUpdating(appointmentId);
    try {
      console.log('Starting appointment acceptance...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          status: 'accepted'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData?.['hydra:description'] || 'Failed to update appointment');
      }

      const updatedAppointment = await response.json();
      console.log('Appointment updated successfully:', updatedAppointment);

      onAppointmentUpdated(updatedAppointment);
    } catch (err) {
      console.error('Error accepting appointment:', err);
      setError('Failed to accept appointment. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleComplete = async (appointmentId: number) => {
    setIsCompleting(appointmentId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          status: 'completed'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData?.['hydra:description'] || 'Failed to complete appointment');
      }

      const updatedAppointment = await response.json();
      onAppointmentUpdated(updatedAppointment);
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to complete appointment. Please try again.');
    } finally {
      setIsCompleting(null);
    }
  };

  const handleDecline = async (appointmentId: number) => {
    setIsDeclining(appointmentId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          status: 'declined'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData?.['hydra:description'] || 'Failed to update appointment');
      }

      const updatedAppointment = await response.json();
      onAppointmentUpdated(updatedAppointment);
    } catch (err) {
      console.error('Error declining appointment:', err);
      setError('Failed to decline appointment. Please try again.');
    } finally {
      setIsDeclining(null);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    setIsCancelling(appointmentId);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData?.['hydra:description'] || 'Failed to cancel appointment');
      }

      const updatedAppointment = await response.json();
      onAppointmentUpdated(updatedAppointment);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment. Please try again.');
    } finally {
      setIsCancelling(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
    },
    show: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-zinc-400">{translations.admin.appointments.loading}</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-rose-500">{error}</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">
            {translations.admin.appointments.emptyStates.title[status]}
          </h3>
          <p className="text-zinc-400 max-w-sm mx-auto">
            {translations.admin.appointments.emptyStates.description[status]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl overflow-hidden">
        {/* Table Title - Mobile Only */}
        <div className="md:hidden text-lg font-medium text-white p-4 border-b border-zinc-700">
          <div className="flex justify-between items-center">
            <span>
              {status === 'accepted' && translations.admin.dashboard.acceptedAppointments}
              {status === 'completed' && (translations.admin.dashboard.completedAppointments || "Completed")}
              {status === 'declined' && translations.admin.dashboard.declinedAppointments}
              {status === 'cancelled' && translations.admin.dashboard.cancelledAppointments}
            </span>
            {status === 'accepted' && (
              <button
                onClick={() => setShowTodayOnly(!showTodayOnly)}
                className={`ml-4 px-3 py-1 rounded-lg text-sm transition-colors ${
                  showTodayOnly 
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {showTodayOnly ? 'Today' : 'All'}
              </button>
            )}
          </div>
        </div>

        {/* Desktop View - Hidden on mobile */}
        <div className="hidden md:block">
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
            <table className="w-full">
              <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
                <tr className="border-b border-zinc-700">
                  <th className="px-4 py-3 w-8" title="Appointment Priority">•</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">{translations.admin.appointments.table.client}</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">{translations.admin.appointments.table.phone}</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">{translations.admin.appointments.table.duration}</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">{translations.admin.appointments.table.dateTime}</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">{translations.admin.appointments.table.price}</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">
                    <div className="flex items-center justify-between">
                      <span>{translations.admin.appointments.table.actions}</span>
                      {status === 'accepted' && (
                        <button
                          onClick={() => setShowTodayOnly(!showTodayOnly)}
                          className={`ml-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                            showTodayOnly 
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          {showTodayOnly ? translations.admin.appointments.filters.today : translations.admin.appointments.filters.all}
                        </button>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {visibleAppointments.map((appointment, index) => {
                  const client = getClientName(appointment);
                  const isTodayAppointment = isToday(appointment.startTime);
                  const urgency = getUrgencyIndicator(appointment.startTime);
                  
                  return (
                    <motion.tr 
                      key={appointment.id}
                      variants={itemVariants}
                      className="border-b border-zinc-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="relative flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${urgency.color}`} title={urgency.title}>
                            <div className={`absolute w-2 h-2 rounded-full ${urgency.pulseColor} animate-ping`}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{client.fullName}</div>
                      </td>
                      <td className="p-4 text-zinc-300">{client.phone}</td>
                      <td className="p-4 text-zinc-300">{appointment.totalDuration} min</td>
                      <td className="p-4">
                        <div className="text-zinc-300">{formatDate(appointment.startTime)}</div>
                        <div className="text-sm text-zinc-400">{formatTime(appointment.startTime)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-zinc-300">{appointment.totalPrice} DH</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAccept(appointment.id)}
                                disabled={isUpdating === appointment.id}
                                className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              >
                                {isUpdating === appointment.id ? translations.admin.appointments.actions.accepting : translations.admin.appointments.actions.accept}
                              </button>
                              <button
                                onClick={() => handleDecline(appointment.id)}
                                disabled={isDeclining === appointment.id}
                                className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                              >
                                {isDeclining === appointment.id ? translations.admin.appointments.actions.declining : translations.admin.appointments.actions.decline}
                              </button>
                            </>
                          )}
                          {status === 'accepted' && (
                            <>
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                disabled={isCompleting === appointment.id}
                                className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              >
                                {isCompleting === appointment.id ? translations.admin.appointments.actions.completing : translations.admin.appointments.actions.complete}
                              </button>
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                disabled={isCancelling === appointment.id}
                                className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                              >
                                {isCancelling === appointment.id ? translations.admin.appointments.actions.cancelling : translations.admin.appointments.actions.cancel}
                              </button>
                            </>
                          )}
                          {(status === 'completed' || status === 'cancelled' || status === 'declined') && (
                            <span className={`px-3 py-1 rounded-lg ${
                              status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              status === 'cancelled' ? 'bg-orange-500/10 text-orange-500' :
                              'bg-rose-500/10 text-rose-500'
                            }`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                            }}
                            className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </div>

        {/* Mobile View - Hidden on desktop */}
        <div className="md:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-zinc-700/50"
          >
            {visibleAppointments.map((appointment, index) => {
              const client = getClientName(appointment);
              const isTodayAppointment = isToday(appointment.startTime);
              const urgency = getUrgencyIndicator(appointment.startTime);
              
              return (
                <motion.div
                  key={appointment.id}
                  variants={itemVariants}
                  className="relative border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-4"
                >
                  <div className="absolute top-4 left-4">
                    <div className="relative flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${urgency.color}`} title={urgency.title}>
                        <div className={`absolute w-2 h-2 rounded-full ${urgency.pulseColor} animate-ping`}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white">{client.fullName}</div>
                      <div className="text-sm text-zinc-400">{client.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-300">{appointment.totalPrice} DH</div>
                      <div className="text-sm text-zinc-400">{appointment.totalDuration} min</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-zinc-400">
                      <div>{formatDate(appointment.startTime)}</div>
                      <div>{formatTime(appointment.startTime)}</div>
                    </div>
                    <div className="flex gap-2">
                      {status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(appointment.id)}
                            disabled={isUpdating === appointment.id}
                            className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {isUpdating === appointment.id ? translations.admin.appointments.actions.accepting : translations.admin.appointments.actions.accept}
                          </button>
                          <button
                            onClick={() => handleDecline(appointment.id)}
                            disabled={isDeclining === appointment.id}
                            className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                          >
                            {isDeclining === appointment.id ? translations.admin.appointments.actions.declining : translations.admin.appointments.actions.decline}
                          </button>
                        </>
                      )}
                      {status === 'accepted' && (
                        <>
                          <button
                            onClick={() => handleComplete(appointment.id)}
                            disabled={isCompleting === appointment.id}
                            className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {isCompleting === appointment.id ? translations.admin.appointments.actions.completing : translations.admin.appointments.actions.complete}
                          </button>
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            disabled={isCancelling === appointment.id}
                            className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                          >
                            {isCancelling === appointment.id ? translations.admin.appointments.actions.cancelling : translations.admin.appointments.actions.cancel}
                          </button>
                        </>
                      )}
                      {(status === 'completed' || status === 'cancelled' || status === 'declined') && (
                        <span className={`px-3 py-1 rounded-lg ${
                          status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          status === 'cancelled' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-rose-500/10 text-rose-500'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                        }}
                        className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {appointments.length > displayCount && (
          <div 
            ref={loadMoreRef}
            className="p-4 text-center"
          >
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-zinc-700/50 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? translations.admin.appointments.loading : translations.admin.appointments.loadMore}
            </button>
          </div>
        )}
      </div>

      {/* Services Modal - Outside the table container */}
      {selectedAppointment && (
        <ServicesModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </>
  );
}