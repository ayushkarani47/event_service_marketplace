'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllServices } from '@/lib/serviceClient';
import { IService } from '@/models/Service';
import RatingDisplay from '@/components/RatingDisplay';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'photography', label: 'Photography' },
  { value: 'catering', label: 'Catering' },
  { value: 'venue', label: 'Venue' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'decor', label: 'Decoration' },
  { value: 'other', label: 'Other' },
];

// Client component that uses useSearchParams
function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    // Set initial filter values from URL
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const loc = searchParams.get('location') || '';
    const rating = searchParams.get('minRating') || '';
    const min = searchParams.get('minPrice') || '';
    const max = searchParams.get('maxPrice') || '';

    setSelectedCategory(category);
    setSearchTerm(search);
    setLocation(loc);
    setMinRating(rating);
    setMinPrice(min);
    setMaxPrice(max);

    // Fetch services
    fetchServices({
      category,
      search,
      location: loc,
      minRating: rating,
      minPrice: min,
      maxPrice: max,
    });
  }, [searchParams]);

  const fetchServices = async (filters: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedServices = await getAllServices(filters);
      setServices(fetchedServices);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchTerm) params.set('search', searchTerm);
    if (location) params.set('location', location);
    if (minRating) params.set('minRating', minRating);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    // Navigate to same page with filters
    router.push(`/services?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setLocation('');
    setMinRating('');
    setMinPrice('');
    setMaxPrice('');
    router.push('/services');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Services</h1>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Find the Perfect Service</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="searchTerm"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="City or area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                id="minRating"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (₹)
              </label>
              <input
                type="number"
                id="minPrice"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (₹)
              </label>
              <input
                type="number"
                id="maxPrice"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-xl font-semibold">Loading...</div>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search criteria to find more services.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link 
              key={service._id?.toString()} 
              href={`/services/${service._id}`}
              className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 bg-gray-200">
                {service.images && service.images.length > 0 ? (
                  <Image 
                    src={service.images[0]} 
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{service.category}</span>
                    <div className="bg-white text-xs font-semibold px-2 py-1 rounded-full text-blue-600">
                      ₹{service.price}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {service.location}
                  </div>
                  <RatingDisplay rating={service.rating} reviewCount={service.reviewCount} size="sm" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Loading fallback
function ServicesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Services</h1>
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold">Loading services...</div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesContent />
    </Suspense>
  );
}