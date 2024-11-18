export interface HistoricalMetrics {
  date: Date;
  totalClients: number;
  todayAppointments: number;
  pendingRequests: number;
  monthlyRevenue: number;
}

export type Period = 'week' | 'month';

export interface MetricChange {
  percentageChange: string;
  trend: 'positive' | 'negative' | 'neutral';
  value: number;
}

export interface StatsMetrics {
  current: number;
  change: MetricChange;
  isLoading: boolean;
} 