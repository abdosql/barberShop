import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Scissors, Phone } from 'lucide-react';
import ServiceCard from './ServiceCard';
import SocialLinks from './SocialLinks';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  icon: typeof Scissors;
}

const services: Service[] = [
  {
    id: 'haircut',
    name: 'Haircut',
    price: 30,
    duration: 30,
    icon: Scissors
  },
  {
    id: 'beard-trim',
    name: 'Beard Trim',
    price: 20,
    duration: 20,
    icon: Scissors
  },
  {
    id: 'hair-styling',
    name: 'Hair Styling',
    price: 25,
    duration: 25,
    icon: Scissors
  },
  {
    id: 'clean-shave',
    name: 'Clean Shave',
    price: 25,
    duration: 25,
    icon: Scissors
  },
  {
    id: 'kids-haircut',
    name: 'Kids Haircut',
    price: 25,
    duration: 30,
    icon: Scissors
  },
  {
    id: 'hair-color',
    name: 'Hair Color',
    price: 50,
    duration: 60,
    icon: Scissors
  },
  {
    id: 'facial',
    name: 'Facial',
    price: 40,
    duration: 45,
    icon: Scissors
  },
  {
    id: 'head-massage',
    name: 'Head Massage',
    price: 20,
    duration: 20,
    icon: Scissors
  }
];

export default function BookingForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showSocial, setShowSocial] = useState(false);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const { totalPrice, totalDuration } = useMemo(() => {
    return selectedServices.reduce(
      (acc, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          return {
            totalPrice: acc.totalPrice + service.price,
            totalDuration: acc.totalDuration + service.duration
          };
        }
        return acc;
      },
      { totalPrice: 0, totalDuration: 0 }
    );
  }, [selectedServices]);

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
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800 shadow-xl p-4 sm:p-6 md:p-8 w-full">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium mb-4 text-white">Select Services</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                price={service.price}
                duration={service.duration}
                icon={service.icon}
                isSelected={selectedServices.includes(service.id)}
                onClick={() => toggleService(service.id)}
              />
            ))}
          </div>
          
          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">Total Duration:</span>
                <span className="font-medium text-blue-500">{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total Price:</span>
                <span className="font-medium text-blue-500">{totalPrice} DH</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">Select Date</label>
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
          <label className="block text-sm font-medium mb-2 text-white">Select Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
            >
              <option value="">Choose a time</option>
              <option value="09:00">9:00 AM ({formatDuration(totalDuration)})</option>
              <option value="10:00">10:00 AM ({formatDuration(totalDuration)})</option>
              <option value="11:00">11:00 AM ({formatDuration(totalDuration)})</option>
              <option value="12:00">12:00 PM ({formatDuration(totalDuration)})</option>
              <option value="13:00">1:00 PM ({formatDuration(totalDuration)})</option>
              <option value="14:00">2:00 PM ({formatDuration(totalDuration)})</option>
              <option value="15:00">3:00 PM ({formatDuration(totalDuration)})</option>
              <option value="16:00">4:00 PM ({formatDuration(totalDuration)})</option>
            </select>
          </div>
        </div>

        <button
          disabled={selectedServices.length === 0 || !date || !time}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-400 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <User className="h-5 w-5" />
          Book Appointment
        </button>
      </div>

      <SocialLinks 
        isOpen={showSocial} 
        onClose={() => setShowSocial(false)} 
      />
    </div>
  );
}