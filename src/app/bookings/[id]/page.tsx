'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getBookingById, updateBookingStatus } from '@/lib/bookingClient';
import { Booking } from '@/lib/bookingClient';
import ReviewForm from '@/components/ReviewForm';
import { getServiceReviews, Review } from '@/lib/reviewClient';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [providerNotes, setProviderNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (isAuthenticated === false) {
      router.push(`/login?returnUrl=/bookings/${id}`);
      return;
    }
    
    const fetchBooking = async () => {
      if (!token || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedBooking = await getBookingById(id.toString(), token);
        setBooking(fetchedBooking);
        setProviderNotes(fetchedBooking.providerNotes || '');
        
        // Check if user has already reviewed this booking
        if (fetchedBooking.status === 'completed') {
          try {
            const serviceReviews = await getServiceReviews(fetchedBooking.service._id);
            const existingReview = serviceReviews.find(
              review => review.booking === id.toString() && review.customer?._id === user?._id
            );
            if (existingReview) {
              setUserReview(existingReview);
            }
          } catch (error) {
            console.error('Error fetching reviews:', error);
          }
        }
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBooking();
    }
  }, [id, token, isAuthenticated, router, user?._id, reviewSubmitted]);

  const handleStatusUpdate = async (newStatus: 'confirmed' | 'completed' | 'cancelled' | 'rejected') => {
    if (!token || !booking || !id) return;
    
    try {
      setStatusUpdateLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const updatedBooking = await updateBookingStatus(
        id.toString(), 
        newStatus, 
        token,
        providerNotes.trim() || undefined
      );
      
      setBooking(updatedBooking);
      setSuccessMessage(`Booking status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      setError(err.message || 'Failed to update booking status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setReviewSubmitted(true);
    setSuccessMessage("Thank you for your review!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl font-semibold">Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-lg text-red-700">
            {error || 'Booking not found'}
          </p>
          <Link href="/bookings" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to my bookings
          </Link>
        </div>
      </div>
    );
  }

  const isProvider = user && booking.service.provider && user._id === booking.service.provider;
  const isCustomer = user && booking.customer && user._id === booking.customer._id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        <Link 
          href="/bookings" 
          className="inline-block px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Back to Bookings
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{booking.service.title}</h2>
              <p className="text-sm text-gray-500 mt-1">Booking ID: {booking._id}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Service Details</h3>
              <div className="mt-2 flex items-center">
                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-200">
                  {booking.service.images && booking.service.images.length > 0 ? (
                    <Image
                      src={booking.service.images[0]}
                      alt={booking.service.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-500">
                      <span>No image</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <Link href={`/services/${booking.service._id}`} className="font-medium text-blue-600 hover:underline">
                    {booking.service.title}
                  </Link>
                  <p className="text-sm text-gray-700 mt-1">
                    ${booking.service.price} 
                    {booking.service.priceType === 'hourly' ? '/hour' : 
                     booking.service.priceType === 'starting_at' ? ' starting at' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                {isProvider ? 'Customer Information' : 'Your Information'}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-900">{booking.customer.firstName} {booking.customer.lastName}</p>
                <p className="text-sm text-gray-700">{booking.customer.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(booking.startDate)}</p>
                {booking.endDate && booking.startDate !== booking.endDate && (
                  <p className="text-sm text-gray-700">
                    To: {formatDate(booking.endDate)}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Number of Guests</h3>
                <p className="mt-1 text-sm text-gray-900">{booking.numberOfGuests}</p>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500">Special Requests</h3>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{booking.specialRequests}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500">Pricing</h3>
              <div className="mt-2 flex justify-between">
                <p className="text-sm text-gray-700">Total</p>
                <p className="text-sm font-medium text-gray-900">${booking.totalPrice}</p>
              </div>
            </div>

            {booking.providerNotes && (
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <h3 className="text-sm font-medium text-blue-800">Notes from Provider</h3>
                <p className="mt-1 text-sm text-blue-700 whitespace-pre-line">{booking.providerNotes}</p>
              </div>
            )}

            {/* Status Update Section for Providers */}
            {isProvider && booking.status === 'pending' && (
              <div className="border-t border-gray-200 pt-6 mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Respond to Booking Request</h3>
                
                <div className="mb-4">
                  <label htmlFor="providerNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    id="providerNotes"
                    value={providerNotes}
                    onChange={(e) => setProviderNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add any notes for the customer..."
                  ></textarea>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={statusUpdateLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-md py-2 px-4 text-sm font-medium focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {statusUpdateLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={statusUpdateLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-md py-2 px-4 text-sm font-medium focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {statusUpdateLoading ? 'Processing...' : 'Decline'}
                  </button>
                </div>
              </div>
            )}

            {/* Status Update Section for Providers - Confirmed Bookings */}
            {isProvider && booking.status === 'confirmed' && (
              <div className="border-t border-gray-200 pt-6 mb-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={statusUpdateLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 text-sm font-medium focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {statusUpdateLoading ? 'Processing...' : 'Mark as Completed'}
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Booking Option for Customers */}
            {isCustomer && (booking.status === 'pending' || booking.status === 'confirmed') && (
              <div className="border-t border-gray-200 pt-6 mb-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={statusUpdateLoading}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-md py-2 px-4 text-sm font-medium focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {statusUpdateLoading ? 'Processing...' : 'Cancel Booking'}
                  </button>
                </div>
              </div>
            )}

            {/* Review Section for Customers with Completed Bookings */}
            {isCustomer && booking.status === 'completed' && !userReview && !reviewSubmitted && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leave a Review</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Share your experience with this service to help other customers make informed decisions.
                </p>
                <ReviewForm 
                  bookingId={booking._id} 
                  serviceId={booking.service._id} 
                  onReviewSubmitted={handleReviewSubmitted} 
                />
              </div>
            )}

            {/* Show existing review */}
            {isCustomer && userReview && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Review</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${
                          star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {new Date(userReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{userReview.comment}</p>
                  
                  {userReview.reply && (
                    <div className="mt-3 bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs font-medium text-gray-900 mb-1">Response from service provider:</p>
                      <p className="text-sm text-gray-700">{userReview.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thank you message after submitting review */}
            {isCustomer && reviewSubmitted && !userReview && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-700 font-medium">Thank you for your review!</p>
                  <p className="text-green-600 text-sm mt-1">Your feedback helps improve our services and assists other customers.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}