import React from 'react';
import { Calendar, Clock, User, Check } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface SummaryProps {
  booking: {
    services: string[];
    time: string;
    date: string;
  };
  onBack: () => void;
}

export default function Summary({ booking, onBack }: SummaryProps) {
  const services: Service[] = [
    { id: 'haircut', name: 'Haircut', price: 30, duration: 30 },
    { id: 'beard-trim', name: 'Beard Trim', price: 20, duration: 20 },
    { id: 'hair-styling', name: 'Hair Styling', price: 25, duration: 25 },
    { id: 'clean-shave', name: 'Clean Shave', price: 25, duration: 25 },
    { id: 'kids-haircut', name: 'Kids Haircut', price: 25, duration: 30 },
    { id: 'hair-color', name: 'Hair Color', price: 50, duration: 60 },
    { id: 'facial', name: 'Facial', price: 40, duration: 45 },
    { id: 'head-massage', name: 'Head Massage', price: 20, duration: 20 }
  ];

  const selectedServices = services.filter(service => 
    booking.services.includes(service.id)
  );

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  // Format the time properly
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formattedTime = formatTime(booking.time);

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

  // Add this new function to format duration
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

  return (
    <div className="text-white">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmation</h2>
        <p className="text-zinc-400">Review your appointment details</p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {/* Services Details */}
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Selected Services</p>
              <p className="font-medium">Total Duration: {formatDuration(totalDuration)}</p>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            {selectedServices.map(service => (
              <div key={service.id} className="flex justify-between items-center py-2 border-t border-zinc-700">
                <span className="text-zinc-300">{service.name}</span>
                <span className="text-blue-500">{service.price} DH</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-zinc-700">
              <span className="font-medium">Total Amount</span>
              <span className="font-medium text-blue-500">{totalPrice} DH</span>
            </div>
          </div>
        </div>

        {/* Date Details */}
        <div className="bg-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Appointment Date</p>
            <p className="font-medium">{formatDate(booking.date)}</p>
          </div>
        </div>

        {/* Time Details */}
        <div className="bg-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Appointment Time</p>
            <p className="font-medium">{formattedTime}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-zinc-800 text-white py-4 px-6 rounded-xl font-medium hover:bg-zinc-700 transition"
          >
            Edit Booking
          </button>
          <button className="flex-1 bg-amber-500 text-black py-4 px-6 rounded-xl font-medium hover:bg-amber-400 transition">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}