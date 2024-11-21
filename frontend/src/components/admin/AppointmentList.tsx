import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  "@id": string;
  "@type": string;
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
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
  user_: string;
  appointmentServices: string[];
}

interface AppointmentWithUser extends Appointment {
  userDetails?: User;
}

interface AppointmentListProps {
  status: 'pending' | 'accepted';
  onCountChange?: (count: number) => void;
}

export default function AppointmentList({ status, onCountChange }: AppointmentListProps) {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Cache for user details to avoid duplicate requests
  const userCache = useMemo(() => new Map<string, User>(), []);

  const fetchUserDetails = async (userUrl: string) => {
    // Check cache first
    if (userCache.has(userUrl)) {
      return userCache.get(userUrl);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${userUrl}`, {
        headers: {
          'Accept': 'application/ld+json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await response.json();
      // Store in cache
      userCache.set(userUrl, userData);
      return userData;
    } catch (err) {
      console.error('Error fetching user details:', err);
      return null;
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments and users in parallel
      const appointmentsPromise = fetch(`${import.meta.env.VITE_API_URL}/api/appointments?page=1`, {
        headers: {
          'Accept': 'application/ld+json',
          'Authorization': `Bearer ${token}`
        }
      });

      const [appointmentsResponse] = await Promise.all([appointmentsPromise]);

      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await appointmentsResponse.json();
      const filteredAppointments = data.member.filter((apt: Appointment) => apt.status === status);

      // Get unique user URLs
      const uniqueUserUrls = [...new Set(filteredAppointments.map(apt => apt.user_))];

      // Fetch all unique users in parallel
      const userPromises = uniqueUserUrls.map(url => fetchUserDetails(url));
      const users = await Promise.all(userPromises);

      // Create a map of user URLs to user details
      const userMap = new Map(uniqueUserUrls.map((url, index) => [url, users[index]]));

      // Combine appointments with user details
      const appointmentsWithUsers = filteredAppointments.map(appointment => ({
        ...appointment,
        userDetails: userMap.get(appointment.user_)
      }));

      setAppointments(appointmentsWithUsers);
      onCountChange?.(appointmentsWithUsers.length);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced refresh function to prevent too frequent updates
  const debouncedRefresh = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchAppointments();
      }, 300);
    };
  }, []);

  useEffect(() => {
    fetchAppointments();
    return () => {
      // Clear user cache when component unmounts
      userCache.clear();
    };
  }, [status, token]);

  const handleAccept = async (appointmentId: number) => {
    setIsUpdating(appointmentId);
    try {
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
        throw new Error(errorData.message || 'Failed to update appointment');
      }

      // Use debounced refresh
      debouncedRefresh();
    } catch (err) {
      console.error('Error accepting appointment:', err);
      setError('Failed to accept appointment. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time to be more readable
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getClientName = (appointment: AppointmentWithUser) => {
    if (appointment.userDetails) {
      return {
        fullName: `${appointment.userDetails.firstName} ${appointment.userDetails.lastName}`,
        phone: appointment.userDetails.phoneNumber
      };
    }
    return {
      fullName: `Client ${appointment.user_.split('/').pop()}`,
      phone: 'N/A'
    };
  };

  if (isLoading) {
    return <div className="text-center py-4 text-zinc-400">Loading appointments...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-rose-500">{error}</div>;
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl overflow-hidden">
      {/* Desktop View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-4 text-zinc-400 font-medium">Client</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Phone</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Duration</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Date & Time</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Price</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              const client = getClientName(appointment);
              return (
                <tr 
                  key={appointment.id}
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
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {status === 'accepted' && (
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Confirmed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Hidden on desktop */}
      <div className="md:hidden">
        {appointments.map((appointment) => {
          const client = getClientName(appointment);
          return (
            <div 
              key={appointment.id}
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
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {status === 'accepted' && (
                    <span className="text-green-500 flex items-center gap-1 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Confirmed
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
            </div>
          );
        })}
      </div>
    </div>
  );
} 