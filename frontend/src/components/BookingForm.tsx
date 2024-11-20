import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ServiceCard from './ServiceCard';
import SocialLinks from './SocialLinks';
import { useAuth } from '../contexts/AuthContext';

interface Service {
  "@id": string;
  "@type": string;
  id: number;
  name: string;
  price: string;
  description: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlot {
  "@id": string;
  "@type": string;
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BookingFormProps {
  readOnly?: boolean;
}

export default function BookingForm({ readOnly = false }: BookingFormProps) {
  const { translations } = useLanguage();
  const { token, user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showSocial, setShowSocial] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services?page=1`, {
          headers: {
            'Accept': 'application/ld+json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const data = await response.json();
        setServices(data.member);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [token]);

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId.toString())
        ? prev.filter(id => id !== serviceId.toString())
        : [...prev, serviceId.toString()]
    );
  };

  const { totalPrice, totalDuration } = useMemo(() => {
    return selectedServices.reduce(
      (acc, serviceId) => {
        const service = services.find(s => s.id.toString() === serviceId);
        if (service) {
          return {
            totalPrice: acc.totalPrice + Number(service.price),
            totalDuration: acc.totalDuration + service.duration
          };
        }
        return acc;
      },
      { totalPrice: 0, totalDuration: 0 }
    );
  }, [selectedServices, services]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}H`;
    }
    return `${hours}H:${remainingMinutes}min`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !date || !time || selectedServices.length === 0) {
      return;
    }

    if (e.type !== 'submit') {
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate start and end times based on selected date and time
      const [hours, minutes] = time.split(':').map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + totalDuration);

      // First create the time slot
      const timeSlotResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/time_slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          date: date, // Use selected date
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          available: false,
        }),
      });

      if (!timeSlotResponse.ok) {
        const errorData = await timeSlotResponse.json();
        throw new Error(errorData.message || 'Failed to create time slot');
      }

      const timeSlot = await timeSlotResponse.json();

      // Then create the appointment with the time slot reference
      const appointmentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          status: 'pending',
          totalDuration,
          totalPrice: totalPrice.toString(),
          user_: `/api/users/${user.id}`,
          timeSlot: timeSlot['@id'],
          services: selectedServices.map(id => `/api/services/${id}`),
        }),
      });

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json();
        // If appointment creation fails, we should probably delete the time slot
        // You might want to add this cleanup logic
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      // Success! Reset form
      setSelectedServices([]);
      setTime('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowSocial(true);

    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine grid columns based on service count
  const getGridClass = (serviceCount: number) => {
    if (serviceCount <= 2) return "grid grid-cols-1 gap-3 max-w-md mx-auto";
    if (serviceCount <= 4) return "grid grid-cols-1 sm:grid-cols-2 gap-3";
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"; // For 5 or more services
  };

  if (isLoading) {
    return <div className="text-center text-zinc-400">Loading services...</div>;
  }

  if (error) {
    return <div className="text-center text-rose-500">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-4 text-white">
            {translations.home.booking.selectServices}
          </label>
          <div className={getGridClass(services.length)}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                price={Number(service.price)}
                duration={service.duration}
                icon={Scissors}
                isSelected={selectedServices.includes(service.id.toString())}
                onClick={() => toggleService(service.id)}
              />
            ))}
          </div>
          
          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">{translations.home.booking.totalDuration}:</span>
                <span className="font-medium text-blue-500">{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">{translations.home.booking.totalPrice}:</span>
                <span className="font-medium text-blue-500">{totalPrice} DH</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            {translations.home.booking.selectDate}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            {translations.home.booking.selectTime}
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
            >
              <option value="">Choose a time</option>
              <option value="09:00">9:00 AM ({formatDuration(totalDuration)})</option>
              <option value="10:00">10:00 AM ({formatDuration(totalDuration)})</option>
              <option value="11:00">11:00 AM ({formatDuration(totalDuration)})</option>
              <option value="12:00">12:00 PM ({formatDuration(totalDuration)})</option>
              <option value="13:00">1:00 PM ({formatDuration(totalDuration)})</option>
              <option value="14:00">2:00 PM ({formatDuration(totalDuration)})</option>
              <option value="15:00">3:00 PM ({formatDuration(totalDuration)})</option>
              <option value="16:00">4:00 PM ({formatDuration(totalDuration)})</option>
            </select>
          </div>
        </div>

        {!readOnly && (
          <button
            disabled={selectedServices.length === 0 || !date || !time || isSubmitting}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-400 
                     transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Booking...
              </span>
            ) : (
              <>
                <User className="h-5 w-5" />
                {translations.home.booking.bookAppointment}
              </>
            )}
          </button>
        )}
      </div>

      <SocialLinks 
        isOpen={showSocial} 
        onClose={() => setShowSocial(false)} 
      />
    </form>
  );
}