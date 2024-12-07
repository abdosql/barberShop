import React, { createContext, useContext, useState, useEffect } from 'react';

interface ShopAvailabilityContextType {
  isShopOpen: boolean;
  toggleShopAvailability: () => void;
}

const ShopAvailabilityContext = createContext<ShopAvailabilityContextType | undefined>(undefined);

export function ShopAvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [isShopOpen, setIsShopOpen] = useState(() => {
    // Get initial state from localStorage
    const saved = localStorage.getItem('shopAvailability');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    // Save to localStorage whenever state changes
    localStorage.setItem('shopAvailability', JSON.stringify(isShopOpen));
  }, [isShopOpen]);

  const toggleShopAvailability = () => {
    setIsShopOpen(prev => !prev);
  };

  return (
    <ShopAvailabilityContext.Provider value={{ isShopOpen, toggleShopAvailability }}>
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
