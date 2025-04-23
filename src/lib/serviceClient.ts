import { IService } from '@/models/Service';

// Use relative URL by default, which will work in both development and production
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  location: string;
  availability: {
    startDate: Date | string;
    endDate: Date | string;
  };
  features: string[];
}

// Get all services
export const getAllServices = async (filters: Record<string, string> = {}) => {
  try {
    // Build query string from filters
    const queryString = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `${API_URL}/services${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch services');
    }

    const data = await response.json();
    return data.services;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Get service by ID
export const getServiceById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch service');
    }

    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    throw error;
  }
};

// Create a new service
export const createService = async (serviceData: ServiceFormData, token: string) => {
  try {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create service');
    }

    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Update service
export const updateService = async (id: string, serviceData: Partial<ServiceFormData>, token: string) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update service');
    }

    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw error;
  }
};

// Delete service
export const deleteService = async (id: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete service');
    }

    return true;
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw error;
  }
};

// Get services by provider
export const getServicesByProvider = async (providerId: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/services?provider=${providerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch provider services');
    }

    const data = await response.json();
    return data.services;
  } catch (error) {
    console.error(`Error fetching services for provider ${providerId}:`, error);
    throw error;
  }
}; 