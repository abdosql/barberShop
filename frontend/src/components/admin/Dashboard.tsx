import React, { useState } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, Plus, Settings } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import AppointmentList from './AppointmentList';
import StatsCards from './StatsCards';
import AddServiceModal from './AddServiceModal';
import ManageServicesModal from './ManageServicesModal';

export default function Dashboard() {
  const { translations } = useLanguage();
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isManageServicesModalOpen, setIsManageServicesModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);

  const handleServiceAdded = () => {
    setIsAddServiceModalOpen(false);
    setIsManageServicesModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {translations.admin.dashboard.title}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsManageServicesModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg 
                       text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              {translations.admin.dashboard.manageServices}
            </button>
            <button
              onClick={() => setIsAddServiceModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-blue-500 hover:bg-blue-400 text-white rounded-lg 
                       text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {translations.admin.dashboard.addService}
            </button>
          </div>
        </div>
        
        <div className="space-y-8 mb-12">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {translations.admin.dashboard.pendingAppointments}
              </h2>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-sm">
                {pendingCount} pending
              </span>
            </div>
            <AppointmentList 
              status="pending" 
              onCountChange={setPendingCount}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {translations.admin.dashboard.acceptedAppointments}
              </h2>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">
                {acceptedCount} today
              </span>
            </div>
            <AppointmentList 
              status="accepted"
              onCountChange={setAcceptedCount}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <StatsCards />
        </div>

        <AddServiceModal 
          isOpen={isAddServiceModalOpen}
          onClose={() => setIsAddServiceModalOpen(false)}
          onServiceAdded={handleServiceAdded}
        />
        <ManageServicesModal
          isOpen={isManageServicesModalOpen}
          onClose={() => setIsManageServicesModalOpen(false)}
        />
      </div>
    </div>
  );
} 