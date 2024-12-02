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
  status: 'pending' | 'accepted' | 'rejected';
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
  status: 'pending' | 'accepted' | 'declined';
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

      // Update UI
      onAppointmentUpdated(updatedAppointment);
    } catch (err) {
      console.error('Error accepting appointment:', err);
      setError('Failed to accept appointment. Please try again.');
    } finally {
      setIsUpdating(null);
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
    return {
      fullName: `${appointment.user_.firstName} ${appointment.user_.lastName}`,
      phone: appointment.user_.phoneNumber
    };
  };

  // Update the animation variants
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
                    <td className="p-4 text-white">{client.fullName}</td>
                    <td className="p-4 text-zinc-400">{client.phone}</td>
                    <td className="p-4 text-white">{appointment.totalDuration} min</td>
                    <td className="p-4 text-white">
                      {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                    </td>
                    <td className="p-4 text-white">{appointment.totalPrice} DH</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAccept(appointment.id)}
                              disabled={isUpdating === appointment.id}
                              className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Accept"
                            >
                              {isUpdating === appointment.id ? (
                                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleDecline(appointment.id)}
                              disabled={isDeclining === appointment.id}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Decline"
                            >
                              {isDeclining === appointment.id ? (
                                <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <XCircle className="w-5 h-5" />
                              )}
                            </button>
                          </>
                        )}
                        {status === 'accepted' && (
                          <span className="text-green-500 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Confirmed
                          </span>
                        )}
                        {status === 'declined' && (
                          <span className="text-rose-500 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Declined
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>

          {/* Load More Trigger */}
          {displayCount < appointments.length && (
            <div 
              className="py-4 text-center border-t border-zinc-700/50"
            >
              {isLoadingMore ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-2 text-zinc-400 text-sm"
                >
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  Loading more...
                </motion.div>
              ) : (
                <button
                  onClick={handleLoadMore}
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  Load more ({Math.min(5, appointments.length - displayCount)} items)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile View - Hidden on desktop */}
      <div className="md:hidden">
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {visibleAppointments.map((appointment, index) => {
              const client = getClientName(appointment);
              return (
                <motion.div 
                  key={appointment.id}
                  variants={itemVariants}
                  className="p-4 border-b border-zinc-700/50 hover:bg-zinc-700/20"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-medium">{client.fullName}</h3>
                      <p className="text-sm text-zinc-400">{client.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      {status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleAccept(appointment.id)}
                            disabled={isUpdating === appointment.id}
                            className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Accept"
                          >
                            {isUpdating === appointment.id ? (
                              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleDecline(appointment.id)}
                            disabled={isDeclining === appointment.id}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Decline"
                          >
                            {isDeclining === appointment.id ? (
                              <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                      {status === 'accepted' && (
                        <span className="text-green-500 flex items-center gap-1 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Confirmed
                        </span>
                      )}
                      {status === 'declined' && (
                        <span className="text-rose-500 flex items-center gap-1 text-sm">
                          <XCircle className="w-4 h-4" />
                          Declined
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {appointment.totalDuration} minutes
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    {appointment.totalPrice} DH
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Load More Trigger for Mobile */}
          {displayCount < appointments.length && (
            <div 
              className="py-4 text-center border-t border-zinc-700/50"
            >
              {isLoadingMore ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-2 text-zinc-400 text-sm"
                >
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  Loading more...
                </motion.div>
              ) : (
                <button
                  onClick={handleLoadMore}
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  Load more ({Math.min(5, appointments.length - displayCount)} items)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 