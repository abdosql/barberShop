import { API_ENDPOINTS } from '../utils/api';

export const ServicesAPI = {
  getServices: async (token: string) => {
    const response = await fetch(`${API_ENDPOINTS.SERVICES}?page=1`, {
      headers: {
        'Accept': 'application/ld+json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },
  
  // Add other service-related API calls
};

export const TimeSlotsAPI = {
  getTimeSlots: async () => {
    const response = await fetch(`${API_ENDPOINTS.TIME_SLOTS}?page=1`, {
      headers: {
        'Accept': 'application/ld+json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch time slots');
    return response.json();
  },
  
  // Add other time slot-related API calls
};

// Add other API service objects as needed 