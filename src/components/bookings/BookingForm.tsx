import React, { useState } from 'react';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
  onSubmit: (bookingData: BookingData) => void;
}

interface BookingData {
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ serviceId, serviceName, price, onSubmit }) => {
  const [bookingData, setBookingData] = useState<BookingData>({
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<BookingData>>({});

  const validateForm = () => {
    const newErrors: Partial<BookingData> = {};
    
    if (!bookingData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!bookingData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!bookingData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (bookingData.startTime && bookingData.endTime <= bookingData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(bookingData);
    }
  };

  // Calculate today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Book Service</h2>
      <h3 className="text-lg text-gray-700 mb-4">{serviceName}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="date"
              name="date"
              min={today}
              value={bookingData.date}
              onChange={handleInputChange}
              className={`w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <div className="relative">
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={bookingData.startTime}
                onChange={handleInputChange}
                className={`w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <div className="relative">
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={bookingData.endTime}
                onChange={handleInputChange}
                className={`w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={bookingData.notes}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any special requirements or instructions..."
          />
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Service Price:</span>
            <span className="font-medium">${price}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-lg">${price}</span>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Book Now
        </button>
      </form>
    </div>
  );
};

export default BookingForm; 