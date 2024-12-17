import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface ShopStatus {
  id: number;
  isOpen: boolean;
  lastUpdated: string;
}

interface ShopAvailabilityContextType {
  isShopOpen: boolean;
  toggleShopAvailability: () => Promise<void>;
  isLoading: boolean;
  lastUpdated?: string;
}

const ShopAvailabilityContext = createContext<ShopAvailabilityContextType | undefined>(undefined);
const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/api`;
const MERCURE_URL = import.meta.env.VITE_MERCURE_PUBLIC_URL;

export function ShopAvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>();

  useEffect(() => {
    // Subscribe to Mercure hub for real-time updates
    const url = new URL(MERCURE_URL);
    url.searchParams.append('topic', 'shop-status');

    const eventSource = new EventSource(url, {
      withCredentials: false
    });

    eventSource.onmessage = (event) => {
      try {
        const data: ShopStatus = JSON.parse(event.data);
        console.log('Received shop status update:', data);
        setIsShopOpen(data.isOpen);
        setLastUpdated(data.lastUpdated);
      } catch (error) {
        console.error('Error parsing Mercure event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const toggleShopAvailability = async () => {
    try {
      setIsLoading(true);
      await axios.patch(
        `${API_URL}/shop/status/1`,
        { isOpen: !isShopOpen },
        {
          headers: {
            'Content-Type': 'application/merge-patch+json',
            'Accept': 'application/ld+json'
          }
        }
      );
      // Status update will come through Mercure
    } catch (error) {
      console.error('Error toggling shop status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ShopAvailabilityContext.Provider value={{
      isShopOpen,
      toggleShopAvailability,
      isLoading,
      lastUpdated
    }}>
      {children}
    </ShopAvailabilityContext.Provider>
  );
}

export function useShopAvailability() {
  const context = useContext(ShopAvailabilityContext);
  if (!context) {
    throw new Error('useShopAvailability must be used within a ShopAvailabilityProvider');
  }
  return context;
}
