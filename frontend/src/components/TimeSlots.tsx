import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

interface TimeSlotsProps {
  onSelect: (timeData: { time: string; timeSlot: TimeSlot }) => void;
  selectedServices: string[];
  onNext?: () => void;
}

export default function TimeSlots({ onSelect, selectedServices, onNext }: TimeSlotsProps) {
  const { token } = useAuth();
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      try {
        // Fetch all time slots without any date filtering
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
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [token]);

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

      <div>
        <label className="block text-sm font-medium mb-2 text-zinc-400">
          Time Slots
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleTimeSelect(slot)}
              disabled={!slot.isAvailable}
              className={`p-4 rounded-xl border ${
                selectedTime === formatTime(slot.startTime)
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                  : slot.isAvailable
                  ? 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-50'
              } transition-all duration-200`}
            >
              <Clock className={`h-5 w-5 mx-auto mb-1 ${!slot.isAvailable ? 'opacity-50' : ''}`} />
              <div className="text-sm">{formatTime(slot.startTime)}</div>
              <div className="text-xs text-zinc-500">to {formatTime(slot.endTime)}</div>
              {!slot.isAvailable && (
                <div className="text-xs text-rose-500 mt-1">
                  Unavailable
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