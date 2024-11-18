import { useState, useEffect } from 'react';
import axios from 'axios';
import { HistoricalMetrics, Period, MetricChange } from '../types/stats';

export function useHistoricalStats(period: Period = 'month') {
  const [historicalData, setHistoricalData] = useState<HistoricalMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setMonth(startDate.getMonth() - 1);
      }

      const response = await axios.get(
        `http://localhost:8000/api/statistics/historical`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }
      );

      setHistoricalData(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch historical data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalMetrics();
  }, [period]);

  const calculateChange = (
    currentValue: number,
    metricKey: keyof HistoricalMetrics
  ): MetricChange => {
    if (historicalData.length < 2) {
      return {
        percentageChange: '0%',
        trend: 'neutral',
        value: 0,
      };
    }

    const previousValue = historicalData[historicalData.length - 2][metricKey] as number;
    const change = currentValue - previousValue;
    const percentageChange = previousValue !== 0 
      ? ((change / previousValue) * 100).toFixed(1)
      : '0';

    return {
      percentageChange: `${change >= 0 ? '+' : ''}${percentageChange}%`,
      trend: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
      value: change,
    };
  };

  return {
    historicalData,
    calculateChange,
    isLoading,
    error,
    refresh: fetchHistoricalMetrics,
  };
} 