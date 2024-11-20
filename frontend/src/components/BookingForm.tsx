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
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BookingFormProps {
  readOnly?: boolean;
}

interface UserInfo {
  id: number;
  email: string;
  roles: string[];
  // add other fields that exist in your userInfo
}

export default function BookingForm({ readOnly = false }: BookingFormProps) {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showSocial, setShowSocial] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true);

  // Get userInfo from session storage
  const getUserInfo = (): UserInfo | null => {
    const userInfoStr = sessionStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  };

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

  // Add effect to fetch time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoadingTimeSlots(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/time_slots?pagination=false`, {
          headers: {
            'Accept': 'application/ld+json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch time slots');
        }

        const data = await response.json();
        const slots = data['member'] || [];

        // Sort time slots by time only
        const sortedSlots = slots.sort((a: TimeSlot, b: TimeSlot) => {
          const timeA = new Date(a.startTime).getHours() * 60 + new Date(a.startTime).getMinutes();
          const timeB = new Date(b.startTime).getHours() * 60 + new Date(b.startTime).getMinutes();
          return timeA - timeB;
        });

        setTimeSlots(sortedSlots);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to load time slots');
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
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

  // Format time from ISO string to display time (HH:mm)
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !time || selectedServices.length === 0) {
      return;
    }

    if (e.type !== 'submit') {
      return;
    }

    // Get userInfo from session
    const userInfo = getUserInfo();
    if (!userInfo) {
      setError('User information not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the initial selected time slot
      const initialTimeSlot = timeSlots.find(slot => formatTime(slot.startTime) === time);
      
      if (!initialTimeSlot) {
        throw new Error('Selected time slot not found');
      }

      // Calculate how many 30-minute slots we need
      const slotsNeeded = Math.ceil(totalDuration / 30);

      // Find the index of the initial slot
      const initialSlotIndex = timeSlots.findIndex(slot => slot.id === initialTimeSlot.id);
      
      // Get the required consecutive slots
      const requiredSlots = timeSlots.slice(initialSlotIndex, initialSlotIndex + slotsNeeded);

      // Verify we have enough consecutive available slots
      if (requiredSlots.length < slotsNeeded) {
        throw new Error('Not enough consecutive time slots available for this service duration');
      }

      // Check if all required slots are available
      const allSlotsAvailable = requiredSlots.every(slot => slot.isAvailable);
      if (!allSlotsAvailable) {
        throw new Error('Some required time slots are not available');
      }

      const now = new Date().toISOString();

      // Create appointment with all required time slots
      const appointmentBody = {
        startTime: initialTimeSlot.startTime,
        endTime: requiredSlots[requiredSlots.length - 1].endTime,
        status: "pending",
        totalDuration: totalDuration,
        totalPrice: totalPrice.toString(),
        createdAt: now,
        updatedAt: now,
        user_: `${import.meta.env.VITE_API_URL}/api/users/${userInfo.id}`,
        timeSlots: requiredSlots.map(slot => 
          `${import.meta.env.VITE_API_URL}/api/time_slots/${slot.id}`
        )
      };

      console.log('Appointment Request Body:', appointmentBody);

      const appointmentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify(appointmentBody),
      });

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json();
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
              {timeSlots.map((slot) => (
                <option 
                  key={slot.id} 
                  value={formatTime(slot.startTime)}
                  disabled={!slot.isAvailable}
                >
                  {formatTime(slot.startTime)} ({formatDuration(totalDuration)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Show loading state for time slots */}
        {isLoadingTimeSlots && (
          <div className="text-center text-zinc-400">Loading available time slots...</div>
        )}

        {/* Show message when no time slots available */}
        {!isLoadingTimeSlots && timeSlots.length === 0 && (
          <div className="text-center text-zinc-400 mt-2">
            No available time slots for this date
          </div>
        )}

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