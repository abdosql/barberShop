import React from 'react';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Appointment } from '../../../types/appointment';
import { ServicesList } from './ServicesList';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ServicesModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({ appointment, onClose }) => {
  const { translations } = useLanguage();
  
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">
            {translations.admin.services.modal.title}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>
        <ServicesList services={appointment.services} />
      </motion.div>
    </div>
  );
};
