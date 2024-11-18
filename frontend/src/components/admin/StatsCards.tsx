import React from 'react';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAdminStats } from '../../hooks/useAdminStats';

export default function StatsCards() {
  const { translations } = useLanguage();
  const stats = useAdminStats();

  const statsConfig = [
    {
      title: translations.admin.stats.totalClients,
      metric: stats.totalClients,
      icon: Users,
      color: "blue"
    },
    {
      title: translations.admin.stats.todayAppointments,
      metric: stats.todayAppointments,
      icon: Calendar,
      color: "amber"
    },
    {
      title: translations.admin.stats.pendingRequests,
      metric: stats.pendingRequests,
      icon: Clock,
      color: "rose"
    },
    {
      title: translations.admin.stats.monthlyRevenue,
      metric: stats.monthlyRevenue,
      icon: TrendingUp,
      color: "green",
      formatValue: (value: number) => `${value.toLocaleString()} DH`
    }
  ];

  if (stats.error) {
    return <div className="text-red-500 text-center p-4">{stats.error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => (
        <div 
          key={index}
          className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">{stat.title}</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {stat.metric.isLoading 
                  ? "..." 
                  : stat.formatValue 
                    ? stat.formatValue(stat.metric.current)
                    : stat.metric.current.toString()
                }
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-${stat.color}-500 text-sm`}>
              {stat.metric.change.percentageChange}
            </span>
            <span className="text-zinc-400 text-sm ml-2">
              {translations.admin.stats.vsLastMonth}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 