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
    
    // Extract time from the slot and adjust for timezone
    const slotDateTime = new Date(timeSlot.startTime);
    
    // For today's slots, check if they're in the past
    if (formattedSelectedDate === today) {
        // Get current time and add one hour to match UTC time of slots
        const currentTime = new Date();
        currentTime.setHours(currentTime.getHours() + 1);
        console.log('Adjusted current time:', currentTime);
        
        // Add 15 minutes buffer for immediate bookings
        const bookingBuffer = new Date(currentTime.getTime() + 15 * 60000);
        console.log('Booking buffer time:', bookingBuffer.toLocaleTimeString());
        
        const isBeforeBuffer = slotDateTime <= bookingBuffer;
        console.log('Is slot before buffer?', isBeforeBuffer);
        console.log('Slot time:', slotDateTime.toLocaleTimeString());
        console.log('Buffer time:', bookingBuffer.toLocaleTimeString());
        
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
    console.log('----------------------------------------');
    console.log('Checking consecutive slots:', { startIndex, slotsNeeded, totalDuration });
    console.log('Starting slot:', formatTime(timeSlots[startIndex].startTime));
    
    // If no duration/slots needed, slot is available
    if (slotsNeeded <= 0) {
      console.log('No slots needed, returning true');
      return true;
    }
    
    // First check if we have enough slots remaining
    if (startIndex + slotsNeeded > timeSlots.length) {
      console.log('Not enough remaining slots from index', startIndex);
      console.log('Need', slotsNeeded, 'slots but only have', timeSlots.length - startIndex);
      return false;
    }

    // Check all required slots at once
    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = startIndex + i;
      const currentSlot = timeSlots[slotIndex];
      
      console.log('Checking slot at index', slotIndex, formatTime(currentSlot.startTime));
      
      // Check if the slot exists and is available
      if (!currentSlot || !isTimeSlotAvailable(currentSlot, selectedDate)) {
        console.log('Slot not available at index:', slotIndex);
        return false;
      }

      // If not first slot, check if consecutive with previous slot
      if (i > 0) {
        const previousSlot = timeSlots[slotIndex - 1];
        const currentTime = new Date(currentSlot.startTime).getTime();
        const previousTime = new Date(previousSlot.startTime).getTime();
        const timeDiff = (currentTime - previousTime) / (1000 * 60);
        
        console.log('Time difference between slots:', timeDiff);
        console.log('Previous slot:', formatTime(previousSlot.startTime));
        console.log('Current slot:', formatTime(currentSlot.startTime));
        
        // If slots are not exactly 30 minutes apart, break the chain
        if (timeDiff !== 30) {
          console.log('Slots not consecutive at index:', slotIndex);
          console.log('Time difference was', timeDiff, 'minutes instead of 30');
          return false;
        }
      }
    }

    // If we got here, we found all needed consecutive slots
    console.log('✅ Found all needed consecutive slots starting from', formatTime(timeSlots[startIndex].startTime));
    return true;
  };

  // Check if a slot should be disabled
  const isSlotDisabled = (slot: TimeSlot, index: number) => {
    console.log('----------------------------------------');
    console.log('Checking if slot should be disabled:', formatTime(slot.startTime));
    console.log('Total duration:', totalDuration);
    
    // If slot is not available (past time or marked unavailable)
    if (!isTimeSlotAvailable(slot, selectedDate)) {
      console.log('❌ Slot not available:', formatTime(slot.startTime));
      return true;
    }
    
    // If no services selected, slot is enabled
    if (totalDuration <= 0) {
      console.log('✅ No duration required, slot enabled:', formatTime(slot.startTime));
      return false;
    }

    // Calculate how many consecutive 30-minute slots we need
    const slotsNeeded = Math.ceil(totalDuration / 30);
    console.log('Slots needed:', slotsNeeded, 'for duration:', totalDuration);
    
    // Check if we have enough consecutive available slots starting from this slot
    const hasEnough = hasEnoughConsecutiveSlots(index, slotsNeeded);
    console.log(hasEnough ? '✅ Slot enabled:' : '❌ Slot disabled:', formatTime(slot.startTime));
    return !hasEnough;
  };

  useEffect(() => {
    console.log('----------------------------------------');
    console.log('Total duration changed:', totalDuration);
    console.log('Selected services:', selectedServices);
    console.log('Required slots:', Math.ceil(totalDuration / 30));
    
    // Force re-render of time slots when duration changes
    if (timeSlots.length > 0) {
      const updatedSlots = [...timeSlots];
      setTimeSlots(updatedSlots);
    }
  }, [totalDuration, selectedServices]);

  useEffect(() => {
    console.log('Duration changed:', totalDuration);
    // Reset selection if the duration changes and current selection becomes invalid
    if (selectedTime && timeSlots.length > 0) {
      const selectedSlotIndex = timeSlots.findIndex(
        slot => formatTime(slot.startTime) === selectedTime
      );

      if (selectedSlotIndex !== -1) {
        const isCurrentSlotDisabled = isSlotDisabled(timeSlots[selectedSlotIndex], selectedSlotIndex);
        console.log('Current selection valid?', !isCurrentSlotDisabled);
        if (isCurrentSlotDisabled) {
          setSelectedTime(''); // Reset selection if it becomes invalid
        }
      }
    }
  }, [totalDuration, timeSlots, selectedDate]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      setSelectedTime('');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/time_slots?page=1`, {
          headers: {
            'Accept': 'application/ld+json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) {
          throw new Error(translations.home.timeSlots.loadingError);
        }

        const data = await response.json();
        // Sort time slots by time
        const sortedSlots = data.member.sort((a, b) => {
          const timeA = new Date(a.startTime).getTime();
          const timeB = new Date(b.startTime).getTime();
          return timeA - timeB;
        });
        setTimeSlots(sortedSlots);
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
          {timeSlots.map((slot, index) => {
            const isDisabled = isSlotDisabled(slot, index);
            return (
              <button
                key={`${slot.id}-${selectedDate}`}
                onClick={() => handleTimeSelect(slot)}
                disabled={isLoading || isDisabled}
                className={`p-4 rounded-xl border ${
                  selectedTime === formatTime(slot.startTime)
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                    : !isDisabled && !isLoading
                    ? 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-50'
                } transition-all duration-200`}
              >
                <Clock className={`h-5 w-5 mx-auto mb-1 ${isLoading || isDisabled ? 'opacity-50' : ''}`} />
                <div className="text-sm">{formatTime(slot.startTime)}</div>
                <div className="text-xs text-zinc-500">
                  {translations.home.timeSlots.to} {formatTime(slot.endTime)}
                </div>
                {(isLoading || isDisabled) && (
                  <div className="text-xs text-rose-500 mt-1">
                    {isLoading 
                      ? translations.home.timeSlots.refreshing 
                      : !isTimeSlotAvailable(slot, selectedDate) 
                      ? translations.home.timeSlots.unavailable 
                      : translations.home.timeSlots.notEnoughTime}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {translations.home.timeSlots.selectTime}
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
          <select
            value={selectedTime}
            onChange={(e) => {
              const slot = timeSlots.find(s => formatTime(s.startTime) === e.target.value);
              if (slot) {
                handleTimeSelect(slot);
              }
            }}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{translations.home.timeSlots.chooseTime}</option>
            {timeSlots.map((slot, index) => {
              const isDisabled = isSlotDisabled(slot, index);
              return (
                <option 
                  key={slot.id} 
                  value={formatTime(slot.startTime)}
                  disabled={isDisabled}
                >
                  {formatTime(slot.startTime)}
                  {isDisabled ? ` (${translations.home.timeSlots.notEnoughTime})` : ''}
                </option>
              );
            })}
          </select>
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