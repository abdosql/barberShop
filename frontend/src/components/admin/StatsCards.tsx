import React from 'react';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StatsCards() {
  const { translations } = useLanguage();

  const stats = [
    {
      title: translations.admin.stats.totalClients,
      value: "124",
      icon: Users,
      change: "+12%",
      color: "blue"
    },
    {
      title: translations.admin.stats.todayAppointments,
      value: "8",
      icon: Calendar,
      change: "+3",
      color: "amber"
    },
    {
      title: translations.admin.stats.pendingRequests,
      value: "5",
      icon: Clock,
      change: "-2",
      color: "rose"
    },
    {
      title: translations.admin.stats.monthlyRevenue,
      value: "4,250 DH",
      icon: TrendingUp,
      change: "+18%",
      color: "green"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">{stat.title}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-${stat.color}-500 text-sm`}>{stat.change}</span>
            <span className="text-zinc-400 text-sm ml-2">
              {translations.admin.stats.vsLastMonth}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 