import React, { useState } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import AppointmentList from './AppointmentList';
import StatsCards from './StatsCards';
import AddServiceModal from './AddServiceModal';

export default function Dashboard() {
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={() => setIsAddServiceModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                     bg-blue-500 hover:bg-blue-400 text-white rounded-lg 
                     text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
        
        <div className="space-y-8 mb-12">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Pending Appointments</h2>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-sm">
                5 pending
              </span>
            </div>
            <AppointmentList status="pending" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Accepted Appointments</h2>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">
                8 today
              </span>
            </div>
            <AppointmentList status="accepted" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <StatsCards />
        </div>

        <AddServiceModal 
          isOpen={isAddServiceModalOpen}
          onClose={() => setIsAddServiceModalOpen(false)}
        />
      </div>
    </div>
  );
} 