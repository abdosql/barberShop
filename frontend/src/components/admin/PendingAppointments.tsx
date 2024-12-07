import React from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import AppointmentList from './AppointmentList';
import { Appointment } from '../../types/appointment';

interface PendingAppointmentsProps {
  appointments: Appointment[];
  onAppointmentUpdated: (appointment: Appointment) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function PendingAppointments({
  appointments,
  onAppointmentUpdated,
  onRefresh,
  isLoading
}: PendingAppointmentsProps) {
  const { translations } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-white">
              {translations.admin.dashboard.pendingAppointments}
            </h2>
            <button
              onClick={onRefresh}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              title={translations.admin.dashboard.refresh}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <AppointmentList
            appointments={appointments}
            status="pending"
            onAppointmentUpdated={onAppointmentUpdated}
            isLoading={isLoading}
          />
        </div>
      </div>
    </motion.div>
  );
}
