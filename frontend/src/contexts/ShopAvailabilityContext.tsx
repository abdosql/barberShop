import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface ShopAvailabilityContextType {
  isShopOpen: boolean;
  toggleShopAvailability: () => Promise<void>;
  isLoading: boolean;
}

const ShopAvailabilityContext = createContext<ShopAvailabilityContextType | undefined>(undefined);
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`;
const MERCURE_URL = import.meta.env.VITE_MERCURE_PUBLIC_URL || 'http://localhost:9999/.well-known/mercure';

export function ShopAvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShopStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/shop/status`);
      const status = response.data.member?.[0];
      if (status?.isOpen !== undefined) {
        setIsShopOpen(status.isOpen);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchShopStatus();

    // Subscribe to Mercure hub
    const url = new URL(MERCURE_URL);
    const scheme = url.protocol.replace(':', '');
    const host = window.location.hostname === 'localhost' ? 'localhost' : '54.37.66.72';
    console.log('Mercure URL:', MERCURE_URL);
    console.log('Subscribing to:', `${scheme}://${host}/shop-status/`);
    console.log('Topics:', `${scheme}://${host}/shop-status/`, `${scheme}://${host}/shop-status/{id}`);
    url.searchParams.append('topic', `${scheme}://${host}/shop-status/`);
    url.searchParams.append('topic', `${scheme}://${host}/shop-status/{id}`);

    const eventSource = new EventSource(url, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.isOpen !== undefined) {
        setIsShopOpen(data.isOpen);
        setIsLoading(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };

    // Cleanup
    return () => {
      eventSource.close();
    };
  }, []);

  const toggleShopAvailability = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `${API_URL}/shop/status/1`,
        { isOpen: !isShopOpen },
        {
          headers: {
            'Content-Type': 'application/merge-patch+json',
            'Accept': 'application/ld+json'
          }
        }
      );
      // Note: We don't need to setIsShopOpen here as it will come through Mercure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ShopAvailabilityContext.Provider value={{
      isShopOpen,
      toggleShopAvailability,
      isLoading
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
