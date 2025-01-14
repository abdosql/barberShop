import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  GiRazor, 
  GiScissors,
  GiHairStrands,
  GiWaterDrop,
  GiSpray,
  GiComb,
  GiBeard,
  GiRazorBlade
} from 'react-icons/gi';
import { 
  FaChild, 
  FaUserAlt,
  FaSprayCan,
  FaCalendarAlt,
  FaClock,
  FaUser
} from 'react-icons/fa';
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

interface TimeSlotResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  "totalItems": number;
  "member": TimeSlot[];
}

// Map of service names to arrays of possible icons
const serviceIcons = {
  'Haircut': [GiScissors, GiComb, GiHairStrands],
  'Beard Trim': [GiBeard, GiRazor, GiRazorBlade],
  'Hair Styling': [GiComb, GiSpray, FaSprayCan],
  'Clean Shave': [GiRazor, GiRazorBlade, FaUserAlt],
  'Hair Wash': [GiWaterDrop, GiSpray, FaSprayCan],
  'Hair Treatment': [GiHairStrands, GiSpray, GiComb],
  'Kids Haircut': [FaChild, GiScissors, GiComb],
  // Add more mappings as needed
};

// Function to get a random icon for a service
const getRandomIcon = (serviceName: string) => {
  const icons = serviceIcons[serviceName as keyof typeof serviceIcons] || [GiScissors, GiComb, GiRazor];
  return icons[Math.floor(Math.random() * icons.length)];
};

export default function BookingForm({ readOnly = false }: BookingFormProps) {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [refreshTimeSlotsCount, setRefreshTimeSlotsCount] = useState(0);

  // Combine related state into a single object
  const [formState, setFormState] = useState({
    date: new Date().toLocaleDateString('en-CA'), 
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
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toLocaleDateString('en-CA');
    
    // Only check past slots for today's date
    if (formState.date === today) {
      const now = new Date();
      const [slotHours, slotMinutes] = slot.startTime.split(':');
      
      // Create a full datetime for the slot using today's date and the slot time
      const slotDateTime = new Date(formState.date);
      slotDateTime.setHours(parseInt(slotHours), parseInt(slotMinutes), 0, 0);
      
      // Add 15 minutes buffer to current time
      const bookingBuffer = new Date(now.getTime() + 15 * 60000);
      
      if (slotDateTime.getTime() <= bookingBuffer.getTime()) {
        return true;
      }
    }

    // Check if the slot is available for the selected date
    const dailySlotForDate = slot.dailyTimeSlots.find(
      dailySlot => new Date(dailySlot.date).toLocaleDateString('en-CA') === formState.date
    );

    if (dailySlotForDate && !dailySlotForDate.is_available) {
      return true;
    }

    // If no services selected, slot is available
    if (totalDuration <= 0) {
      return false;
    }

    // Check for enough consecutive slots
    const slotsNeeded = Math.ceil(totalDuration / 30);
    
    const hasEnough = hasEnoughConsecutiveSlots(index, slotsNeeded, timeSlots, totalDuration, formState.date);
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

  // Move fetchData inside component
  const fetchData = useCallback(async (endpoint: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      headers: { 
        'Accept': 'application/ld+json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  }, []);

  // Rename to fetchTimeSlots to avoid naming conflict
  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, timeSlots: true }));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/time_slots?page=1`, {
        headers: {
          'Accept': 'application/ld+json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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

      setTimeSlots(sortedSlots);
    } catch (err) {
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
    fetchTimeSlots();
  }, [fetchTimeSlots, formState.date]);

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

      // Clear time selection when services change
      return { 
        ...prev, 
        selectedServices: newServices,
        time: '', // Clear the selected time
      };
    });
    
    // Trigger time slots refresh and refetch time slots
    setRefreshTimeSlotsCount(prev => prev + 1);
    fetchTimeSlots(); // Immediately fetch new time slots
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
        throw new Error(translations.home.booking.timeSlotNotFound);
      }

      // Calculate end time based on total duration
      const startDateTime = new Date(`${formState.date}T${initialTimeSlot.startTime.split('T')[1]}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(startDateTime.getMinutes() + totalDuration);

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
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: "pending",
        totalDuration: totalDuration,
        totalPrice: totalPrice.toString(),
        timeSlots: getConsecutiveSlots(initialTimeSlot, totalDuration),
        services: formState.selectedServices.map(serviceId => 
          `${import.meta.env.VITE_API_URL}/api/services/${serviceId}`
        )
      };

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

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create appointment');
      }

      // Reset form first
      setFormState(prev => ({
        ...prev,
        selectedServices: [],
        time: '',
        date: new Date().toLocaleDateString('en-CA'), 
        showSocial: true
      }));

      // Then refresh time slots
      setRefreshTimeSlotsCount(prev => prev + 1);
      await fetchTimeSlots(); // Immediately fetch new time slots

    } catch (err) {
      setError(err instanceof Error ? err.message : translations.home.booking.bookingError);
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

  const getMinDate = () => {
    const today = new Date();
    // Get the local date string in YYYY-MM-DD format for the current timezone
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  if (loading.services) {
    return <div className="text-center text-zinc-400">{translations.home.booking.loadingServices}</div>;
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
                icon={getRandomIcon(service.name)}
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
                <span className="font-medium text-blue-500">{totalPrice} {translations.home.booking.currency}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            {translations.home.booking.selectDate}
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <input
              type="date"
              value={formState.date}
              min={getMinDate()}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value + 'T00:00:00');
                const minDate = new Date(getMinDate() + 'T00:00:00');
                
                if (selectedDate >= minDate) {
                  setFormState(prev => ({ 
                    ...prev, 
                    date: e.target.value,
                    time: '' // Clear time when date changes
                  }));
                } else {
                  // If selected date is before today, set to today
                  setFormState(prev => ({ 
                    ...prev, 
                    date: getMinDate(),
                    time: '' // Clear time when date changes
                  }));
                }
              }}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            {translations.home.booking.selectTime}
          </label>
          <div className="relative">
            <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <select
  value={formState.time}
  onChange={(e) => setFormState(prev => ({ ...prev, time: e.target.value }))}
  disabled={loading.timeSlots}
  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
