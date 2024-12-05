import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  dailyTimeSlots: {
    date: string;
    is_available: boolean;
  }[];
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

interface TimeSlotResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  "totalItems": number;
  "member": TimeSlot[];
}

export default function BookingForm({ readOnly = false }: BookingFormProps) {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [refreshTimeSlots, setRefreshTimeSlots] = useState(0);

  // Combine related state into a single object
  const [formState, setFormState] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    selectedServices: [] as string[],
    isSubmitting: false,
    showSocial: false
  });

  // Loading states
  const [loading, setLoading] = useState({
    services: true,
    timeSlots: true
  });

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Memoized calculations
  const { totalPrice, totalDuration } = useMemo(() => {
    return formState.selectedServices.reduce(
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
  }, [formState.selectedServices, services]);

  // Memoized slot availability check
  const isSlotDisabled = useCallback((slot: TimeSlot, index: number) => {
    // First check the dailyTimeSlots availability
    const isAvailableForDate = !slot.dailyTimeSlots.some(
      dailySlot => 
        new Date(dailySlot.date).toISOString().split('T')[0] === formState.date && 
        !dailySlot.is_available
    );

    // If not available for this date, disable the slot
    if (!isAvailableForDate) return true;

    // If no services selected, slot is available
    if (totalDuration <= 0) return false;

    const slotsNeeded = Math.ceil(totalDuration / 30);
    console.log(`Checking slot ${formatTime(slot.startTime)}, needs ${slotsNeeded} slots`);
    
    const hasEnough = hasEnoughConsecutiveSlots(index, slotsNeeded, timeSlots, totalDuration, formState.date);
    console.log(`Has enough slots: ${hasEnough}`);
    
    return !hasEnough;
  }, [totalDuration, timeSlots, formState.date]);

  // API calls moved to separate functions
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services?page=1`, {
        headers: {
          'Accept': 'application/ld+json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data.member);
    } catch (err) {
      setError('Failed to load services');
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  }, []);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, timeSlots: true }));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/time_slots?page=1`, {
        headers: {
          'Accept': 'application/ld+json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch time slots');
      const data: TimeSlotResponse = await response.json();
      
      // Sort time slots by time
      const sortedSlots = data.member.sort((a, b) => {
        const timeA = new Date(a.startTime).getTime();
        const timeB = new Date(b.startTime).getTime();
        return timeA - timeB;
      });

      console.log('Fetched time slots:', sortedSlots);
      setTimeSlots(sortedSlots);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to load time slots');
    } finally {
      setLoading(prev => ({ ...prev, timeSlots: false }));
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    console.log('Fetching time slots, date:', formState.date);
    fetchTimeSlots();
  }, [fetchTimeSlots, formState.date, refreshTimeSlots]);

  useEffect(() => {
    // Reset selected time and fetch new time slots when date changes
    setFormState(prev => ({ ...prev, time: '' }));
    fetchTimeSlots();
  }, [formState.date]);

  // Event handlers
  const handleServiceSelect = (serviceId: number) => {
    setFormState(prev => {
      const newServices = prev.selectedServices.includes(serviceId.toString())
        ? prev.selectedServices.filter(id => id !== serviceId.toString())
        : [...prev.selectedServices, serviceId.toString()];

      return { ...prev, selectedServices: newServices };
    });
  };

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
    if (readOnly || !formState.time || formState.selectedServices.length === 0) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));
    try {
      // Find the initial selected time slot
      const initialTimeSlot = timeSlots.find(slot => formatTime(slot.startTime) === formState.time);
      
      if (!initialTimeSlot) {
        throw new Error('Selected time slot not found');
      }

      // Calculate end time based on total duration
      const endTime = new Date(initialTimeSlot.startTime);
      endTime.setMinutes(endTime.getMinutes() + totalDuration);

      // Get all consecutive slots needed for the appointment
      const getConsecutiveSlots = (startSlot: TimeSlot, totalDuration: number) => {
        const slotsNeeded = Math.ceil(totalDuration / 30); // 30 minutes per slot
        const startIndex = timeSlots.findIndex(slot => slot.id === startSlot.id);
        const consecutiveSlots = [];
        
        for (let i = startIndex; i < startIndex + slotsNeeded; i++) {
          consecutiveSlots.push(`${import.meta.env.VITE_API_URL}/api/time_slots/${timeSlots[i].id}`);
        }
        
        return consecutiveSlots;
      };

      const appointmentBody = {
        startTime: `${formState.date}T${initialTimeSlot.startTime.split('T')[1]}`,
        endTime: endTime.toISOString(),
        status: "pending",
        totalDuration: totalDuration,
        totalPrice: totalPrice.toString(),
        timeSlots: getConsecutiveSlots(initialTimeSlot, totalDuration)
      };

      console.log('Request Body:', appointmentBody);

      // Create the appointment
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify(appointmentBody),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create appointment');
      }

      // Reset form first
      setFormState(prev => ({
        ...prev,
        selectedServices: [],
        time: '',
        date: new Date().toISOString().split('T')[0],
        showSocial: true
      }));

      // Then refresh time slots
      console.log('Appointment created, refreshing time slots');
      setRefreshTimeSlots(prev => prev + 1);
      await fetchTimeSlots(); // Immediately fetch new time slots

    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to book appointment. Please try again.');
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Helper function to determine grid columns based on service count
  const getGridClass = (serviceCount: number) => {
    if (serviceCount <= 2) return "grid grid-cols-1 gap-3 max-w-md mx-auto";
    if (serviceCount <= 4) return "grid grid-cols-1 sm:grid-cols-2 gap-3";
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"; // For 5 or more services
  };

  if (loading.services) {
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
                isSelected={formState.selectedServices.includes(service.id.toString())}
                onClick={() => handleServiceSelect(service.id)}
              />
            ))}
          </div>
          
          {formState.selectedServices.length > 0 && (
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
              value={formState.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormState(prev => ({ ...prev, date: e.target.value }))}
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
              value={formState.time}
              onChange={(e) => setFormState(prev => ({ ...prev, time: e.target.value }))}
              disabled={loading.timeSlots}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Choose a time</option>
              {timeSlots.map((slot, index) => {
                const isAvailable = !slot.dailyTimeSlots.some(
                  dailySlot => 
                    new Date(dailySlot.date).toISOString().split('T')[0] === formState.date && 
                    !dailySlot.is_available
                );
                
                return (
                  <option 
                    key={slot.id} 
                    value={formatTime(slot.startTime)}
                    disabled={!isAvailable || isSlotDisabled(slot, index)}
                  >
                    {formatTime(slot.startTime)}
                    {!isAvailable ? ' (Not Available)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          {totalDuration > 0 && (
            <p className="mt-2 text-sm text-zinc-400">
              Required time slots: {Math.ceil(totalDuration / 30)}
            </p>
          )}
        </div>

        {/* Show loading state for time slots */}
        {loading.timeSlots && (
          <div className="text-center text-zinc-400">Loading available time slots...</div>
        )}

        {/* Show message when no time slots available */}
        {!loading.timeSlots && timeSlots.length === 0 && (
          <div className="text-center text-zinc-400 mt-2">
            No available time slots for this date
          </div>
        )}

        {!readOnly && (
          <button
            disabled={formState.selectedServices.length === 0 || !formState.date || !formState.time || formState.isSubmitting}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-400 
                     transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Booking...
              </span>
            ) : (
              <span>
                <User className="h-5 w-5" />
                {translations.home.booking.bookAppointment}
              </span>
            )}
          </button>
        )}
      </div>

      <SocialLinks 
        isOpen={formState.showSocial} 
        onClose={() => setFormState(prev => ({ ...prev, showSocial: false }))} 
      />
    </form>
  );
}

// Utility functions moved outside component
const hasEnoughConsecutiveSlots = (startIndex: number, slotsNeeded: number, slots: TimeSlot[], totalDuration: number, date: string) => {
  // Check if we have enough slots remaining
  if (startIndex + slotsNeeded > slots.length) return false;

  // Get the required duration in minutes
  const requiredMinutes = totalDuration;
  let availableMinutes = 0;

  // Check consecutive slots
  for (let i = startIndex; i < slots.length && availableMinutes < requiredMinutes; i++) {
    // Check if current slot is available for the selected date
    const isAvailableForDate = !slots[i].dailyTimeSlots.some(
      dailySlot => 
        new Date(dailySlot.date).toISOString().split('T')[0] === date && 
        !dailySlot.is_available
    );

    // If current slot is not available, break
    if (!isAvailableForDate) {
      break;
    }

    // If not first slot, check if consecutive
    if (i > startIndex) {
      const currentStart = new Date(slots[i].startTime).getTime();
      const prevEnd = new Date(slots[i - 1].endTime).getTime();
      
      // If there's a gap between slots, break
      if (currentStart !== prevEnd) {
        break;
      }
    }

    // Add this slot's duration (30 minutes)
    availableMinutes += 30;
  }

  // Return true only if we have enough consecutive minutes
  return availableMinutes >= requiredMinutes;
};

const fetchData = async (endpoint: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    headers: { 'Accept': 'application/ld+json' }
  });

  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};