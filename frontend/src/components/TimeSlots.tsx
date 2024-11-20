import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TimeSlot {
  "@id": string;
  "@type": string;
  id: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlotsProps {
  onSelect: (timeData: { date: string; time: string }) => void;
  selectedServices: string[];
  onNext?: () => void;
}

export default function TimeSlots({ onSelect, selectedServices, onNext }: TimeSlotsProps) {
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 30 days from now for max date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Fetch time slots from API
  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/time_slots?page=1`, {
          headers: {
            'Accept': 'application/ld+json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch time slots');
        }

        const data = await response.json();
        setTimeSlots(data['member']);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to load available time slots');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [token]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onSelect({
      date: selectedDate,
      time: time
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time from ISO string to display time (HH:mm)
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Filter time slots for selected date
  const filteredTimeSlots = timeSlots.filter(slot => {
    const slotDate = new Date(slot.startTime).toISOString().split('T')[0];
    return slotDate === selectedDate;
  });

  if (isLoading) {
    return <div className="text-center text-zinc-400">Loading available time slots...</div>;
  }

  if (error) {
    return <div className="text-center text-rose-500">{error}</div>;
  }

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Date & Time</h2>

      {/* Date Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2 text-zinc-400">Select Date</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
          <input
            type="date"
            min={today}
            max={maxDateString}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
          />
        </div>
        {selectedDate && (
          <p className="mt-2 text-sm text-amber-500">
            {formatDate(selectedDate)}
          </p>
        )}
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-400">
            Select Time
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredTimeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleTimeSelect(formatTime(slot.startTime))}
                className={`p-4 rounded-xl border ${
                  selectedTime === formatTime(slot.startTime)
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                } transition-all duration-200`}
              >
                <Clock className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm">{formatTime(slot.startTime)}</div>
                <div className="text-xs text-zinc-500">to {formatTime(slot.endTime)}</div>
              </button>
            ))}
          </div>
          
          {filteredTimeSlots.length === 0 && (
            <p className="text-center text-zinc-400 mt-4">
              No available time slots for this date
            </p>
          )}
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!selectedTime || !selectedDate}
        className="mt-4 w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium 
                 hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}