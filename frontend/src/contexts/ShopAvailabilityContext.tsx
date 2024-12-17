import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface ShopAvailabilityContextType {
  isShopOpen: boolean;
  toggleShopAvailability: () => Promise<void>;
  isLoading: boolean;
}

const ShopAvailabilityContext = createContext<ShopAvailabilityContextType | undefined>(undefined);
const BASE_URL = import.meta.env.VITE_API_URL;
const MERCURE_URL = import.meta.env.VITE_MERCURE_PUBLIC_URL;
const MERCURE_HOST = import.meta.env.VITE_MERCURE_HOST;

export function ShopAvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShopStatus = async () => {
    try {
      console.log('Fetching shop status from:', `${BASE_URL}/api/shop/status`);
      const response = await axios.get(`${BASE_URL}/api/shop/status`);
      console.log('Shop status response:', response.data);
      const status = response.data['hydra:member']?.[0];
      if (status?.isOpen !== undefined) {
        setIsShopOpen(status.isOpen);
      }
    } catch (error) {
      console.error('Error fetching shop status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchShopStatus();

    // Subscribe to Mercure hub
    if (!MERCURE_URL || !MERCURE_HOST) {
      console.error('Mercure configuration missing:', { MERCURE_URL, MERCURE_HOST });
      return;
    }

    try {
      const url = new URL(MERCURE_URL);
      const scheme = url.protocol.replace(':', '');
      
      console.log('Mercure configuration:', {
        MERCURE_URL,
        MERCURE_HOST,
        scheme,
        topic: `${scheme}://${MERCURE_HOST}/shop-status`
      });
      
      url.searchParams.append('topic', `${scheme}://${MERCURE_HOST}/shop-status`);

      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received Mercure event:', data);
          if (data.isOpen !== undefined) {
            setIsShopOpen(data.isOpen);
          }
        } catch (error) {
          console.error('Error parsing Mercure event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
      };

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error('Error setting up Mercure:', error);
    }
  }, []);

  const toggleShopAvailability = async () => {
    try {
      const status = await axios.patch(`${BASE_URL}/api/shop/status/1`, {
        isOpen: !isShopOpen
      }, {
        headers: {
          'Content-Type': 'application/merge-patch+json'
        }
      });
      console.log('Toggle response:', status.data);
    } catch (error) {
      console.error('Error toggling shop availability:', error);
    }
  };

  return (
    <ShopAvailabilityContext.Provider value={{ isShopOpen, toggleShopAvailability, isLoading }}>
      {children}
    </ShopAvailabilityContext.Provider>
  );
}

export function useShopAvailability() {
  const context = useContext(ShopAvailabilityContext);
  if (context === undefined) {
    throw new Error('useShopAvailability must be used within a ShopAvailabilityProvider');
  }
  return context;
}
