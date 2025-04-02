'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getBookings, Booking } from '@/lib/bookingClient';

export default function BookingsPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Redirect if not authenticated
    if (isAuthenticated === false) {
      router.push('/login?returnUrl=/bookings');
      return;
    }
    
    const fetchUserBookings = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedBookings = await getBookings(token);
        setBookings(fetchedBookings);
        setFilteredBookings(fetchedBookings);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserBookings();
    }
  }, [token, isAuthenticated, router]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === filter));
    }
  }, [filter, bookings]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl font-semibold">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6">
          <button
            className={`pb-4 px-1 font-medium text-sm ${
              filter === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`pb-4 px-1 font-medium text-sm ${
              filter === 'pending'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`pb-4 px-1 font-medium text-sm ${
              filter === 'confirmed'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button
            className={`pb-4 px-1 font-medium text-sm ${
              filter === 'completed'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`pb-4 px-1 font-medium text-sm ${
              filter === 'cancelled' || filter === 'rejected'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled/Rejected
          </button>
        </nav>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No bookings found</p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-blue-600 hover:text-blue-800 hover:underline"
            >
              View all bookings
            </button>
          )}
          <div className="mt-4">
            <Link
              href="/services"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Services
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="sm:flex sm:justify-between sm:items-start">
                  <div className="flex items-start">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
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
                      <h2 className="text-lg font-medium text-gray-900">{booking.service.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Booked for: {formatDate(booking.startDate)}
                      </p>
                      {booking.endDate && booking.startDate !== booking.endDate && (
                        <p className="text-sm text-gray-500">
                          To: {formatDate(booking.endDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      ${booking.totalPrice}
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4 flex justify-end">
                  <Link
                    href={`/bookings/${booking._id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 