import React from 'react';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAdminStats } from '../../hooks/useAdminStats';

export default function StatsCards() {
  const { translations } = useLanguage();
  const { totalClients, todayAppointments, pendingRequests, monthlyRevenue, isLoading, error } = useAdminStats();

  const calculateChange = (current: number, previous: number): string => {
    if (!previous) return '+0%';
    const percentChange = ((current - previous) / previous) * 100;
    return `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
  };

  const stats = [
    {
      title: translations.admin.stats.totalClients,
      value: isLoading ? "..." : totalClients.toString(),
      icon: Users,
      change: calculateChange(totalClients, totalClients - 10), // Example: Compare with last month's value
      color: "blue"
    },
    {
      title: translations.admin.stats.todayAppointments, 
      value: isLoading ? "..." : todayAppointments.toString(),
      icon: Calendar,
      change: calculateChange(todayAppointments, todayAppointments - 5), // Compare with yesterday
      color: "amber"
    },
    {
      title: translations.admin.stats.pendingRequests,
      value: isLoading ? "..." : pendingRequests.toString(),
      icon: Clock,
      change: calculateChange(pendingRequests, pendingRequests + 2), // Compare with previous count
      color: "rose"
    },
    {
      title: translations.admin.stats.monthlyRevenue,
      value: isLoading ? "..." : `${monthlyRevenue.toLocaleString()} DH`,
      icon: TrendingUp,
      change: calculateChange(monthlyRevenue, monthlyRevenue * 0.85), // Compare with last month
      color: "green"
    }
  ];

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

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