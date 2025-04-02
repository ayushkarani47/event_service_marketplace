'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getServiceById, updateService } from '@/lib/serviceClient';

// Define categories
const categories = [
  { value: 'photography', label: 'Photography' },
  { value: 'catering', label: 'Catering' },
  { value: 'venue', label: 'Venue' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'decor', label: 'Decoration' },
  { value: 'other', label: 'Other' },
];

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, authToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    priceType: 'fixed',
    location: '',
    images: [''],
    features: [''],
    availability: ''
  });

  useEffect(() => {
    // Redirect if not authenticated or not a service provider
    if (isAuthenticated === false) {
      router.push('/login?returnUrl=' + encodeURIComponent(`/dashboard/services/edit/${id}`));
      return;
    }
    
    if (user && user.role !== 'provider' && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    // Fetch service data
    const fetchService = async () => {
      try {
        setLoading(true);
        const service = await getServiceById(id.toString());
        
        // Check if the user is the owner or an admin
        if (user && (user._id === service.provider._id || user.role === 'admin')) {
          // Format the data for the form
          setFormData({
            title: service.title || '',
            description: service.description || '',
            category: service.category || '',
            price: service.price?.toString() || '',
            priceType: service.priceType || 'fixed',
            location: service.location || '',
            images: service.images?.length ? service.images : [''],
            features: service.features?.length ? service.features : [''],
            availability: service.availability || ''
          });
        } else {
          setError('You do not have permission to edit this service');
        }
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError(err.message || 'Could not load service data');
      } finally {
        setLoading(false);
      }
    };

    if (id && isAuthenticated) {
      fetchService();
    }
  }, [id, user, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({ ...formData, price: value });
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    // Ensure there's always at least one image field
    setFormData({ 
      ...formData, 
      images: newImages.length ? newImages : [''] 
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeatureField = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    // Ensure there's always at least one feature field
    setFormData({ 
      ...formData, 
      features: newFeatures.length ? newFeatures : [''] 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Service title is required');
      }
      
      if (!formData.category) {
        throw new Error('Please select a category');
      }
      
      if (!formData.price) {
        throw new Error('Price is required');
      }
      
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }
      
      // Filter out empty values
      const processedData = {
        ...formData,
        price: Number(formData.price),
        images: formData.images.filter(img => img.trim() !== ''),
        features: formData.features.filter(feature => feature.trim() !== '')
      };
      
      if (!authToken) {
        throw new Error('Authentication token is missing');
      }
      
      await updateService(id.toString(), processedData, authToken);
      
      setSuccessMessage('Service updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/services');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error updating service:', err);
      setError(err.message || 'Failed to update service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl font-semibold">Loading service data...</div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-lg text-red-700">{error}</p>
        </div>
        <Link 
          href="/dashboard/services" 
          className="inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
        <Link 
          href="/dashboard/services" 
          className="inline-block px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Service Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Professional Wedding Photography"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe your service in detail"
              required
            ></textarea>
          </div>

          {/* Category and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  className="w-1/2 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 100"
                  required
                />
                <select
                  id="priceType"
                  name="priceType"
                  value={formData.priceType}
                  onChange={handleInputChange}
                  className="w-1/2 border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-l-0"
                  aria-label="Price type"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Per Hour</option>
                  <option value="starting_at">Starting At</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., New York, NY or Online"
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <p className="text-sm text-gray-500 mb-3">Add URLs for images that showcase your service</p>
            
            {formData.images.map((image, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-grow border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-3 py-2 bg-red-50 text-red-600 border border-gray-300 border-l-0 rounded-r-md hover:bg-red-100 focus:outline-none"
                  aria-label="Remove image field"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500 focus:outline-none flex items-center"
            >
              <span className="mr-1">+</span> Add Another Image
            </button>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <p className="text-sm text-gray-500 mb-3">List the key features of your service</p>
            
            {formData.features.map((feature, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="e.g., 4 hours of coverage"
                  className="flex-grow border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeFeatureField(index)}
                  className="px-3 py-2 bg-red-50 text-red-600 border border-gray-300 border-l-0 rounded-r-md hover:bg-red-100 focus:outline-none"
                  aria-label="Remove feature field"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addFeatureField}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500 focus:outline-none flex items-center"
            >
              <span className="mr-1">+</span> Add Another Feature
            </button>
          </div>

          {/* Availability */}
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <textarea
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Available weekends and evenings, book at least 2 weeks in advance"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href="/dashboard/services"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Updating...' : 'Update Service'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 