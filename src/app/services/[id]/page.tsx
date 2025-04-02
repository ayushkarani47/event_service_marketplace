'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { StarIcon, MapPinIcon, UserIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import BookingForm from '@/components/bookings/BookingForm';

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
  provider: {
    _id: string;
    name: string;
    profileImage?: string;
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
  
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // In a real application, this would fetch data from the API
    const mockService: Service = {
      _id: id as string,
      title: 'Professional Photography Service',
      description: 'Capture your special moments with our professional photography services. We specialize in event photography including weddings, corporate events, and birthday parties. Our team uses high-end equipment to ensure the highest quality photos.',
      category: 'photography',
      price: 150,
      priceType: 'hourly',
      images: [
        'https://images.unsplash.com/photo-1537734552481-104f29e035df',
        'https://images.unsplash.com/photo-1566566650093-eef8434d9ffb',
      ],
      location: 'New York, NY',
      rating: 4.8,
      reviewCount: 24,
      provider: {
        _id: 'provider123',
        name: 'John Smith Photography',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        bio: 'Professional photographer with over 10 years of experience. Specializing in event and portrait photography.',
        location: 'New York, NY'
      }
    };

    const mockReviews: Review[] = [
      {
        _id: 'review1',
        rating: 5,
        comment: 'Amazing service! John was professional, punctual, and the photos turned out beautifully.',
        createdAt: '2023-06-15T14:30:00Z',
        customer: {
          _id: 'customer1',
          name: 'Sarah Johnson',
          profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
        }
      },
      {
        _id: 'review2',
        rating: 4,
        comment: 'Great photos and good service. Would recommend for any event.',
        reply: 'Thank you for your feedback! It was a pleasure working with you.',
        createdAt: '2023-05-22T10:15:00Z',
        customer: {
          _id: 'customer2',
          name: 'Michael Brown',
          profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
        }
      }
    ];

    setService(mockService);
    setReviews(mockReviews);
    setLoading(false);
    
    // Mock authentication state
    setIsLoggedIn(true);
    setUserRole('customer');
  }, [id]);

  const handleBookingSubmit = (bookingData: any) => {
    console.log('Booking submitted:', bookingData);
    
    // In a real app, this would call an API to create a booking
    alert('Booking created successfully! (This is a mock response)');
    
    // Redirect to bookings page
    // router.push('/bookings');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Service</h1>
        <p className="text-gray-600 mb-6">{error || 'Service not found'}</p>
        <button
          onClick={() => router.push('/services')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Services
        </button>
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image Gallery */}
              <div className="relative h-96 w-full">
                {service.images && service.images.length > 0 ? (
                  <Image
                    src={service.images[0]}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
              
              {/* Service Info */}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-5 w-5 ${
                              star < Math.floor(service.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="ml-2 text-sm text-gray-600">
                        {service.rating} ({service.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{getPriceText()}</div>
                </div>
                
                <div className="mt-4 flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{service.location}</span>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                  <p className="mt-2 text-gray-600 whitespace-pre-line">{service.description}</p>
                </div>
                
                {/* Provider Info */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900">About the Provider</h2>
                  <div className="mt-4 flex items-start">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                      {service.provider.profileImage ? (
                        <Image
                          src={service.provider.profileImage}
                          alt={service.provider.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gray-300 h-full w-full flex items-center justify-center">
                          <UserIcon className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-md font-medium text-gray-900">{service.provider.name}</h3>
                      {service.provider.location && (
                        <p className="text-sm text-gray-600">
                          <MapPinIcon className="inline-block h-4 w-4 mr-1" />
                          {service.provider.location}
                        </p>
                      )}
                      {service.provider.bio && (
                        <p className="mt-2 text-sm text-gray-600">{service.provider.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews</h2>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                          {review.customer.profileImage ? (
                            <Image
                              src={review.customer.profileImage}
                              alt={review.customer.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-gray-300 h-full w-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">{review.customer.name}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center mt-1">
                            {[0, 1, 2, 3, 4].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-4 w-4 ${
                                  star < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                          
                          {review.reply && (
                            <div className="mt-4 bg-gray-50 p-3 rounded-md">
                              <p className="text-xs font-medium text-gray-900 mb-1">Response from {service.provider.name}</p>
                              <p className="text-sm text-gray-600">{review.reply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet.</p>
              )}
            </div>
          </div>
          
          {/* Booking Form */}
          <div className="lg:col-span-1">
            {isLoggedIn && userRole === 'customer' ? (
              <div className="sticky top-24">
                <BookingForm
                  serviceId={service._id}
                  serviceName={service.title}
                  price={service.price}
                  onSubmit={handleBookingSubmit}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Interested in this service?</h2>
                <p className="text-gray-600 mb-6">
                  {!isLoggedIn
                    ? 'Please log in to book this service.'
                    : 'Only customers can book services.'}
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  {!isLoggedIn ? 'Log In to Book' : 'Switch to Customer Account'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage; 