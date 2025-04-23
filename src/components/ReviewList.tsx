'use client';

import React, { useState, useEffect } from 'react';
import { getServiceReviews, Review } from '@/lib/reviewClient';
import { StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface ReviewListProps {
  serviceId: string;
}

export default function ReviewList({ serviceId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // We've updated getServiceReviews to return an empty array instead of throwing
        const data = await getServiceReviews(serviceId);
        setReviews(data);
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError('Unable to load reviews at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse text-gray-500">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center my-4">
        <p className="text-gray-500">No reviews yet. Be the first to review this service!</p>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        <div className="ml-4 flex items-center">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {averageRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {review.customer?.profileImage ? (
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={review.customer.profileImage}
                      alt={review.customer?.name || 'Customer'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {review.customer?.name ? review.customer.name.charAt(0).toUpperCase() : 'C'}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{review.customer?.name || 'Customer'}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                
                {review.reply && (
                  <div className="mt-4 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-medium text-gray-900 mb-1">Response from service provider:</p>
                    <p className="text-sm text-gray-700">{review.reply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