>
  <option value="">{translations.home.booking.chooseTime}</option>
  {timeSlots.map((slot, index) => {
    // Check if the slot is in the past (for today)
    const isPastSlot = formState.date === new Date().toLocaleDateString('en-CA') && (() => {
      const now = new Date();
      // Create a date object for the slot time using the selected date
      const [slotHours, slotMinutes] = formatTime(slot.startTime).split(':');
      const slotDate = new Date(formState.date);
      slotDate.setHours(parseInt(slotHours), parseInt(slotMinutes), 0, 0);
      
      // Add 15 minutes buffer to current time
      const bookingBuffer = new Date(now.getTime() + 15 * 60000);
      
      return slotDate.getTime() <= bookingBuffer.getTime();
    })();

    const isAvailable = !slot.dailyTimeSlots.some(
      dailySlot => 
        new Date(dailySlot.date).toISOString().split('T')[0] === formState.date && 
        !dailySlot.is_available
    );
    
    return (
      <option 
        key={slot.id} 
        value={formatTime(slot.startTime)}
        disabled={!isAvailable || isSlotDisabled(slot, index) || isPastSlot}
      >
        {formatTime(slot.startTime)}
        {!isAvailable ? ` (${translations.home.booking.notAvailable})` : ''}
        {isPastSlot ? ` (${translations.home.booking.pastTime})` : ''}
      </option>
    );
  })}
</select>
          </div>
          {totalDuration > 0 && (
            <p className="mt-2 text-sm text-zinc-400">
              {translations.home.booking.requiredTimeSlots}: {Math.ceil(totalDuration / 30)}
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
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold
                     shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700
                     transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
                     flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:scale-100 disabled:shadow-none disabled:from-zinc-500 disabled:to-zinc-600"
          >
            {formState.isSubmitting ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-lg">{translations.home.booking.bookingInProgress}</span>
              </span>
            ) : (
              <span className="flex items-center gap-3 text-lg">
                <FaUserAlt className="h-6 w-6" />
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

// Keep utility functions outside
const hasEnoughConsecutiveSlots = (startIndex: number, slotsNeeded: number, slots: TimeSlot[], totalDuration: number, date: string) => {
  // Check if we have enough slots remaining
  if (startIndex + slotsNeeded > slots.length) {
    return false;
  }

  // Check all required slots at once
  for (let i = 0; i < slotsNeeded; i++) {
    const currentSlot = slots[startIndex + i];
    
    // Check if current slot is available for the selected date
    const dailySlotForDate = currentSlot.dailyTimeSlots.find(
      dailySlot => new Date(dailySlot.date).toLocaleDateString('en-CA') === date
    );

    // If slot is marked as unavailable for this date
    if (dailySlotForDate && !dailySlotForDate.is_available) {
      return false;
    }

    // If not first slot, check if consecutive with previous slot
    if (i > 0) {
      const prevSlot = slots[startIndex + i - 1];
      const currentStart = new Date(currentSlot.startTime);
      const prevEnd = new Date(prevSlot.endTime);
      
      // Check if slots are exactly 30 minutes apart
      const timeDiff = (currentStart.getTime() - prevEnd.getTime()) / (1000 * 60);
      
      if (timeDiff !== 0) { // Should be exactly consecutive (end time = start time)
        return false;
      }
    }
  }

  // If we got here, we found all needed consecutive available slots
  return true;
};