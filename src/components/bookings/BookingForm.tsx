'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
  priceType: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ serviceId, serviceName, price, priceType }) => {
  const router = useRouter();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    numberOfGuests: 1,
    specialRequests: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData({ ...formData, [name]: numValue });
    }
  };
  
  const calculateTotal = () => {
    if (priceType === 'hourly') {
      // Calculate hours between dates if applicable
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffHours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
        return price * diffHours;
      }
      return price;
    }
    return price;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!token) {
        throw new Error('You must be logged in to book a service');
      }
      
      // Validate dates
      if (!formData.startDate) {
        throw new Error('Please select a start date');
      }
      
      if (priceType === 'hourly' && !formData.endDate) {
        throw new Error('Please select an end date');
      }
      
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        
        if (end < start) {
          throw new Error('End date must be after start date');
        }
      }
      
      // Create booking object
      const bookingData = {
        serviceId,
        ...formData,
        totalPrice: calculateTotal()
      };
      
      // Make API call to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      const data = await response.json();
      
      // Redirect to booking confirmation page
      router.push(`/bookings/${data.booking._id}`);
      
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Book this Service</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              {priceType === 'hourly' ? 'Start Date & Time' : 'Date'} <span className="text-red-500">*</span>
            </label>
            <input
              type={priceType === 'hourly' ? 'datetime-local' : 'date'}
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={today}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          {priceType === 'hourly' && (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || today}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          )}
          
          <div>
            <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              id="numberOfGuests"
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleNumberChange}
              min="1"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Any special requirements or requests..."
            ></textarea>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Service</span>
              <span className="text-sm font-medium">{serviceName}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Price</span>
              <span className="text-sm font-medium">
                ${price} {priceType === 'hourly' ? '/ hour' : priceType === 'starting_at' ? 'starting at' : ''}
              </span>
            </div>
            
            <div className="border-t border-gray-200 my-2 pt-2"></div>
            
            <div className="flex justify-between items-center font-medium">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Book Now'}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            You won't be charged yet. We'll confirm availability with the service provider.
          </p>
        </div>
      </form>
    </div>
  );
};

export default BookingForm; 