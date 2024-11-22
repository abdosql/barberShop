import React, { useState, useEffect } from 'react';
import { Scissors, ScissorsSquare, Brush, Sparkles } from 'lucide-react';
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

interface ServicesProps {
  selectedServices: string[];
  onSelect: (services: string[]) => void;
  onNext: () => void;
}

// Map of service names to their respective icons
const serviceIcons = {
  'Haircut': Scissors,
  'Beard Trim': ScissorsSquare,
  'Hair Styling': Brush,
  'Clean Shave': Sparkles,
  // Add more mappings as needed
};

export default function Services({ selectedServices, onSelect, onNext }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services?page=1`, {
          headers: {
            'Accept': 'application/ld+json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const data = await response.json();
        setServices(data.member);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [token]);

  const handleServiceToggle = (serviceId: number) => {
    const newSelection = selectedServices.includes(serviceId.toString())
      ? selectedServices.filter(id => id !== serviceId.toString())
      : [...selectedServices, serviceId.toString()];

    const totalDuration = newSelection.reduce((sum, id) => 
      sum + (services.find(s => s.id.toString() === id)?.duration || 0), 0
    );

    onSelect({
      services: newSelection,
      totalDuration
    });
  };

  const totalPrice = selectedServices.reduce((sum, id) => 
    sum + Number(services.find(s => s.id.toString() === id)?.price || 0), 0
  );

  const totalDuration = selectedServices.reduce((sum, id) => 
    sum + (services.find(s => s.id.toString() === id)?.duration || 0), 0
  );

  // Helper function to determine grid columns based on service count
  const getGridClass = (serviceCount: number) => {
    if (serviceCount <= 2) return "grid md:grid-cols-1 gap-4 mb-8 max-w-md mx-auto";
    if (serviceCount <= 4) return "grid md:grid-cols-2 gap-4 mb-8";
    return "grid md:grid-cols-3 gap-4 mb-8"; // For 5 or more services
  };

  if (isLoading) {
    return <div className="text-center text-zinc-400">Loading services...</div>;
  }

  if (error) {
    return <div className="text-center text-rose-500">{error}</div>;
  }

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Your Services</h2>
      
      <div className={getGridClass(services.length)}>
        {services.map(service => {
          const Icon = serviceIcons[service.name as keyof typeof serviceIcons] || Scissors;
          const isSelected = selectedServices.includes(service.id.toString());
          
          return (
            <button
              key={service.id}
              onClick={() => handleServiceToggle(service.id)}
              className={`p-6 rounded-xl border ${
                isSelected 
                  ? 'border-amber-500 bg-amber-500/10' 
                  : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
              } transition-all duration-200 group`}
            >
              <Icon className={`w-8 h-8 mb-4 ${
                isSelected ? 'text-amber-500' : 'text-zinc-400'
              } group-hover:text-amber-500/80 transition-colors`} />
              <h3 className="text-lg font-medium mb-2">{service.name}</h3>
              <div className="flex justify-between items-center">
                <p className="text-zinc-400">${service.price}</p>
                <p className="text-sm text-zinc-500">{service.duration} min</p>
              </div>
              {isSelected && (
                <div className="mt-2 text-sm text-amber-500">Selected</div>
              )}
            </button>
          );
        })}
      </div>

      {selectedServices.length > 0 && (
        <>
          <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400">Selected Services:</span>
              <span className="font-medium">
                {selectedServices.map(id => 
                  services.find(s => s.id.toString() === id)?.name
                ).join(', ')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400">Total Duration:</span>
              <span className="font-medium">{totalDuration} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Price:</span>
              <span className="font-medium text-amber-500">${totalPrice}</span>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-amber-500 text-black py-3 px-4 rounded-lg font-medium hover:bg-amber-400 transition flex items-center justify-center gap-2"
          >
            Continue with {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}
          </button>
        </>
      )}
    </div>
  );
}