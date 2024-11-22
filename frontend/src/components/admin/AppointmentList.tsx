import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  status: 'pending' | 'accepted';
  onAppointmentUpdated: (appointment: Appointment) => void;
  isLoading: boolean;
}

export default function AppointmentList({ 
  appointments, 
  status, 
  onAppointmentUpdated,
  isLoading 
}: AppointmentListProps) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

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

      const updatedAppointment = await response.json();
      onAppointmentUpdated(updatedAppointment);
    } catch (err) {
      console.error('Error accepting appointment:', err);
      setError('Failed to accept appointment. Please try again.');
    } finally {
      setIsUpdating(null);
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
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-500 mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Accepted Appointments</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                There are no accepted appointments yet. Appointments will appear here after you approve them from the pending list.
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