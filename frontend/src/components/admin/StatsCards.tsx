import React, { useEffect, useState } from 'react';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface AnalyticsDTO {
  currentValue: number;
  previousValue: number;
  growth: number;
}

interface DashboardAnalytics {
  totalAppointments: AnalyticsDTO;
  completedAppointments: AnalyticsDTO;
  cancelledAppointments: AnalyticsDTO;
  revenue: AnalyticsDTO;
}

export default function StatsCards() {
  const { translations } = useLanguage();
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/analytics', {
          headers: {
            'accept': 'application/ld+json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 animate-pulse">
            <div className="h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: translations.admin.stats.totalAppointments,
      value: analytics.totalAppointments.currentValue.toString(),
      icon: Calendar,
      change: `${analytics.totalAppointments.growth > 0 ? '+' : ''}${analytics.totalAppointments.growth.toFixed(1)}%`,
      color: "blue"
    },
    {
      title: translations.admin.stats.completedAppointments,
      value: analytics.completedAppointments.currentValue.toString(),
      icon: Clock,
      change: `${analytics.completedAppointments.growth > 0 ? '+' : ''}${analytics.completedAppointments.growth.toFixed(1)}%`,
      color: "green"
    },
    {
      title: translations.admin.stats.cancelledAppointments,
      value: analytics.cancelledAppointments.currentValue.toString(),
      icon: Users,
      change: `${analytics.cancelledAppointments.growth > 0 ? '+' : ''}${analytics.cancelledAppointments.growth.toFixed(1)}%`,
      color: "rose"
    },
    {
      title: translations.admin.stats.monthlyRevenue,
      value: `${analytics.revenue.currentValue.toFixed(2)} DH`,
      icon: TrendingUp,
      change: `${analytics.revenue.growth > 0 ? '+' : ''}${analytics.revenue.growth.toFixed(1)}%`,
      color: "amber"
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