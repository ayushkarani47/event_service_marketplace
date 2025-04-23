'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { StarIcon, MapPinIcon, UserIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import BookingForm from '@/components/bookings/BookingForm';
import Link from 'next/link';
import { getServiceById } from '@/lib/serviceClient';
import { useAuth } from '@/context/AuthContext';
import ReviewList from '@/components/ReviewList';
import RatingDisplay from '@/components/RatingDisplay';

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'starting_at';
  images: string[];
  location: string;
  rating: number;
  reviewCount: number;
  features?: string[];
  availability?: {
    startDate: string;
    endDate: string;
  };
  provider: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    bio?: string;
    location?: string;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
  customer: {
    _id: string;
    name: string;
    profileImage?: string;
  };
}

const ServiceDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, isAuthenticated } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('Service ID is missing');
        }
        
        const fetchedService = await getServiceById(id.toString());
        setService(fetchedService);
        if (fetchedService.images && fetchedService.images.length > 0) {
          setSelectedImage(fetchedService.images[0]);
        }
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError(err.message || 'Failed to load service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Redirect to login page with a return URL
      router.push(`/login?returnUrl=/services/${id}`);
      return;
    }
    
    // Show the booking form
    setShowBookingForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl font-semibold">Loading service details...</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-lg text-red-700">
            {error || 'Service not found'}
          </p>
          <Link href="/services" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to all services
          </Link>
        </div>
      </div>
    );
  }

  const getPriceText = () => {
    switch (service.priceType) {
      case 'hourly':
        return `$${service.price}/hr`;
      case 'starting_at':
        return `Starting at $${service.price}`;
      default:
        return `$${service.price}`;
    }
  };

  const getProviderName = () => {
    if (!service.provider) return 'Provider';
    if (service.provider.firstName && service.provider.lastName) {
      return `${service.provider.firstName} ${service.provider.lastName}`;
    }
    if (service.provider.firstName) return service.provider.firstName;
    if (service.provider.lastName) return service.provider.lastName;
    return 'Provider';
  };

  const getProviderInitial = () => {
    if (!service.provider) return '?';
    if (service.provider.firstName) return service.provider.firstName.charAt(0);
    if (service.provider.lastName) return service.provider.lastName.charAt(0);
    return '?';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex text-sm text-gray-500">
          <li className="flex items-center">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <Link href="/services" className="hover:text-blue-600">Services</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium truncate">
            {service.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column - Images */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Main image */}
            <div className="relative h-96 bg-gray-200">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail images */}
            {service.images && service.images.length > 1 && (
              <div className="p-4 grid grid-cols-5 gap-2">
                {service.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`relative h-16 bg-gray-200 rounded-md overflow-hidden ${
                      selectedImage === image ? 'ring-2 ring-blue-500' : ''
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${service.title} - image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service details */}
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mr-4">{service.title}</h1>
              <div className="flex items-center">
                <RatingDisplay rating={service.rating} reviewCount={service.reviewCount} size="lg" />
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="text-gray-700 capitalize">{service.category}</div>
              <div className="text-gray-500">|</div>
              <div className="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {service.location}
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
            </div>

            {service.features && service.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {service.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.availability && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Availability</h2>
                <p className="text-gray-700">
                  {typeof service.availability === 'object' && service.availability.startDate && service.availability.endDate ? 
                    `Available from ${new Date(service.availability.startDate).toLocaleDateString()} to ${new Date(service.availability.endDate).toLocaleDateString()}` : 
                    String(service.availability)
                  }
                </p>
              </div>
            )}
            
            {/* Reviews Section */}
            <div className="mb-8">
              <ReviewList serviceId={service._id} />
            </div>
          </div>
        </div>

        {/* Right column - Booking and Provider Info */}
        <div className="lg:col-span-1">
          {/* Booking Section */}
          {showBookingForm ? (
            <BookingForm 
              serviceId={service._id}
              serviceName={service.title}
              price={service.price}
              priceType={service.priceType}
            />
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Price</h2>
                <div className="text-2xl font-bold text-blue-600">{getPriceText()}</div>
              </div>
              
              <p className="text-gray-500 mb-6">
                {service.priceType === 'hourly' 
                  ? 'per hour' 
                  : service.priceType === 'starting_at' 
                    ? 'starting at' 
                    : 'fixed price'}
              </p>

              <button
                onClick={handleBookNow}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Book Now
              </button>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                No payment required until service is confirmed
              </div>
            </div>
          )}

          {/* Provider Info Card */}
          {service.provider && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">About the Provider</h2>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 relative mr-4">
                  {service.provider.profilePicture ? (
                    <Image
                      src={service.provider.profilePicture}
                      alt={getProviderName()}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-medium text-xl">
                        {getProviderInitial()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{getProviderName()}</h3>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </div>
              
              {service.provider.bio && (
                <p className="text-gray-700 mb-4">{service.provider.bio}</p>
              )}
              
              <Link
                href={`/providers/${service.provider._id}`}
                className="inline-block text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage; 