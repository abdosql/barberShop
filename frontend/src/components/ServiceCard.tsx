import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ServiceCardProps {
  name: string;
  price: number;
  duration: number;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}

export default function ServiceCard({ name, price, duration, icon: Icon, isSelected, onClick }: ServiceCardProps) {
  const { translations } = useLanguage();
  
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
      } transition-all duration-200 w-full text-left`}
    >
      <Icon className="h-5 w-5 mb-2 text-blue-500" />
      <h3 className="font-medium mb-1 text-white">{name}</h3>
      <div className="text-sm text-white">
        <span>{duration} {translations.home.booking.min}</span>
        <span className="mx-2">•</span>
        <span>{price} {translations.home.booking.currency}</span>
      </div>
    </button>
  );
}