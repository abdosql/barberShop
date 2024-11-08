import React from 'react';
import { CheckCircle, XCircle, Clock, Calendar, DollarSign } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  services: string[];
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
  totalPrice: number;
}

interface AppointmentListProps {
  status: 'pending' | 'accepted';
}

export default function AppointmentList({ status }: AppointmentListProps) {
  const appointments: Appointment[] = [
    {
      id: '1',
      clientName: 'John Doe',
      services: ['Haircut', 'Beard Trim'],
      date: '2024-02-20',
      time: '10:00',
      status: 'pending',
      totalPrice: 50
    },
    // Add more mock appointments...
  ];

  const filteredAppointments = appointments.filter(apt => apt.status === status);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl overflow-hidden">
      {/* Desktop View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-4 text-zinc-400 font-medium">Client</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Services</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Date & Time</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Price</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr 
                key={appointment.id}
                className="border-b border-zinc-700/50 hover:bg-zinc-700/20"
              >
                <td className="p-4 text-white">{appointment.clientName}</td>
                <td className="p-4 text-white">{appointment.services.join(', ')}</td>
                <td className="p-4 text-white">
                  {formatDate(appointment.date)} at {appointment.time}
                </td>
                <td className="p-4 text-white">{appointment.totalPrice} DH</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {status === 'pending' && (
                      <>
                        <button 
                          className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          title="Accept"
                        >
                          <CheckCircle className="w-5 h-5" />
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Hidden on desktop */}
      <div className="md:hidden">
        {filteredAppointments.map((appointment) => (
          <div 
            key={appointment.id}
            className="p-4 border-b border-zinc-700/50 hover:bg-zinc-700/20"
          >
            {/* Client Name */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-white font-medium">{appointment.clientName}</h3>
              <div className="flex gap-2">
                {status === 'pending' && (
                  <>
                    <button 
                      className="p-1.5 rounded-lg bg-green-500/10 text-green-500"
                      title="Accept"
                    >
                      <CheckCircle className="w-4 h-4" />
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

            {/* Services */}
            <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              {appointment.services.join(', ')}
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              {formatDate(appointment.date)} at {appointment.time}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <DollarSign className="w-4 h-4 text-blue-500" />
              {appointment.totalPrice} DH
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 