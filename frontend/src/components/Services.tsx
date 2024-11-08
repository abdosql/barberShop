import React from 'react';
import { Scissors, ScissorsSquare, Brush, Sparkles } from 'lucide-react';

interface ServicesProps {
  selectedServices: string[];
  onSelect: (services: string[]) => void;
  onNext: () => void;
}

export default function Services({ selectedServices, onSelect, onNext }: ServicesProps) {
  const services = [
    { id: 'haircut', name: 'Haircut', price: 30, duration: 30, icon: Scissors },
    { id: 'beardTrim', name: 'Beard Trim', price: 20, duration: 20, icon: ScissorsSquare },
    { id: 'styling', name: 'Hair Styling', price: 25, duration: 25, icon: Brush },
    { id: 'shave', name: 'Clean Shave', price: 25, duration: 25, icon: Sparkles },
  ];

  const handleServiceToggle = (serviceId: string) => {
    const newSelection = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    onSelect(newSelection);
  };

  const totalPrice = selectedServices.reduce((sum, id) => 
    sum + (services.find(s => s.id === id)?.price || 0), 0
  );

  const totalDuration = selectedServices.reduce((sum, id) => 
    sum + (services.find(s => s.id === id)?.duration || 0), 0
  );

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Your Services</h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {services.map(service => {
          const Icon = service.icon;
          const isSelected = selectedServices.includes(service.id);
          
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
                  services.find(s => s.id === id)?.name
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