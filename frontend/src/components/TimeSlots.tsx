import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DailyTimeSlot {
  "@type": string;
  "@id": string;
  id: number;
  date: string;
  is_available: boolean;
}

interface TimeSlot {
  "@id": string;
  "@type": string;
  id: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  dailyTimeSlots: DailyTimeSlot[];
}

interface TimeSlotsProps {
  onSelect: (timeData: { time: string; timeSlot: TimeSlot }) => void;
  selectedServices: string[];
  totalDuration: number;
  selectedDate: string;
  onNext?: () => void;
  refreshTrigger?: number;
}

export default function TimeSlots({ onSelect, selectedServices, totalDuration, selectedDate, onNext, refreshTrigger }: TimeSlotsProps) {
  console.log('TimeSlots component rendering', { selectedDate, totalDuration });
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { translations } = useLanguage();

  // Calculate required slots based on total duration
  const calculateRequiredSlots = (duration: number) => {
    return Math.ceil(duration / 30); // 30 minutes per slot
  };

  // Function to ensure date comparison is consistent
  const formatDateForComparison = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
  };

  // Function to check if a time slot is available
  const isTimeSlotAvailable = (timeSlot: TimeSlot, selectedDate: string) => {
    const formattedSelectedDate = formatDateForComparison(selectedDate);
    const today = new Date().toISOString().split('T')[0];
    
    console.log('----------------------------------------');
    console.log('Checking availability for slot:', timeSlot.startTime);
    console.log('Selected date:', selectedDate);
    console.log('Formatted selected date:', formattedSelectedDate);
    console.log('Today:', today);
    console.log('Is today?', formattedSelectedDate === today);
    
    // Extract just the time part from the slot
    const slotTime = timeSlot.startTime.split('T')[1].split('+')[0];
    const [slotHours, slotMinutes] = slotTime.split(':').map(Number);
    console.log('Slot time parts - Hours:', slotHours, 'Minutes:', slotMinutes);
    
    // Create a date object for the selected date with the slot's time
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(slotHours, slotMinutes, 0, 0);
    console.log('Full slot date time:', slotDateTime);
    console.log('Slot time string:', slotDateTime.toLocaleTimeString());
    
    // Get current time
    const currentTime = new Date();
    console.log('Current time:', currentTime);
    console.log('Current time string:', currentTime.toLocaleTimeString());
    
    // For today's slots, check if they're in the past
    if (formattedSelectedDate === today) {
      // Add 15 minutes buffer for immediate bookings
      const bookingBuffer = new Date(currentTime.getTime() + 15 * 60000);
      console.log('Booking buffer time:', bookingBuffer.toLocaleTimeString());
      
      const isBeforeBuffer = slotDateTime <= bookingBuffer;
      console.log('Is slot before buffer?', isBeforeBuffer);
      
      if (isBeforeBuffer) {
        console.log('❌ Slot disabled: Too close to current time');
        return false;
      }
    }
    
    // Check daily time slots
    if (!timeSlot.dailyTimeSlots || timeSlot.dailyTimeSlots.length === 0) {
      console.log('✅ No daily slots - slot is available');
      return true;
    }

    const dailySlot = timeSlot.dailyTimeSlots.find(
      slot => {
        const slotDate = formatDateForComparison(slot.date);
        console.log('Comparing daily slot date:', slotDate, 'with selected date:', formattedSelectedDate);
        return slotDate === formattedSelectedDate;
      }
    );

    if (!dailySlot) {
      console.log('✅ No daily slot for this date - slot is available');
      return true;
    }

    console.log(dailySlot.is_available ? '✅' : '❌', 'Daily slot availability:', dailySlot.is_available);
    return dailySlot.is_available;
  };

  // Function to check if there are enough consecutive available slots
  const hasEnoughConsecutiveSlots = (startIndex: number, slotsNeeded: number) => {
    if (!isTimeSlotAvailable(timeSlots[startIndex], selectedDate)) return false;
    if (startIndex + slotsNeeded > timeSlots.length) return false;

    for (let i = startIndex; i < startIndex + slotsNeeded; i++) {
      if (!timeSlots[i] || !isTimeSlotAvailable(timeSlots[i], selectedDate)) {
        return false;
      }

      if (i > startIndex) {
        const currentSlotTime = new Date(timeSlots[i].startTime);
        const previousSlotTime = new Date(timeSlots[i - 1].startTime);
        const timeDiff = (currentSlotTime.getTime() - previousSlotTime.getTime()) / (1000 * 60);
        if (timeDiff !== 30) {
          return false;
        }
      }
    }

    return true;
  };

  // Check if a slot should be disabled
  const isSlotDisabled = (slot: TimeSlot, index: number) => {
    if (!isTimeSlotAvailable(slot, selectedDate)) return true;
    if (totalDuration <= 0) return false;

    const slotsNeeded = Math.ceil(totalDuration / 30);
    let availableConsecutiveSlots = 0;

    // Check consecutive slots starting from this index
    for (let i = index; i < timeSlots.length && availableConsecutiveSlots < slotsNeeded; i++) {
      if (!isTimeSlotAvailable(timeSlots[i], selectedDate)) break;

      if (i > index) {
        const currentStart = new Date(timeSlots[i].startTime).getTime();
        const prevEnd = new Date(timeSlots[i - 1].endTime).getTime();
        if (currentStart !== prevEnd) break;
      }

      availableConsecutiveSlots++;
    }

    return availableConsecutiveSlots < slotsNeeded;
  };

  // Reset selection if the duration changes and current selection becomes invalid
  useEffect(() => {
    if (selectedTime && timeSlots.length > 0) {
      const selectedSlotIndex = timeSlots.findIndex(
        slot => formatTime(slot.startTime) === selectedTime
      );

      if (selectedSlotIndex !== -1 && isSlotDisabled(timeSlots[selectedSlotIndex], selectedSlotIndex)) {
        setSelectedTime(''); // Reset selection if it becomes invalid
      }
    }
  }, [totalDuration, timeSlots]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      setSelectedTime('');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/time_slots?page=1`, {
          headers: {
            'Accept': 'application/ld+json'
          }
        });

        if (!response.ok) {
          throw new Error(translations.home.timeSlots.loadingError);
        }

        const data = await response.json();
        setTimeSlots(data.member);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError(translations.home.timeSlots.loadingError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, refreshTrigger, translations]);

  const handleTimeSelect = (slot: TimeSlot) => {
    if (isLoading) return; // Prevent selection while loading
    setSelectedTime(formatTime(slot.startTime));
    onSelect({
      time: formatTime(slot.startTime),
      timeSlot: slot
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">{translations.home.timeSlots.title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-50"
            >
              <Clock className="h-5 w-5 mx-auto mb-1 opacity-50" />
              <div className="text-sm animate-pulse bg-zinc-800 h-4 w-16 mx-auto rounded"></div>
              <div className="text-xs text-zinc-500 mt-1">{translations.common.loading}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-rose-500">{error}</div>;
  }

  if (timeSlots.length === 0) {
    return <div className="text-center text-zinc-400">{translations.home.timeSlots.noTimeSlots}</div>;
  }

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">{translations.home.timeSlots.title}</h2>
      {totalDuration > 0 && (
        <div className="mb-4 text-center text-sm text-zinc-400">
          {translations.home.timeSlots.selectedDuration}: {Math.floor(totalDuration / 60)}
          {translations.home.timeSlots.hour}
          {totalDuration % 60 > 0 ? ` ${totalDuration % 60}${translations.home.timeSlots.minutes}` : ''}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-zinc-400">
          {translations.home.timeSlots.timeSlots}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeSlots.map((slot, index) => (
            <button
              key={`${slot.id}-${selectedDate}`}
              onClick={() => handleTimeSelect(slot)}
              disabled={isLoading || isSlotDisabled(slot, index)}
              className={`p-4 rounded-xl border ${
                selectedTime === formatTime(slot.startTime)
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                  : !isSlotDisabled(slot, index) && !isLoading
                  ? 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-50'
              } transition-all duration-200`}
            >
              <Clock className={`h-5 w-5 mx-auto mb-1 ${isLoading || isSlotDisabled(slot, index) ? 'opacity-50' : ''}`} />
              <div className="text-sm">{formatTime(slot.startTime)}</div>
              <div className="text-xs text-zinc-500">
                {translations.home.timeSlots.to} {formatTime(slot.endTime)}
              </div>
              {(isLoading || isSlotDisabled(slot, index)) && (
                <div className="text-xs text-rose-500 mt-1">
                  {isLoading 
                    ? translations.home.timeSlots.refreshing 
                    : !isTimeSlotAvailable(slot, selectedDate) 
                    ? translations.home.timeSlots.unavailable 
                    : translations.home.timeSlots.notEnoughTime}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!selectedTime}
        className="mt-4 w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium 
                 hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {translations.common.next}
      </button>
    </div>
  );
}