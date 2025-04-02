'use client';

import React, { useState, useEffect } from 'react';
import ServiceCard from '@/components/services/ServiceCard';
import ServiceFilters from '@/components/services/ServiceFilters';

interface Service {
  _id: string;
  title: string;
  category: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'starting_at';
  location: string;
  rating: number;
  reviewCount: number;
  provider: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  images: string[];
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Mock data for demonstration
  useEffect(() => {
    // In a real application, this would fetch data from the API
    const mockServices: Service[] = [
      {
        _id: '1',
        title: 'Professional Photography Service',
        category: 'photography',
        price: 150,
        priceType: 'hourly',
        location: 'New York, NY',
        rating: 4.8,
        reviewCount: 24,
        provider: {
          _id: 'provider1',
          name: 'John Smith Photography',
          profileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1Y6UI3bLgJVstrm7JHp0SLKXpLEw4SqQXcA&s'
        },
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1Y6UI3bLgJVstrm7JHp0SLKXpLEw4SqQXcA&s']
      },
      {
        _id: '2',
        title: 'Elegant Wedding Venue',
        category: 'venue',
        price: 5000,
        priceType: 'fixed',
        location: 'Los Angeles, CA',
        rating: 4.5,
        reviewCount: 18,
        provider: {
          _id: 'provider2',
          name: 'Grand Ballroom Events',
          profileImage: 'https://images.unsplash.com/photo-1532489618490-4ce501a8104a'
        },
        images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed']
      },
      {
        _id: '3',
        title: 'Professional DJ Services',
        category: 'dj',
        price: 100,
        priceType: 'hourly',
        location: 'Chicago, IL',
        rating: 4.9,
        reviewCount: 32,
        provider: {
          _id: 'provider3',
          name: 'Mike\'s DJ Entertainment',
          profileImage: 'https://images.unsplash.com/photo-1543486958-d783bfbf7f8e'
        },
        images: ['https://images.unsplash.com/photo-1594623930572-300a3011d9ae']
      },
      {
        _id: '4',
        title: 'Luxury Catering Service',
        category: 'catering',
        price: 35,
        priceType: 'starting_at',
        location: 'Miami, FL',
        rating: 4.7,
        reviewCount: 41,
        provider: {
          _id: 'provider4',
          name: 'Gourmet Delights Catering',
          profileImage: 'https://images.unsplash.com/photo-1581349295148-a04d592eebaf'
        },
        images: ['https://images.unsplash.com/photo-1530062845289-9109b2c9c868']
      },
      {
        _id: '5',
        title: 'Event Decoration Services',
        category: 'decoration',
        price: 500,
        priceType: 'starting_at',
        location: 'Dallas, TX',
        rating: 4.6,
        reviewCount: 29,
        provider: {
          _id: 'provider5',
          name: 'Creative Decorations Inc.',
          profileImage: 'https://images.unsplash.com/photo-1509909756405-be0199881695'
        },
        images: ['https://images.unsplash.com/photo-1505236858219-8359eb29e329']
      },
      {
        _id: '6',
        title: 'Professional Makeup Artist',
        category: 'makeup',
        price: 120,
        priceType: 'fixed',
        location: 'New York, NY',
        rating: 4.9,
        reviewCount: 37,
        provider: {
          _id: 'provider6',
          name: 'Glam Squad Makeup',
          profileImage: 'https://images.unsplash.com/photo-1530653895439-4b332bd1b80c'
        },
        images: ['https://images.unsplash.com/photo-1543447318-5bfff33f1b0a']
      }
    ];

    setServices(mockServices);
    setFilteredServices(mockServices);
    setLoading(false);
  }, []);

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    
    let filtered = [...services];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        service =>
          service.title.toLowerCase().includes(searchTerm) ||
          service.category.toLowerCase().includes(searchTerm) ||
          service.location.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(service => service.category === filters.category);
    }
    
    // Apply location filter
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter(service => service.location.toLowerCase().includes(locationTerm));
    }
    
    // Apply price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(service => service.price >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(service => service.price <= Number(filters.maxPrice));
    }
    
    // Apply rating filter
    if (filters.minRating) {
      filtered = filtered.filter(service => service.rating >= Number(filters.minRating));
    }
    
    setFilteredServices(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Services</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Event Services</h1>
        </div>
        
        <ServiceFilters onFilterChange={handleFilterChange} />
        
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service._id}
                id={service._id}
                title={service.title}
                category={service.category}
                price={service.price}
                priceType={service.priceType}
                location={service.location}
                rating={service.rating}
                reviewCount={service.reviewCount}
                providerName={service.provider.name}
                providerImage={service.provider.profileImage}
                image={service.images[0]}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No services found</h2>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage; 