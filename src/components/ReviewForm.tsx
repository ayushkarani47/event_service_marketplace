'use client';

import React, { useState } from 'react';
import { createReview, ReviewFormData } from '@/lib/reviewClient';
import { useAuth } from '@/context/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

interface ReviewFormProps {
  bookingId: string;
  serviceId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ bookingId, serviceId, onReviewSubmitted }: ReviewFormProps) {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (comment.trim() === '') {
      setError('Please enter a comment');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const reviewData: ReviewFormData = {
        booking: bookingId,
        rating,
        comment
      };
      
      await createReview(reviewData, token!);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                {(hoveredRating || rating) >= star ? (
                  <StarIcon className="h-8 w-8 text-yellow-400" />
                ) : (
                  <StarIconOutline className="h-8 w-8 text-gray-300" />
                )}
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience with this service..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
