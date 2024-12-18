import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isDeclining, setIsDeclining] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayCount(pageSize);
  }, [appointments, status, pageSize]);

  const visibleAppointments = useMemo(() => {
    return appointments.slice(0, displayCount);
  }, [appointments, displayCount]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getClientName = (appointment: Appointment) => {
    const user = appointment.user_ || {};
    return {
      fullName: `${user.firstName || 'Unknown'} ${user.lastName || ''}`,
      phone: user.phoneNumber || 'No phone'
    };
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
    return <div className="text-center py-4 text-zinc-400">Loading appointments...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-rose-500">{error}</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-8">
        <div className="text-center">
          {status === 'pending' ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Pending Appointments</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                There are currently no appointments waiting for approval. New appointments will appear here when clients make bookings.
              </p>
            </>
          ) : status === 'accepted' ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-500 mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Confirmed Appointments</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                There are no confirmed appointments yet. Appointments will appear here after you approve them from the pending list.
              </p>
            </>
          ) : status === 'cancelled' ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 mb-4">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Cancelled Appointments</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                There are no cancelled appointments. Appointments that are cancelled will appear here.
              </p>
            </>
          ) : status === 'completed' ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-500 mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Completed Appointments</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                There are no completed appointments. Appointments that are completed will appear here.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mb-4">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Declined Appointments</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                There are no declined appointments. Appointments that you decline will appear here.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl overflow-hidden">
      {/* Desktop View - Hidden on mobile */}
      <div className="hidden md:block">
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
              <tr className="border-b border-zinc-700">
                <th className="text-left p-4 text-zinc-400 font-medium">Client</th>
                <th className="text-left p-4 text-zinc-400 font-medium">Phone</th>
                <th className="text-left p-4 text-zinc-400 font-medium">Duration</th>
                <th className="text-left p-4 text-zinc-400 font-medium">Date & Time</th>
                <th className="text-left p-4 text-zinc-400 font-medium">Price</th>
                <th className="text-left p-4 text-zinc-400 font-medium">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {visibleAppointments.map((appointment, index) => {
                const client = getClientName(appointment);
                return (
                  <motion.tr 
                    key={appointment.id}
                    variants={itemVariants}
                    className="border-b border-zinc-700/50 hover:bg-zinc-700/20"
                  >
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
                              {isUpdating === appointment.id ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleDecline(appointment.id)}
                              disabled={isDeclining === appointment.id}
                              className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                            >
                              {isDeclining === appointment.id ? 'Declining...' : 'Decline'}
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
                              {isCompleting === appointment.id ? 'Completing...' : 'Complete'}
                            </button>
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              disabled={isCancelling === appointment.id}
                              className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                            >
                              {isCancelling === appointment.id ? 'Cancelling...' : 'Cancel'}
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
            return (
              <motion.div
                key={appointment.id}
                variants={itemVariants}
                className="p-4 space-y-4"
              >
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
                          {isUpdating === appointment.id ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleDecline(appointment.id)}
                          disabled={isDeclining === appointment.id}
                          className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                        >
                          {isDeclining === appointment.id ? '...' : 'Decline'}
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
                          {isCompleting === appointment.id ? '...' : 'Complete'}
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={isCancelling === appointment.id}
                          className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                        >
                          {isCancelling === appointment.id ? '...' : 'Cancel'}
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
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}