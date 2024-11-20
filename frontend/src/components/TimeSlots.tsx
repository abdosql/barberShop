import React, { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface TimeSlotsProps {
  onSelect: (timeData: { date: string; time: string }) => void;
  selectedServices: string[];
  onNext?: () => void;
}

export default function TimeSlots({ onSelect, selectedServices, onNext }: TimeSlotsProps) {
  // Initialize with today's date
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');

  // Service definitions with durations
  const services = {
    haircut: { duration: 30 },
    beardTrim: { duration: 20 },
    styling: { duration: 25 },
    shave: { duration: 25 }
  };

  // Calculate total duration of selected services
  const totalDuration = selectedServices.reduce((total, serviceId) => 
    total + (services[serviceId as keyof typeof services]?.duration || 0), 0
  );

  // Generate appropriate time slots based on selected services
  const generateTimeSlots = () => {
    const baseSlots = [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ];
    
    // If only haircut is selected
    if (selectedServices.length === 1 && selectedServices.includes('haircut')) {
      return ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
              '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
              '17:00', '17:30', '18:00', '18:30', '19:00'];
    }

    // If haircut and beard trim are selected
    if (selectedServices.length === 2 && 
        selectedServices.includes('haircut') && 
        selectedServices.includes('beardTrim')) {
      // Return slots that accommodate the combined duration (50 minutes)
      return ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', 
              '17:00', '18:00', '19:00'];
    }

    // For other combinations, filter slots based on total duration
    return baseSlots.filter((_, index) => index % Math.ceil(totalDuration / 30) === 0);
  };

  const timeSlots = generateTimeSlots();

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 30 days from now for max date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    // Calculate end time based on total duration
    const [hours, minutes] = time.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours);
    endDate.setMinutes(minutes + totalDuration);
    const endTime = endDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });

    onSelect({
      date: selectedDate,
      time: `${time}-${endTime}`
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

  // Check if the selected time slot would end after business hours (20:00)
  const isValidTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours);
    endTime.setMinutes(minutes + totalDuration);
    return endTime.getHours() < 20 || (endTime.getHours() === 20 && endTime.getMinutes() === 0);
  };

  const handleTimeSelection = (date: string, time: string) => {
    onSelect({ date, time });
  };

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
            Select Time (Duration: {totalDuration} min)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {timeSlots.filter(isValidTimeSlot).map((time) => {
              // Calculate end time for display
              const [hours, minutes] = time.split(':').map(Number);
              const endDate = new Date();
              endDate.setHours(hours);
              endDate.setMinutes(minutes + totalDuration);
              const endTime = endDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              });

              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`p-4 rounded-xl border ${
                    selectedTime === time
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                  } transition-all duration-200`}
                >
                  <Clock className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">{time}</div>
                  <div className="text-xs text-zinc-500">to {endTime}</div>
                </button>
              )}
            )}
          </div>
        </div>
      )}

      {!selectedDate && (
        <div className="text-center text-zinc-400 mt-4">
          Please select a date first
        </div>
      )}

      {/* Add a Next button */}
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