import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    console.log('Checking availability for:', {
      timeSlot: formatTime(timeSlot.startTime),
      selectedDate: formattedSelectedDate,
      dailyTimeSlots: timeSlot.dailyTimeSlots
    });
    
    // If dailyTimeSlots is empty, the slot is available
    if (timeSlot.dailyTimeSlots.length === 0) {
      console.log('No daily time slots, slot is available');
      return true;
    }

    // Check if there's a dailyTimeSlot for the selected date
    const dailySlot = timeSlot.dailyTimeSlots.find(
      slot => formatDateForComparison(slot.date) === formattedSelectedDate
    );

    console.log('Found daily slot:', dailySlot);

    // If no dailyTimeSlot exists for this date, the slot is available
    if (!dailySlot) {
      console.log('No matching daily slot found, slot is available');
      return true;
    }

    // If a dailyTimeSlot exists for this date, return its availability
    console.log('Daily slot found, availability:', dailySlot.is_available);
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
      console.log('Fetching time slots for date:', selectedDate);
      setIsLoading(true);
      setSelectedTime(''); // Reset selection when refreshing
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/time_slots?page=1`, {
          headers: {
            'Accept': 'application/ld+json'
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

        console.log('Fetched and sorted time slots:', {
          count: sortedSlots.length,
          firstSlot: sortedSlots[0]?.startTime,
          lastSlot: sortedSlots[sortedSlots.length - 1]?.startTime
        });
        
        setTimeSlots(sortedSlots);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to load time slots');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [refreshTrigger, selectedDate]);

  // Reset selection when services change
  useEffect(() => {
    setSelectedTime('');
  }, [selectedServices]);

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTime(formatTime(slot.startTime));
    onSelect({
      time: formatTime(slot.startTime),
      timeSlot: slot
    });
  };

  const formatTime = (isoString: string) => {
    // Parse the UTC time string and keep it in UTC
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (isLoading) {
    return <div className="text-center text-zinc-400">Loading available time slots...</div>;
  }

  if (error) {
    return <div className="text-center text-rose-500">{error}</div>;
  }

  if (timeSlots.length === 0) {
    return <div className="text-center text-zinc-400">No time slots available</div>;
  }

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Time</h2>
      {totalDuration > 0 && (
        <div className="mb-4 text-center text-sm text-zinc-400">
          Selected duration: {Math.floor(totalDuration / 60)}h{totalDuration % 60 > 0 ? ` ${totalDuration % 60}min` : ''}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-zinc-400">
          Time Slots
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeSlots.map((slot, index) => (
            <button
              key={slot.id}
              onClick={() => handleTimeSelect(slot)}
              disabled={isSlotDisabled(slot, index)}
              className={`p-4 rounded-xl border ${
                selectedTime === formatTime(slot.startTime)
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                  : !isSlotDisabled(slot, index)
                  ? 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-50'
              } transition-all duration-200`}
            >
              <Clock className={`h-5 w-5 mx-auto mb-1 ${isSlotDisabled(slot, index) ? 'opacity-50' : ''}`} />
              <div className="text-sm">{formatTime(slot.startTime)}</div>
              <div className="text-xs text-zinc-500">to {formatTime(slot.endTime)}</div>
              {isSlotDisabled(slot, index) && (
                <div className="text-xs text-rose-500 mt-1">
                  {!isTimeSlotAvailable(slot, selectedDate) ? 'Unavailable' : 'Not enough time'}
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
        Next
      </button>
    </div>
  );
}