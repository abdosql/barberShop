import React from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import AppointmentList from './AppointmentList';
import StatsCards from './StatsCards';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        {/* Appointments Section - Moved to top */}
        <div className="space-y-8 mb-12">
          {/* Pending Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Pending Appointments</h2>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-sm">
                5 pending
              </span>
            </div>
            <AppointmentList status="pending" />
          </div>
          
          {/* Accepted Appointments */}
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

        {/* Stats Section - Moved to bottom */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <StatsCards />
        </div>
      </div>
    </div>
  );
} 