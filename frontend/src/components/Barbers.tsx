import React from 'react';
import { User } from 'lucide-react';

interface BarbersProps {
  onSelect: (barber: string) => void;
}

export default function Barbers({ onSelect }: BarbersProps) {
  const barbers = [
    {
      id: 1,
      name: 'James Wilson',
      specialty: 'Classic Cuts & Fades',
      image: 'https://images.unsplash.com/photo-1570158268183-d296b2892211?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      specialty: 'Modern Styles & Beard Grooming',
      image: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?auto=format&fit=crop&q=80&w=256'
    }
  ];

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Barber</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {barbers.map(barber => (
          <button
            key={barber.id}
            onClick={() => onSelect(barber.name)}
            className="group p-4 rounded-xl border border-zinc-800 bg-zinc-800/50 hover:border-amber-500 transition-all duration-200"
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
              <img
                src={barber.image}
                alt={barber.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <h3 className="text-lg font-medium mb-1">{barber.name}</h3>
            <p className="text-sm text-zinc-400">{barber.specialty}</p>
          </button>
        ))}
      </div>
    </div>
  );
}