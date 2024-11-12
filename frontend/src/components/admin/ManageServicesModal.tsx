import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ManageServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Service {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function ManageServicesModal({ isOpen, onClose }: ManageServicesModalProps) {
  const { translations } = useLanguage();
  const [services, setServices] = useState<Service[]>([
    // Temporary mock data - replace with API call
    { id: 1, name: translations.home.services.haircut, price: 30, description: 'Classic haircut service' },
    { id: 2, name: translations.home.services.beardTrim, price: 20, description: 'Professional beard trimming' },
  ]);

  const handleDelete = (serviceId: number) => {
    if (window.confirm(translations.admin.services.confirmDelete)) {
      // TODO: Implement API call to delete service
      setServices(services.filter(service => service.id !== serviceId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-medium text-white">
            {translations.admin.services.title}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Services List */}
        <div className="p-4">
          <div className="space-y-4">
            {services.map(service => (
              <div 
                key={service.id}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{service.name}</h4>
                    <p className="text-zinc-400 text-sm mt-1">{service.description}</p>
                    <p className="text-blue-500 mt-2">{service.price} DH</p>
                  </div>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                    title={translations.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-zinc-800 text-white rounded-lg text-sm font-medium
                     hover:bg-zinc-700 transition-colors"
          >
            {translations.common.close}
          </button>
        </div>
      </div>
    </div>
  );
} 