import React, { useState, useEffect } from 'react';
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
  FaSprayCan
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ServiceCard from './ServiceCard';

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
  onSelect: (services: string[], totalDuration: number) => void;
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

export default function Services({ selectedServices, onSelect }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { translations } = useLanguage();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services?page=1`, {
          headers: {
            'Accept': 'application/ld+json',
          },
        });

        if (!response.ok) {
          throw new Error(translations.home.services.errorLoading);
        }

        const data = await response.json();
        setServices(data.member);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(translations.home.services.errorLoading);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [token, translations]);

  const handleServiceToggle = (serviceId: number) => {
    const newSelection = selectedServices.includes(serviceId.toString())
      ? selectedServices.filter(id => id !== serviceId.toString())
      : [...selectedServices, serviceId.toString()];

    const totalDuration = newSelection.reduce((sum, id) => 
      sum + (services.find(s => s.id.toString() === id)?.duration || 0), 0
    );

    onSelect(newSelection, totalDuration);
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
    return <div className="text-center text-zinc-400">{translations.home.services.loadingServices}</div>;
  }

  if (error) {
    return <div className="text-center text-rose-500">{error}</div>;
  }

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {translations.home.services.title}
      </h2>
      
      <div className={getGridClass(services.length)}>
        {services.map(service => {
          const Icon = getRandomIcon(service.name);
          const isSelected = selectedServices.includes(service.id.toString());
          
          return (
            <ServiceCard
              key={service.id}
              name={service.name}
              price={Number(service.price)}
              duration={service.duration}
              icon={Icon}
              isSelected={isSelected}
              onClick={() => handleServiceToggle(service.id)}
            />
          );
        })}
      </div>

      {selectedServices.length > 0 && (
        <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">{translations.home.services.selectedServices}:</span>
            <span className="font-medium">
              {selectedServices.map(id => 
                services.find(s => s.id.toString() === id)?.name
              ).join(', ')}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">{translations.home.services.totalDuration}:</span>
            <span className="font-medium">{totalDuration} {translations.home.services.min}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">{translations.home.services.totalPrice}:</span>
            <span className="font-medium text-amber-500">
              {totalPrice} {translations.home.booking.currency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}