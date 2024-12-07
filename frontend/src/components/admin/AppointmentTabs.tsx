import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import AppointmentList from './AppointmentList';
import { Appointment } from '../../types/appointment';

interface AppointmentTabsProps {
  confirmedViewMode: 'accepted' | 'declined' | 'cancelled' | 'completed';
  setConfirmedViewMode: (mode: 'accepted' | 'declined' | 'cancelled' | 'completed') => void;
  confirmedAppointments: Appointment[];
  declinedAppointments: Appointment[];
  cancelledAppointments: Appointment[];
  completedAppointments: Appointment[];
  onAppointmentUpdated: (appointment: Appointment) => void;
  isLoading: boolean;
}

export default function AppointmentTabs({
  confirmedViewMode,
  setConfirmedViewMode,
  confirmedAppointments,
  declinedAppointments,
  cancelledAppointments,
  completedAppointments,
  onAppointmentUpdated,
  isLoading
}: AppointmentTabsProps) {
  const { translations } = useLanguage();

  return (
    <div className="mt-8 space-y-6">
      <div className="border-b border-zinc-800">
        <div className="flex space-x-8">
          <button
            onClick={() => setConfirmedViewMode('accepted')}
            className={`py-4 relative ${
              confirmedViewMode === 'accepted'
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {translations.admin.dashboard.acceptedAppointments}
            {confirmedViewMode === 'accepted' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
          <button
            onClick={() => setConfirmedViewMode('completed')}
            className={`py-4 relative ${
              confirmedViewMode === 'completed'
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {translations.admin.dashboard.completedAppointments || "Completed"}
            {confirmedViewMode === 'completed' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
          <button
            onClick={() => setConfirmedViewMode('declined')}
            className={`py-4 relative ${
              confirmedViewMode === 'declined'
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {translations.admin.dashboard.declinedAppointments}
            {confirmedViewMode === 'declined' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
          <button
            onClick={() => setConfirmedViewMode('cancelled')}
            className={`py-4 relative ${
              confirmedViewMode === 'cancelled'
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {translations.admin.dashboard.cancelledAppointments}
            {confirmedViewMode === 'cancelled' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {confirmedViewMode === 'accepted' && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AppointmentList
              appointments={confirmedAppointments}
              status="accepted"
              onAppointmentUpdated={onAppointmentUpdated}
              isLoading={isLoading}
            />
          </motion.div>
        )}
        {confirmedViewMode === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AppointmentList
              appointments={completedAppointments}
              status="completed"
              onAppointmentUpdated={onAppointmentUpdated}
              isLoading={isLoading}
            />
          </motion.div>
        )}
        {confirmedViewMode === 'declined' && (
          <motion.div
            key="declined"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AppointmentList
              appointments={declinedAppointments}
              status="declined"
              onAppointmentUpdated={onAppointmentUpdated}
              isLoading={isLoading}
            />
          </motion.div>
        )}
        {confirmedViewMode === 'cancelled' && (
          <motion.div
            key="cancelled"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AppointmentList
              appointments={cancelledAppointments}
              status="cancelled"
              onAppointmentUpdated={onAppointmentUpdated}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
