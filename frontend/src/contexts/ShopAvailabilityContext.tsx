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

export function ShopAvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);  // Start with loading true

  const fetchShopStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/shop/status`);
      const status = response.data.member?.[0];
      if (status?.isOpen !== undefined) {
        setIsShopOpen(status.isOpen);
      }
    } finally {
      // Only set loading to false after initial fetch
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchShopStatus();

    // Set up polling
    const interval = setInterval(fetchShopStatus, 1000);
    return () => clearInterval(interval);
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
      if (response.data?.isOpen !== undefined) {
        setIsShopOpen(response.data.isOpen);
      }
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
